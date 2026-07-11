# nutritionist-backend

Backend for a nutritionist app that uses LLMs to extract macronutrients from natural-language meal descriptions. Built with the [Vercel AI SDK](https://sdk.vercel.ai/), [OpenRouter](https://openrouter.ai/), and [Langfuse](https://langfuse.com/) for observability.

## What it does

- **`macro.ts`** — Sends a meal description to an LLM via OpenRouter and returns structured macro data (calories, protein, carbs, fat, fiber). Traces the request in Langfuse with token usage and cost.
- **`smoke.ts`** — Verifies the Langfuse integration is wired up correctly.

## Prerequisites

- Node.js 18+
- An [OpenRouter API key](https://openrouter.ai/)
- A [Langfuse](https://langfuse.com/) project (self-hosted or cloud)

## Setup

```bash
git clone git@github.com:YOUR_USER/nutritionist-backend.git
cd nutritionist-backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `LANGFUSE_SECRET_KEY` | Langfuse secret key |
| `LANGFUSE_PUBLIC_KEY` | Langfuse public key |
| `LANGFUSE_BASE_URL` | Langfuse host (e.g. `http://localhost:3000` or `https://cloud.langfuse.com`) |

## Usage

Verify Langfuse tracing:

```bash
npx tsx smoke.ts
```

Extract macros from a meal description:

```bash
npx tsx macro.ts
```

Check your Langfuse dashboard for traces after either command runs.

## Project structure

```
.
├── instrumentation.ts   # OpenTelemetry + Langfuse span processor
├── macro.ts             # LLM macro extraction with cost tracking
├── smoke.ts             # Langfuse connectivity smoke test
├── .env.example         # Environment variable template
└── package.json
```

## Stack

- [ai](https://sdk.vercel.ai/) — Vercel AI SDK
- [@openrouter/ai-sdk-provider](https://openrouter.ai/) — OpenRouter model provider
- [@langfuse/otel](https://langfuse.com/docs) + [@langfuse/tracing](https://langfuse.com/docs) — LLM observability
- [Hono](https://hono.dev/) + [Zod](https://zod.dev/) — planned for the HTTP API layer

## License

ISC
