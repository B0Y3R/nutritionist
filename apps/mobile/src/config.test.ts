import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));

import { getApiBaseUrl } from "../config";

describe("getApiBaseUrl", () => {
    it("defaults ios to localhost", () => {
        expect(getApiBaseUrl({}, "ios")).toBe("http://localhost:3001");
    });

    it("defaults android to 10.0.2.2", () => {
        expect(getApiBaseUrl({}, "android")).toBe("http://10.0.2.2:3001");
    });

    it("uses non-empty override", () => {
        expect(
            getApiBaseUrl({ EXPO_PUBLIC_API_URL: "http://192.168.1.5:3001" }, "android"),
        ).toBe("http://192.168.1.5:3001");
    });

    it("treats empty override as unset", () => {
        expect(getApiBaseUrl({ EXPO_PUBLIC_API_URL: "" }, "android")).toBe(
            "http://10.0.2.2:3001",
        );
    });
});
