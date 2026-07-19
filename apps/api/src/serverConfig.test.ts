import { describe, it, expect } from "vitest";
import { resolveHostName } from "./serverConfig";

describe("resolveHostname", () => {
    it("defaults to loopback", () => {
        expect(resolveHostName()).toBe("127.0.0.1");
    })

    it("reads HOST", () => {
        expect(resolveHostName({ HOST: "example.com" })).toBe("example.com");
    })

    it("trims HOST", () => {
        expect(resolveHostName({ HOST: " example.com " })).toBe("example.com");
    })

    it("ignores empty HOST", () => {
        expect(resolveHostName({ HOST: "" })).toBe("127.0.0.1");
    })
    
    it("ignores undefined HOST", () => {
        expect(resolveHostName({ HOST: undefined })).toBe("127.0.0.1");
    })

    it("ignores null HOST", () => {
        expect(resolveHostName({ HOST: undefined as unknown as string })).toBe("127.0.0.1");
    })

    it("ignores whitespace HOST", () => {
        expect(resolveHostName({ HOST: " " })).toBe("127.0.0.1");
    })
})