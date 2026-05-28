# API Contract

## Overview

`POST /api/evaluate` is the single evaluation endpoint. It accepts an idea description and an evaluation mode, runs the Ship or Skip framework, and returns a structured `DecisionResult` containing a verdict, confidence score, scorecard, risks, and validation gaps.

The verdict is computed server-side from weighted dimension scores — never chosen by the model. See [Evaluation Framework](./evaluation-framework.md) for rubric details and scoring logic.

---

## Endpoint

```
POST /api/evaluate
Content-Type: application/json
```

No caller authentication is required. AI provider credentials are managed server-side via environment variables.

---

## Request

### Fields

| Field     | Type   | Required | Constraints                                   |
| --------- | ------ | -------- | --------------------------------------------- |
| `mode`    | string | Yes      | `"feature"` · `"change"` · `"concept"`        |
| `idea`    | string | Yes      | 1–2,000 characters                            |
| `context` | string | No       | Max 1,000 characters — additional context for the evaluation |

### Example

```json
{
  "mode": "feature",
  "idea": "Add bulk CSV export to the reporting dashboard. 18 enterprise customers have asked for it in support tickets over the last quarter; three said it is blocking procurement sign-off."
}
```

---

## Response

### Success — `200 OK`

The body is a `DecisionResult` object (not wrapped).

```json
{
  "verdict": "ship",
  "confidence": 81,
  "mode": "feature",
  "summary": "Strong enterprise demand with direct revenue linkage. Implementation scope is bounded and the problem is well-defined.",
  "scorecard": {
    "overallScore": 76,
    "spread": 11.2,
    "evidenceQuality": 85,
    "strongest": "evidence-of-need",
    "weakest": "risk-profile",
    "dimensions": [
      {
        "id": "evidence-of-need",
        "label": "Evidence of Need",
        "weight": 0.20,
        "score": 88,
        "band": "strong",
        "rationale": "18 named enterprise customers with support tickets and procurement blockage is concrete, quantified demand.",
        "signals": [
          { "type": "positive", "statement": "18 enterprise customers raised this in support tickets" },
          { "type": "positive", "statement": "3 deals are explicitly blocked on procurement sign-off" }
        ]
      }
    ]
  },
  "risks": [
    {
      "id": "risk-1",
      "severity": "medium",
      "statement": "Export volume and file size limits are undefined — large datasets may require async generation.",
      "linkedDimension": "implementation-cost"
    }
  ],
  "missingValidation": [
    {
      "question": "What is the maximum export size customers need?",
      "whyItMatters": "Determines whether synchronous or async generation is required.",
      "howToCheck": "Survey the 18 requesting customers for their typical dataset size.",
      "linkedDimension": "implementation-cost"
    }
  ],
  "refineRecommendation": null,
  "meta": {
    "model": "claude-sonnet-4-6",
    "latencyMs": 4821,
    "promptVersion": "feature@a1b2c3d4"
  }
}
```

### `DecisionResult` fields

| Field                  | Type                                     | Notes                                                              |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `verdict`              | `"ship"` · `"refine"` · `"skip"`         | Server-computed from dimension scores; not chosen by the model     |
| `confidence`           | number (0–100)                           | Server-computed from overall score, score spread, and evidence quality |
| `mode`                 | `"feature"` · `"change"` · `"concept"`  | Echoes the request mode                                            |
| `summary`              | string                                   | One-sentence evaluation summary (max 240 chars)                    |
| `scorecard.overallScore` | number (0–100)                         | Weighted sum of all dimension scores                               |
| `scorecard.spread`     | number                                   | Std dev of dimension scores — high spread reduces confidence       |
| `scorecard.evidenceQuality` | number (0–100)                      | Percentage of signals that are `positive` or `negative`            |
| `scorecard.dimensions` | array (7 items)                          | One entry per rubric dimension; set varies by mode                 |
| `scorecard.strongest`  | string                                   | ID of the highest-scoring dimension                                |
| `scorecard.weakest`    | string                                   | ID of the lowest-scoring dimension                                 |
| `risks`                | array (2–5 items)                        | Each item: `id`, `severity`, `statement`, `linkedDimension`        |
| `missingValidation`    | array (1–5 items)                        | Each item: `question`, `whyItMatters`, `howToCheck`, `linkedDimension` |
| `refineRecommendation` | object · `null`                          | Present only when `verdict === "refine"`; `null` otherwise         |
| `meta.model`           | string                                   | AI model used (e.g. `"claude-sonnet-4-6"`)                         |
| `meta.latencyMs`       | number                                   | Milliseconds from request to response                              |
| `meta.promptVersion`   | string                                   | Rubric version hash (e.g. `"feature@a1b2c3d4"`)                    |

