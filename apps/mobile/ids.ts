import * as Crypto from "expo-crypto";

export type KvStorage = { 
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

const USER_KEY = "nutritionist:installUserId";

export function createIdHelpers(
    storage: KvStorage,
    randomUUID: () => string = () => Crypto.randomUUID(),
): { 
    getUserId: () => Promise<string>;
    getSessionId: () => Promise<string>;
} {
    let sessionId: string | null = null; 

    return { 
        async getUserId(): Promise<string> { 
            const existing = await storage.getItem(USER_KEY);
            if (existing) return existing;

            const newId = randomUUID();
            await storage.setItem(USER_KEY, newId);
            return newId;
        },
        async getSessionId(): Promise<string> { 
            if (!sessionId) sessionId = randomUUID();
            return sessionId;
        }
    };
};