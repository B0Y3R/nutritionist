import {
    macroSchema,
    DEFAULT_MODEL,
    resolveModel,
    type Macros,
    type ModelKey,
} from "@nutritionist/shared";
import { tracedGenerate } from "../llm/traced";

const SYSTEM_PROMPT = `Extract macros for each food item in the meal. State every assumptoin you make about quantity, size, or preparation in the assumptions array. use USDA values.`

export type ExtractArgs = {
    meal: string;
    userId: string;
    sessionId: string;
    model?: ModelKey;
};

export type ExtractResult = {
    macros: Macros;
    traceId: string;
    cost?: number; // total cost of the request in USD
};

export async function extractMacros({ meal, userId, sessionId, model }: ExtractArgs): Promise<ExtractResult> {
    const { object, cost, traceId } = await tracedGenerate({
        name: "macro-extract",
        model: resolveModel(model ?? DEFAULT_MODEL),
        schema: macroSchema,
        system: SYSTEM_PROMPT,
        prompt: meal,
        userId,
        sessionId,
        tags: ["nutritionist", "cloud"],
        traceName: "macro-extract",
    });

    return {
        macros: object,
        traceId,
        cost,
    };
}