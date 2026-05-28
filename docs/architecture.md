# Architecture

## Request Pipeline

Every evaluation follows a single linear path from user input to rendered result.

```
Browser (React)
  Mode selector  ·  Idea textarea  ·  Submit button
        │
        │  POST /api/evaluate  { mode, idea }
        ▼
api/evaluate.ts
  1. Validate request       Zod — rejects malformed input early
  2. Assemble prompt        prompts/system.md
                          + prompts/{feature|change|concept}.md
  3. Call Claude            Anthropic API (or company gateway)
  4. Extract + validate     JSON parse → Zod schema check
                            7 dimensions, typed signals, char limits
  5. Compute verdict        overallScore = Σ(score × weight)
                            Ship | Refine | Skip  (deterministic)
                            confidence  = f(score, spread, evidence)
  6. Return DecisionResult
        │
        ▼
Browser (React)
  Verdict card  ·  Scorecard  ·  Risks  ·  Validation gaps
  Suggested Direction panel   (Refine verdicts only)
  Copy to Markdown
```

---

## Provider Modes

Ship or Skip supports two AI provider configurations controlled by `USE_COMPANY_GATEWAY`. Both modes produce identical evaluation output — only the transport layer differs.

### Direct Anthropic (`USE_COMPANY_GATEWAY=false`)

Used for the public Vercel deployment — no corporate network dependency.

```
Vercel Serverless Function
  └─→ Anthropic API  /v1/messages  (native format)
        └─→ Claude
```

- Uses `ANTHROPIC_API_KEY` with `anthropic-version: 2023-06-01`
- `system` is a top-level field in the request
- Model name is a standard Anthropic identifier (e.g. `claude-sonnet-4-6`)

### Company Gateway (`USE_COMPANY_GATEWAY=true`)

For internal development and enterprise environments routing AI traffic through a managed gateway.

```
Developer Machine
  └─→ Company AI Gateway  /v1/chat/completions  (OpenAI-compatible)
        └─→ Claude
```

- Uses `COMPANY_GATEWAY_URL` and `COMPANY_GATEWAY_KEY`
- OpenAI-compatible format (`system` in messages array)
- Model name is a gateway alias (e.g. `claude-quality`)
- Suited for access control, audit logging, and corporate network policies

### Why This Separation

| Concern                  | How it's addressed                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Enterprise compatibility | Internal teams keep all AI traffic inside a managed gateway                                     |
| Public deployment        | The Vercel deployment has no dependency on a corporate network or gateway                       |
| Environment isolation    | Gateway credentials never reach the public deployment; Anthropic keys never appear in internal configs |
| Credential rotation      | One env var switch changes providers; no code changes or redeploys needed                       |

---

## Key Design Decisions

**The model does not choose the verdict.**  
Claude scores dimensions; the server applies a weighted formula and emits `ship`, `refine`, or `skip` deterministically. Verdicts are auditable and reproducible — the model cannot override the framework or rationalize a weak idea into a Ship.

**Strict output schema.**  
Model output is rejected if it fails Zod validation — the UI never renders partial or structurally incorrect data. String-length limits, enum constraints, and array bounds are enforced before the result is assembled.

**Sanitization before validation.**  
Prose fields are whitespace-normalised and length-capped before Zod runs, so slightly verbose model output doesn't cause brittle validation failures.

**Single process in development.**  
Frontend and API run on the same port via Vite SSR middleware — no separate backend to start. In production, `api/evaluate.ts` deploys as a Vercel serverless function with no code changes.

**Prompt files are hot-reloadable.**  
Prompt `.md` files are read fresh on every call. Editing a prompt takes effect on the next evaluation without restarting the server.

**Mock mode is a first-class runtime.**  
Five pre-built results cover all three modes and all three verdict outcomes. The full UI runs without any API key or network access. `USE_MOCK_EVALUATIONS` defaults to active — the app never calls an AI provider by accident.

**In-memory result cache.**  
The server caches results by `(mode, idea)` for 24 hours, avoiding duplicate API calls within a session. On Vercel, the cache does not persist between function invocations.

**Rate limiting.**  
The evaluation handler enforces 10 requests per 5 minutes per IP in memory to guard against API credit exhaustion in shared or public deployments.

---

## Technical Highlights

| Area                                 | Detail                                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Dual-provider AI abstraction         | A single evaluation pipeline routes to either a company gateway or Anthropic directly — switched by one env var                       |
| Structured JSON evaluation pipeline  | Model output must satisfy a strict Zod schema before any result is assembled; malformed responses are rejected at the boundary        |
| Deterministic verdict computation    | `Ship`, `Refine`, or `Skip` is computed from a weighted formula over 7 dimension scores — the model cannot influence the outcome      |
| Sanitization layer before validation | Prose fields are whitespace-normalised and length-capped so slightly verbose model output doesn't trigger brittle validation failures  |
| Production-safe environment separation | Gateway credentials and Anthropic keys live in separate env configs; neither environment has access to the other's secrets            |

---

## Project Structure

```
ship-or-skip/
├── api/
│   ├── evaluate.ts        # Evaluation handler; Vercel serverless function entry point
│   ├── prompts.ts         # Loads and assembles system + mode prompt files
│   ├── rubrics.ts         # Dimension definitions and weights per mode
│   ├── sanitize.ts        # Output normalisation: whitespace collapse + length cap
│   └── schema.ts          # Zod schemas for request validation and model output
│
├── prompts/
│   ├── system.md          # Base system prompt: role, tone, schema, verdict formula
│   ├── feature.md         # Feature mode rubric + 7-dimension output example
│   ├── change.md          # Change mode rubric + 7-dimension output example
│   └── concept.md         # Concept mode rubric + 7-dimension output example
│
├── src/
│   ├── components/
│   │   ├── feedback/      # LoadingState · RuntimeStatus
│   │   ├── input/         # InputSection · ModeTabs
│   │   ├── layout/        # Header · LandingNav
│   │   └── result/        # DecisionCard · ResultPanel · VerdictIcon · CopyEvaluationButton
│   ├── data/              # mockResults · examples · demoExamples
│   ├── hooks/             # useEvaluation — state machine: idle → loading → success / error
│   ├── lib/               # api fetch wrapper · cache · markdown builder · error helpers
│   └── types/             # api · decision · request
│
├── docs/
│   ├── evaluation-framework.md  # Rubric spec, weights, verdict formulas
│   ├── configuration.md         # Env vars, deployment, troubleshooting
│   ├── architecture.md          # This file
│   └── api-contract.md          # API request/response reference
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html
├── vite.config.ts         # Dev server + SSR middleware for /api/evaluate
├── package.json
├── tsconfig.json          # Project references: tsconfig.app.json + tsconfig.node.json
├── tsconfig.app.json      # Frontend TypeScript config
├── tsconfig.node.json     # API/backend TypeScript config
└── .env.example           # Environment variable template
```
