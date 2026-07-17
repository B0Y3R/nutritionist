import { describe, expect, it } from "vitest";
import {
    ALLOWED_MODELS,
    DEFAULT_MODEL,
    OPENROUTER_MODELS,
    resolveModel,
} from "./models";

describe("models", () => {
    it("defaults to haiku", () => {
        expect(DEFAULT_MODEL).toBe("haiku");
    });

    it("resolveModel maps keys to OpenRouter ids", () => {
        expect(resolveModel("haiku")).toBe(OPENROUTER_MODELS.haiku);
        expect(resolveModel("haiku")).toContain("anthropic");
    });

    it("ALLOWED_MODELS matches OPENROUTER_MODELS keys", () => {
        expect([...ALLOWED_MODELS].sort()).toEqual(
            Object.keys(OPENROUTER_MODELS).sort(),
        );
    });
});
