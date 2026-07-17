# nutritionist

Monorepo for a nutritionist app. The backend uses LLMs to extract macronutrients from natural-language meal descriptions. Built with the [Vercel AI SDK](https://sdk.vercel.ai/), [OpenRouter](https://openrouter.ai/), and [Langfuse](https://langfuse.com/) for observability.

## What it does

- **`POST /macros`** — HTTP API that extracts structured macros (calories, protein, carbs, fat, fiber) from a meal description. Full contract: [docs/api.md](docs/api.md).
- **`apps/api/macro.ts`** — Standalone script for the same extraction flow (useful without running the server).
- **`apps/api/smoke.ts`** — Verifies the Langfuse integration is wired up correctly.

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
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your credentials:

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `LANGFUSE_SECRET_KEY` | From Langfuse project settings |
| `LANGFUSE_PUBLIC_KEY` | From Langfuse project settings |
| `LANGFUSE_BASE_URL` | `http://localhost:3000` when using local Docker |
| `PORT` | API port (default `3001`; `3000` is usually Langfuse) |

## Usage

### HTTP API

```bash
npm run dev
```

```bash
curl -s -X POST http://localhost:3001/macros \
  -H 'content-type: application/json' \
  -d '{
    "meal": "2 eggs cooked in butter and 2 slices of toast",
    "sessionId": "00000000-0000-4000-8000-000000000001",
    "userId": "00000000-0000-4000-8000-000000000002"
  }'
```

See **[docs/api.md](docs/api.md)** for all routes, request/response shapes, errors, and model keys.

### Scripts

Verify Langfuse tracing:

```bash
npm run smoke
```

Extract macros without the HTTP server:

```bash
npm run macro
```

Check your Langfuse dashboard for traces after either command runs.

## Testing

```bash
# Mocked unit + route tests (default CI)
npm test

# Optional live OpenRouter smoke (requires apps/api/.env)
npm run test:live
```

Default tests never call OpenRouter. Live tests are skipped when `OPENROUTER_API_KEY` is unset.

## Project structure

```
.
├── apps/
│   └── api/
│       ├── src/                 # Hono HTTP server (routes, services, LLM)
│       ├── instrumentation.ts   # OpenTelemetry + Langfuse span processor
│       ├── macro.ts             # Standalone LLM macro extraction script
│       ├── smoke.ts             # Langfuse connectivity smoke test
│       ├── .env.example         # Environment variable template
│       └── package.json
├── packages/
│   └── shared/                  # Zod schemas + model allowlist
├── docs/
│   └── api.md                   # HTTP API reference
├── .github/workflows/ci.yml     # npm test on push/PR
└── package.json                 # Workspace root
```

## Stack

- [ai](https://sdk.vercel.ai/) — Vercel AI SDK
- [@openrouter/ai-sdk-provider](https://openrouter.ai/) — OpenRouter model provider
- [@langfuse/otel](https://langfuse.com/docs) + [@langfuse/tracing](https://langfuse.com/docs) — LLM observability
- [Hono](https://hono.dev/) + [Zod](https://zod.dev/) — HTTP API and validation

## License

ISC
