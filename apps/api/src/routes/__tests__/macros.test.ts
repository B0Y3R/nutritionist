import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoObjectGeneratedError } from "ai";

vi.mock("../../services/macros", () => ({
    extractMacros: vi.fn(),
}));

import { extractMacros } from "../../services/macros";
import { createApp } from "../../app";

const extractMacrosMock = vi.mocked(extractMacros);

const validBody = {
    meal: "2 eggs and toast",
    sessionId: "00000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000002",
};

describe("GET /health", () => {
    it("returns ok", async () => {
        const app = createApp();
        const res = await app.request("/health");
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true });
    });
});

describe("POST /macros", () => {
    beforeEach(() => {
        extractMacrosMock.mockReset();
    });

    it("returns 200 with macros payload", async () => {
        extractMacrosMock.mockResolvedValue({
            macros: {
                items: [
                    {
                        name: "egg",
                        quantity: 2,
                        calories: 140,
                        protein: 12,
                        fat: 10,
                        carbohydrates: 1,
                        fiber: 0,
                    },
                ],
                total: {
                    calories: 140,
                    protein: 12,
                    fat: 10,
                    carbohydrates: 1,
                    fiber: 0,
                },
                assumptions: ["large eggs"],
            },
            traceId: "trace-1",
            cost: 0.001,
        });

        const app = createApp();
        const res = await app.request("/macros", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validBody),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.traceId).toBe("trace-1");
        expect(json.macros.items).toHaveLength(1);
        expect(extractMacrosMock).toHaveBeenCalledWith({
            meal: validBody.meal,
            sessionId: validBody.sessionId,
            userId: validBody.userId,
            model: undefined,
        });
    });

    it("returns 400 for invalid body", async () => {
        const app = createApp();
        const res = await app.request("/macros", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ meal: "" }),
        });
        expect(res.status).toBe(400);
        expect(extractMacrosMock).not.toHaveBeenCalled();
    });

    it("returns 422 when structured output fails", async () => {
        extractMacrosMock.mockRejectedValue(
            new NoObjectGeneratedError({
                message: "parse failed",
                text: undefined,
                cause: undefined,
                response: {
                    id: "resp-1",
                    timestamp: new Date(),
                    modelId: "test-model",
                },
                usage: {
                    inputTokens: 0,
                    outputTokens: 0,
                    totalTokens: 0,
                    inputTokenDetails: {
                        noCacheTokens: 0,
                        cacheReadTokens: undefined,
                        cacheWriteTokens: undefined,
                    },
                    outputTokenDetails: {
                        textTokens: 0,
                        reasoningTokens: undefined,
                    },
                },
                finishReason: "stop",
            }),
        );

        const app = createApp();
        const res = await app.request("/macros", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validBody),
        });

        expect(res.status).toBe(422);
        expect(await res.json()).toEqual({ error: "could not parse that meal" });
    });

    it("returns 500 on unexpected errors", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        extractMacrosMock.mockRejectedValue(new Error("boom"));

        const app = createApp();
        const res = await app.request("/macros", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validBody),
        });

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: "internal server error" });
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });
});
