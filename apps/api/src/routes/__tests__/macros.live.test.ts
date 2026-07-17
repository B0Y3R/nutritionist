import { describe, expect, it } from "vitest";
import { createApp } from "../../app";

const hasKey = Boolean(process.env.OPENROUTER_API_KEY);

describe.skipIf(!hasKey)("POST /macros (live)", () => {
    it("extracts macros from a real model call", async () => {
        const app = createApp();
        const res = await app.request("/macros", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                meal: "1 large egg",
                sessionId: "00000000-0000-4000-8000-000000000001",
                userId: "00000000-0000-4000-8000-000000000002",
                model: "haiku",
            }),
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.macros.items.length).toBeGreaterThan(0);
        expect(json.traceId).toBeTruthy();
    });
});
