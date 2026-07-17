import { generateText, Output } from "ai";
import { propagateAttributes, startObservation } from "@langfuse/tracing";
import type { z } from "zod";
import { openrouter } from "./providers";
import { langfuseSpanProcessor } from "../../instrumentation";

type TracedArgs<T extends z.ZodTypeAny> = {
    name: string;
    model: string;
    schema: T;
    system?: string;
    prompt: string;
    userId?: string;
    sessionId?: string;
    tags?: string[];
    traceName?: string;
};

interface UsageDetails {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cost?: number;
}

export async function tracedGenerate<T extends z.ZodTypeAny>(
    args: TracedArgs<T>,
): Promise<{ object: z.infer<T>; cost?: number; traceId: string }> {
    const { name, model, schema, system, prompt, userId, sessionId, tags, traceName } = args;

    return propagateAttributes(
        { traceName: traceName ?? name, userId, sessionId, tags },
        async () => {
            const gen = startObservation(name, { model, input: prompt }, { asType: "generation" });

            try {
                const { output, finalStep } = await generateText({
                    model: openrouter(model),
                    system,
                    prompt,
                    output: Output.object({ schema }),
                });

                if (output == null) {
                    throw new Error("Model returned no structured output");
                }

                const usage = finalStep.providerMetadata?.openrouter?.usage as UsageDetails | undefined;

                if (!usage) {
                    console.warn("No usage details found");
                }

                gen.update({
                    output,
                    usageDetails: {
                        input: usage?.promptTokens ?? 0,
                        output: usage?.completionTokens ?? 0,
                        total: usage?.totalTokens ?? 0,
                    },
                    costDetails: {
                        total: usage?.cost ?? 0,
                    },
                }).end();

                await langfuseSpanProcessor.forceFlush();

                return {
                    object: output as z.infer<T>,
                    cost: usage?.cost,
                    traceId: gen.traceId,
                };
            } catch (error) {
                gen.update({ level: "ERROR", statusMessage: String(error) }).end();
                await langfuseSpanProcessor.forceFlush();
                throw error;
            }
        },
    );
}
