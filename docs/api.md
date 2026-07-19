# API reference

HTTP API for extracting macronutrients from natural-language meal descriptions.

Base URL (local): `http://localhost:3001`  
Default port is `3001` (override with `PORT`). Port `3000` is typically used by local Langfuse.

> **Dev / local only.** There is no authentication. Do not expose this server publicly without auth and rate limiting — each request spends OpenRouter credits.

## Start the server

```bash
# from repo root
npm run dev
```

Health check:

```bash
curl -s http://localhost:3001/health
```

---

## `GET /health`

Liveness check.

### Response `200`

```json
{ "ok": true }
```

---

## `POST /macros`

Extracts structured macros for a meal description via an LLM. Traces the call in Langfuse (when configured).

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meal` | string | yes | Meal description, 1–3000 characters |
| `userId` | uuid | yes | Caller identity for Langfuse attribution |
| `sessionId` | uuid | yes | Session id for grouping traces |
| `model` | string | no | Model key (see [Models](#models)). Defaults to `haiku` |

### Example

```bash
curl -s -X POST http://localhost:3001/macros \
  -H 'content-type: application/json' \
  -d '{
    "meal": "2 eggs cooked in butter and 2 slices of toast",
    "sessionId": "00000000-0000-4000-8000-000000000001",
    "userId": "00000000-0000-4000-8000-000000000002",
    "model": "haiku"
  }'
```

### Response `200`

```json
{
  "macros": {
    "items": [
      {
        "name": "eggs",
        "quantity": 2,
        "calories": 140,
        "protein": 12,
        "fat": 10,
        "carbohydrates": 1,
        "fiber": 0
      }
    ],
    "total": {
      "calories": 140,
      "protein": 12,
      "fat": 10,
      "carbohydrates": 1,
      "fiber": 0
    },
    "assumptions": [
      "Assumed large eggs",
      "Assumed 1 tsp butter for cooking"
    ]
  },
  "traceId": "…",
  "cost": 0.0001
}
```

| Field | Type | Description |
|-------|------|-------------|
| `macros` | object | Structured extraction (see schema below) |
| `traceId` | string | Langfuse trace id |
| `cost` | number? | Request cost in USD when OpenRouter usage is available |

#### `macros` shape

Defined in `packages/shared` (`macroSchema`):

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Per-food breakdown (`name`, `quantity`, `calories`, `protein`, `fat`, `carbohydrates`, `fiber`) |
| `total` | object | Aggregated macros (same nutrient fields, no `name` / `quantity`) |
| `assumptions` | string[] | Assumptions the model made (spelling matches the schema) |

### Errors

Error bodies match `apiErrorSchema` (`{ "error": string }`) for `422` / `500`. A `400` currently returns the raw Zod validator result and is not a stable public contract.

| Status | When |
|--------|------|
| `400` | Body fails Zod validation (`meal`, uuids, unknown `model`, etc.) |
| `422` | Model could not produce valid structured output |
| `500` | Unexpected server / provider error |

---

## Models

Pass a **key** in `model`, not the full OpenRouter id. Keys are defined in `packages/shared/src/models.ts`:

| Key | OpenRouter model |
|-----|------------------|
| `haiku` (default) | `~anthropic/claude-haiku-latest` |
| `sonnet` | `~anthropic/claude-sonnet-latest` |
| `opus` | `~anthropic/claude-opus-latest` |
| `gpt4o` | `openai/gpt-4o` |
| `gpt4oMini` | `openai/gpt-4o-mini` |
| `o3Mini` | `openai/o3-mini` |
| `geminiFlash` | `google/gemini-2.5-flash-preview` |
| `geminiPro` | `google/gemini-2.5-pro-preview` |
| `deepseekV3` | `deepseek/deepseek-chat-v3` |
| `llama70b` | `meta-llama/llama-3.3-70b-instruct` |

---

## Privacy note

Meal text is sent to OpenRouter for inference and recorded in Langfuse traces (input/output) when observability is enabled.

## Testing

See the root README. Default suite is mocked (`npm test`); live OpenRouter smoke is `npm run test:live`.
