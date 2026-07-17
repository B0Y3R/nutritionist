import { z } from "zod";
import { ALLOWED_MODELS } from "./models";

// Note: avoid .nonnegative() / .min() on numbers — Anthropic structured outputs
// reject JSON Schema `minimum` on number types.
const nonNeg = z.number().describe("non-negative number");

export const foodItemSchema = z.object({
    name: z.string(),
    quantity: nonNeg,
    calories: nonNeg,
    protein: nonNeg,
    fat: nonNeg,
    carbohydrates: nonNeg,
    fiber: nonNeg,
}).strict();

export const macroSchema = z.object({
    items: z.array(foodItemSchema).min(1),
    total: foodItemSchema.omit({ name: true, quantity: true }),
    assumtions: z.array(z.string()), // assumptions about meal (1tbsp of butter, 1 cup of rice, etc.)
});

export const macroRequestSchema = z.object({
    meal: z.string().min(1).max(3000),
    sessionId: z.uuid(),
    model: z.enum(ALLOWED_MODELS).optional(),
    userId: z.uuid(),
});

export type Macros = z.infer<typeof macroSchema>;
