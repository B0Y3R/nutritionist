import { describe, expect, it, vi } from "vitest";
import { createIdHelpers, type KvStorage } from "./ids";

vi.mock("expo-crypto", () => ({
    randomUUID: () => "should-not-be-used",
}));

function memoryStorage(): KvStorage {
    const map = new Map<string, string>();
    return {
        getItem: async (key) => map.get(key) ?? null,
        setItem: async (key, value) => {
            map.set(key, value);
        },
        removeItem: async (key) => {
            map.delete(key);
        },
    };
}

describe("createIdHelpers", () => {
    it("creates and reuses userId", async () => {
        let n = 0;
        const ids = createIdHelpers(memoryStorage(), () => `id-${++n}`);
        const a = await ids.getUserId();
        const b = await ids.getUserId();
        expect(a).toBe("id-1");
        expect(b).toBe("id-1");
    });

    it("reuses sessionId within the same helpers instance", async () => {
        let n = 0;
        const ids = createIdHelpers(memoryStorage(), () => `id-${++n}`);
        expect(await ids.getSessionId()).toBe("id-1");
        expect(await ids.getSessionId()).toBe("id-1");
    });

    it("uses separate counters for userId and sessionId", async () => {
        let n = 0;
        const ids = createIdHelpers(memoryStorage(), () => `id-${++n}`);
        expect(await ids.getUserId()).toBe("id-1");
        expect(await ids.getSessionId()).toBe("id-2");
    });
});