**`scorecard.dimensions[n]` fields:**

| Field       | Type                                                              | Notes                                           |
| ----------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `id`        | string                                                            | Kebab-case dimension ID (e.g. `"evidence-of-need"`) |
| `label`     | string                                                            | Human-readable label                            |
| `weight`    | number (0–1)                                                      | All 7 weights in a mode sum to 1.0              |
| `score`     | number (0–100)                                                    |                                                 |
| `band`      | `"strong"` · `"reasonable"` · `"mixed"` · `"weak"` · `"counter"` | Score bucketed into a named band                |
| `rationale` | string                                                            | Model justification (max 300 chars)             |
| `signals`   | array (1–4)                                                       | Each: `type` (`"positive"` · `"negative"` · `"unknown"`) and `statement` |

**`refineRecommendation` fields** (when `verdict === "refine"`):

| Field               | Type           | Notes                                                              |
| ------------------- | -------------- | ------------------------------------------------------------------ |
| `whatsWrong`        | string[]       | 1–4 named weaknesses                                               |
| `improvements`      | array (1–4)    | Each: `action`, `targetDimension`, `expectedLift` (`"small"` · `"moderate"` · `"large"`) |
| `smallerExperiment` | string · `null` | Optional cheaper experiment to run before full commitment         |
| `reEvaluateWhen`    | string         | Specific signal that would change the verdict on re-submission     |

---

## Errors

Error responses are wrapped:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Try again in a few minutes.",
    "retryAfterMs": 187000
  }
}
```

`retryAfterMs` is only present on `rate_limited` responses.

### Status codes

| Status | `error.code`       | Cause                                                     |
| ------ | ------------------ | --------------------------------------------------------- |
| 400    | `invalid_input`    | Body missing required fields or fails validation          |
| 405    | `internal`         | Method other than `POST`                                  |
| 429    | `rate_limited`     | 10 requests / 5 min per IP exceeded (live mode only)      |
| 500    | `schema_violation` | Model output failed schema or tone validation             |
| 500    | `network_error`    | AI provider unreachable                                   |
| 500    | `internal`         | Unexpected server error                                   |
| 502    | `upstream_error`   | AI provider returned a non-2xx response                   |

### Error examples

**400 — missing or invalid field:**
```json
{ "error": { "code": "invalid_input", "message": "Required" } }
```

**429 — rate limited:**
```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Try again in a few minutes.",
    "retryAfterMs": 187000
  }
}
```

**502 — upstream API error:**
```json
{ "error": { "code": "upstream_error", "message": "API returned 401: ..." } }
```

---

## Runtime Behavior

### Deterministic evaluation mode

When `USE_MOCK_EVALUATIONS` is not set to the exact string `"false"`, the endpoint returns pre-built deterministic results for canonical example inputs without calling any AI provider.

This is the default behavior of the public deployment. Claude Mode in the app UI continues to work in this configuration, returning deterministic evaluation responses — indicated by the "Public AI Runtime: Paused" status banner. Configured environments with `USE_MOCK_EVALUATIONS=false` run live Claude evaluation through the full pipeline.

### Caching

Live mode caches results in memory by `(mode, idea)` for 24 hours. Identical submissions within the cache window return the stored result without a new AI call. The cache does not persist across server restarts or Vercel function invocations.

### Rate limiting

Live mode enforces 10 requests per 5 minutes per IP address (in-memory). The limit resets on server restart and does not apply in deterministic evaluation mode.

---

## CORS

The endpoint sets `Access-Control-Allow-Origin: *` and responds to `OPTIONS` preflight requests with `204 No Content`.
