# nutritionist

Monorepo for a nutritionist app. The backend uses LLMs to extract macronutrients from natural-language meal descriptions. Built with the [Vercel AI SDK](https://sdk.vercel.ai/), [OpenRouter](https://openrouter.ai/), and [Langfuse](https://langfuse.com/) for observability.

## What it does

- **`macro.ts`** — Sends a meal description to an LLM via OpenRouter and returns structured macro data (calories, protein, carbs, fat, fiber). Traces the request in Langfuse with token usage and cost.
- **`smoke.ts`** — Verifies the Langfuse integration is wired up correctly.

## Prerequisites

- Node.js 22+
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- An [OpenRouter API key](https://openrouter.ai/)

## Run Langfuse locally

This project sends traces to Langfuse. The easiest way to run it locally is via Docker using the official Langfuse repo.

```bash
git clone --depth=1 https://github.com/langfuse/langfuse.git
cd langfuse
docker compose up
```

Wait for the containers to start, then open [http://localhost:3000](http://localhost:3000).

1. Sign up for a local account (or log in).
2. Create a project.
3. Go to **Project Settings → API Keys** and copy your **public** and **secret** keys.

Keep Langfuse running in the background while you use this project. For production or advanced self-hosting options, see the [Langfuse self-hosting docs](https://langfuse.com/docs/deployment/self-host).

Alternatively, use [Langfuse Cloud](https://cloud.langfuse.com) and set `LANGFUSE_BASE_URL` to `https://cloud.langfuse.com`.

## Setup

```bash
git clone git@github.com:B0y3r/nutritionist.git
cd nutritionist
npm install
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `LANGFUSE_SECRET_KEY` | From Langfuse project settings |
| `LANGFUSE_PUBLIC_KEY` | From Langfuse project settings |
| `LANGFUSE_BASE_URL` | `http://localhost:3000` when using local Docker |

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
