import { describe, expect, it } from "vitest";
import { macroRequestSchema, macroSchema } from "./shemas";

const validUuid = "00000000-0000-4000-8000-000000000001";

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

    it("accepts omiting model", () => {
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
        const parsed = macroSchema.parse({
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
            assumtions: ["Assumed large egg"],
        });
        expect(parsed.items).toHaveLength(1);
        expect(parsed.assumtions[0]).toContain("large");
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
            assumtions: [],
        });
        expect(result.success).toBe(false);
    });
});
