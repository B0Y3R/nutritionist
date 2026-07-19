import { describe, expect, it } from "vitest";
import {
    apiErrorSchema,
    macroRequestSchema,
    macroResponseSchema,
    macroSchema,
} from "./schemas";

const validUuid = "00000000-0000-4000-8000-000000000001";

const validMacros = {
    items: [
        {
            name: "egg",
            quantity: 1,
            calories: 70,
            protein: 6,
            fat: 5,
            carbohydrates: 0,
            fiber: 0,
        },
    ],
    total: {
        calories: 70,
        protein: 6,
        fat: 5,
        carbohydrates: 0,
        fiber: 0,
    },
    assumptions: ["Assumed large egg"],
};

describe("macroRequestSchema", () => {
    it("accepts a valid request", () => {
        const parsed = macroRequestSchema.parse({
            meal: "2 eggs and toast",
            sessionId: validUuid,
            userId: validUuid,
            model: "haiku",
        });
        expect(parsed.meal).toBe("2 eggs and toast");
        expect(parsed.model).toBe("haiku");
    });

    it("accepts omitting model", () => {
        const parsed = macroRequestSchema.parse({
            meal: "salad",
            sessionId: validUuid,
            userId: validUuid,
        });
        expect(parsed.model).toBeUndefined();
    });

    it("rejects empty meal", () => {
        const result = macroRequestSchema.safeParse({
            meal: "",
            sessionId: validUuid,
            userId: validUuid,
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid uuid", () => {
        const result = macroRequestSchema.safeParse({
            meal: "toast",
            sessionId: "not-a-uuid",
            userId: validUuid,
        });
        expect(result.success).toBe(false);
    });

    it("rejects unknown model key", () => {
        const result = macroRequestSchema.safeParse({
            meal: "toast",
            sessionId: validUuid,
            userId: validUuid,
            model: "not-a-model",
        });
        expect(result.success).toBe(false);
    });
});

describe("macroSchema", () => {
    it("accepts a minimal valid macros object", () => {
        const parsed = macroSchema.parse(validMacros);
        expect(parsed.items).toHaveLength(1);
        expect(parsed.assumptions[0]).toContain("large");
    });

    it("rejects empty items", () => {
        const result = macroSchema.safeParse({
            items: [],
            total: {
                calories: 0,
                protein: 0,
                fat: 0,
                carbohydrates: 0,
                fiber: 0,
            },
            assumptions: [],
        });
        expect(result.success).toBe(false);
    });
});

describe("macroResponseSchema", () => {
    it("accepts a valid macro response envelope", () => {
        const parsed = macroResponseSchema.parse({
            macros: validMacros,
            traceId: "trace-1",
            cost: 0.001,
        });
        expect(parsed.traceId).toBe("trace-1");
    });

    it("accepts response without cost", () => {
        const parsed = macroResponseSchema.parse({
            macros: validMacros,
            traceId: "trace-1",
        });
        expect(parsed.cost).toBeUndefined();
    });

    it("rejects response missing traceId", () => {
        const result = macroResponseSchema.safeParse({
            macros: {
                ...validMacros,
                assumptions: [],
            },
        });
        expect(result.success).toBe(false);
    });
});

describe("apiErrorSchema", () => {
    it("accepts api error envelope", () => {
        expect(apiErrorSchema.parse({ error: "could not parse that meal" }).error).toContain(
            "parse",
        );
    });
});
