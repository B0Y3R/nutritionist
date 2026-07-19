import "../instrumentation";
import { serve } from "@hono/node-server";
import { app } from "./app";
import { resolveHostName } from "./serverConfig";

const port = Number(process.env.PORT) || 3001;
const host = resolveHostName();

const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`api listening on http://${host}:${info.port}`);
});

process.on("SIGINT", () => {
    server.close();
    process.exit(0);
});

process.on("SIGTERM", () => {
    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        process.exit(0);
    });
});
