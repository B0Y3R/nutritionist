import { Platform } from "react-native";

type Env = { EXPO_PUBLIC_API_URL?: string };

export function getApiBaseUrl(
    env: Env = process.env as Env,
    platform: typeof Platform.OS = Platform.OS,
): string { 
    const override = env.EXPO_PUBLIC_API_URL?.trim();
    if (override) return override.replace(/\/$/, "");

    if (platform == "android") return "http://10.0.2.2:3001";
    return "http://localhost:3001";
}