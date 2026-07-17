import "../instrumentation";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { macrosRoute } from "./routes/macros";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/macros", macrosRoute);

const port = Number(process.env.PORT) || 3001;

const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`api listening on http://localhost:${info.port}`);
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
