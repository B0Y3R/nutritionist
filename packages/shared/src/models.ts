export const OPENROUTER_MODELS = {
    // Anthropic
    opus: "~anthropic/claude-opus-latest",
    sonnet: "~anthropic/claude-sonnet-latest",
    haiku: "~anthropic/claude-haiku-latest",
    // OpenAI
    gpt4o: "openai/gpt-4o",
    gpt4oMini: "openai/gpt-4o-mini",
    o3Mini: "openai/o3-mini",
    // Google
    geminiFlash: "google/gemini-2.5-flash-preview",
    geminiPro: "google/gemini-2.5-pro-preview",
    // DeepSeek
    deepseekV3: "deepseek/deepseek-chat-v3",
    // Meta
    llama70b: "meta-llama/llama-3.3-70b-instruct",
} as const;

export type ModelKey = keyof typeof OPENROUTER_MODELS;
export type OpenRouterModelId = (typeof OPENROUTER_MODELS)[ModelKey];

export const ALLOWED_MODELS = Object.keys(OPENROUTER_MODELS) as [
    ModelKey,
    ...ModelKey[],
];

export const DEFAULT_MODEL: ModelKey = "haiku";

export function resolveModel(key: ModelKey): OpenRouterModelId {
    return OPENROUTER_MODELS[key];
}
