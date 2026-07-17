import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { NoObjectGeneratedError, NoOutputGeneratedError } from "ai";
import { macroRequestSchema } from "@nutritionist/shared";
import { extractMacros } from "../services/macros";

export const macrosRoute = new Hono();

macrosRoute.post("/", zValidator("json", macroRequestSchema), async (c) => {
    const { meal, sessionId, model, userId } = c.req.valid("json");

    try {
        const result = await extractMacros({ meal, sessionId, model, userId });
        return c.json(result);
    } catch (error) {
        if (
            NoObjectGeneratedError.isInstance(error) ||
            NoOutputGeneratedError.isInstance(error)
        ) {
            return c.json({ error: "could not parse that meal" }, 422);
        }
        console.error(error);
        return c.json({ error: "internal server error" }, 500);
    }
});
