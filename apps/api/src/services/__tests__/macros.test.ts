import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveModel } from "@nutritionist/shared";

vi.mock("../../llm/traced", () => ({
    tracedGenerate: vi.fn(),
}));

import { tracedGenerate } from "../../llm/traced";
import { extractMacros } from "../macros";

const tracedGenerateMock = vi.mocked(tracedGenerate);

describe("extractMacros", () => {
    beforeEach(() => {
        tracedGenerateMock.mockReset();
    });

    it("resolves model key and returns macros result", async () => {
        const macros = {
            items: [
                {
                    name: "toast",
                    quantity: 2,
                    calories: 200,
                    protein: 8,
                    fat: 2,
                    carbohydrates: 36,
                    fiber: 4,
                },
            ],
            total: {
                calories: 200,
                protein: 8,
                fat: 2,
                carbohydrates: 36,
                fiber: 4,
            },
            assumptions: [],
        };

        tracedGenerateMock.mockResolvedValue({
            object: macros,
            cost: 0.002,
            traceId: "t-1",
        });

        const result = await extractMacros({
            meal: "2 slices toast",
            userId: "00000000-0000-4000-8000-000000000001",
            sessionId: "00000000-0000-4000-8000-000000000002",
            model: "haiku",
        });

        expect(result).toEqual({
            macros,
            cost: 0.002,
            traceId: "t-1",
        });

        expect(tracedGenerateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                model: resolveModel("haiku"),
                prompt: "2 slices toast",
                name: "macro-extract",
            }),
        );
    });
});
