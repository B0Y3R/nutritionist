import "./instrumentation";
import { startActiveObservation } from "@langfuse/tracing";
import { langfuseSpanProcessor } from "./instrumentation";

async function main() { 
    await startActiveObservation("smoke-test", async (span) => {
        span.update({input: "Hello from smoke test", output: "it works"})
    });
    await langfuseSpanProcessor.forceFlush();
    console.log("Flushed - check the dashboard for results")
}

main(); 