import "./instrumentation";
import { generateText, ProviderMetadata } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { propagateAttributes, startObservation, type LangfuseGeneration } from "@langfuse/tracing";
import { langfuseSpanProcessor } from './instrumentation';

interface UsageDetails {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    cost?: number;
}

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY,extraBody: { usage: { include: true}} });

const anthropicModels: Record<string, string> = {
    opus: "~anthropic/claude-opus-latest",
    sonnet: "~anthropic/claude-sonnet-latest",
    haiku: "~anthropic/claude-haiku-latest",
} as const;

const MODEL = anthropicModels.opus;
const MEAL_TEXT_STRING = "4 eggs cooked with butter and 2 slices of Dave's Killer Bread Powerseed";
const SYSTEM_PROMPT_STRING = "Extract macros. Reply ONLY with JSON format. { calories, protien, carbs, fat, fiber} for each food item.";


function attachCostsToGeneration(generation: LangfuseGeneration, output: string | object, providerMetadata: ProviderMetadata | undefined) {
    const usageDetails = providerMetadata?.openrouter?.usage as UsageDetails | undefined;

    if (!usageDetails) {
        return;
    }

    generation.update({
        output: output,
        usageDetails: {
            input: usageDetails?.promptTokens ?? 0,
            output: usageDetails?.completionTokens ?? 0,
            total: usageDetails?.totalTokens ?? 0
        },
        costDetails: {
            total: usageDetails?.cost ?? 0
        }
    })  
    .end();
}

async function main() {
    await propagateAttributes(
        {
            traceName: "nutritionist-macro-lookup",
            userId: "demo-user",
            sessionId: "smoke-session-1",
            tags: ["nutritionist"]
        },
        async () => { 
            // 1.) open the generation manually 
            const generation = startObservation(
                "macro-extract",
                { model: MODEL, input: MEAL_TEXT_STRING },
                { asType: "generation"},
            )

            // 2.) make the call (no telemetry option, we own the observation now )
            const { output, providerMetadata } = await generateText({
                model: openrouter(MODEL),
                system:  SYSTEM_PROMPT_STRING,
                prompt: MEAL_TEXT_STRING,
            })


            // 3.) close it, attaching OpenRouters REAL cost 
            attachCostsToGeneration(generation, output, providerMetadata);
           

            console.log(output)
        }
    )
  
    await langfuseSpanProcessor.forceFlush();
}

main();
