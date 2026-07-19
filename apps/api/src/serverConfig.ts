export function resolveHostName(env: NodeJS.ProcessEnv = process.env): string { 
    const host = env.HOST?.trim();
    return host && host.length > 0 ? host : "127.0.0.1"; 
}