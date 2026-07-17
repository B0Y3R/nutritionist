import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const {
    generateText,
    forceFlush,
    update,
    startObservation,
    propagateAttributes,
} = vi.hoisted(() => {
    const update = vi.fn().mockReturnValue({ end: vi.fn() });
    return {
        generateText: vi.fn(),
        forceFlush: vi.fn().mockResolvedValue(undefined),
        update,
        startObservation: vi.fn(() => ({
            update,
            end: vi.fn(),
            traceId: "trace-abc",
        })),
        propagateAttributes: vi.fn((_attrs: unknown, fn: () => unknown) => fn()),
    };
});

vi.mock("ai", () => ({
    generateText,
    Output: {
        object: (opts: unknown) => opts,
    },
}));

vi.mock("@langfuse/tracing", () => ({
    propagateAttributes,
    startObservation,
}));

vi.mock("../../../instrumentation", () => ({
    langfuseSpanProcessor: { forceFlush },
}));

vi.mock("../../providers", () => ({
    openrouter: (model: string) => ({ modelId: model }),
}));

import { tracedGenerate } from "../traced";

const schema = z.object({
    hello: z.string(),
});

describe("tracedGenerate", () => {
    beforeEach(() => {
        generateText.mockReset();
        forceFlush.mockClear();
        update.mockClear();
        startObservation.mockClear();
        propagateAttributes.mockClear();
    });

    it("returns object, cost, and traceId", async () => {
        generateText.mockResolvedValue({
            output: { hello: "world" },
            finalStep: {
                providerMetadata: {
                    openrouter: {
                        usage: {
                            promptTokens: 10,
                            completionTokens: 5,
                            totalTokens: 15,
                            cost: 0.01,
                        },
                    },
                },
            },
        });

        const result = await tracedGenerate({
            name: "test-gen",
            model: "test-model",
            schema,
            prompt: "hi",
        });

        expect(result).toEqual({
            object: { hello: "world" },
            cost: 0.01,
            traceId: "trace-abc",
        });
        expect(forceFlush).toHaveBeenCalled();
    });

    it("throws when output is null", async () => {
        generateText.mockResolvedValue({
            output: null,
            finalStep: { providerMetadata: {} },
        });

        await expect(
            tracedGenerate({
                name: "test-gen",
                model: "test-model",
                schema,
                prompt: "hi",
            }),
        ).rejects.toThrow("Model returned no structured output");
    });
});
