import { Hono } from "hono";
import { macrosRoute } from "./routes/macros";

export function createApp() {
    const app = new Hono();
    app.get("/health", (c) => c.json({ ok: true }));
    app.route("/macros", macrosRoute);
    return app;
}

export const app = createApp();
