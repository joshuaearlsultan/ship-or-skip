# Ship or Skip

A pre-build decision engine for product teams. Submit a feature idea, a product change, or a strategic concept and receive a structured, evidence-based verdict — **Ship**, **Refine**, or **Skip** — in seconds.

---

## Quick Start

```bash
git clone https://github.com/joshuaearlsultan/ship-or-skip.git
cd ship-or-skip
npm install
```

**Run with mock data (no API key needed):**

```bash
npm run dev
# Open http://localhost:5173
# The app starts in Mock Mode — click Try Example for an instant result.
```

**Run with live Claude evaluations:**

```bash
cp .env.example .env.local
# Edit .env.local:
#   ANTHROPIC_API_KEY=sk-ant-api03-...  ← your key from console.anthropic.com
#   USE_MOCK_EVALUATIONS=false
npm run dev
```

Switch between Mock Mode and Claude Mode at any time using the badge in the top-right corner of the app. Mock mode requires no configuration and covers all three verdict outcomes.

---

## 60 Second Walkthrough

**1. Select a mode.**
Three tabs sit at the top of the input panel: **Feature Idea**, **Product Change**, and **Concept**. Pick the one that matches what you are evaluating. Each mode uses a different 7-dimension rubric calibrated to that decision type.

**2. Enter your idea.**
Describe the feature, change, or concept in the text area. Specific submissions produce specific signals — named users, data points, and concrete scope are more useful than vague descriptions. One to three sentences is sufficient. Click **Try Example** to load a pre-written idea for the current mode.

**3. Run the evaluation.**
Click **Run Ship or Skip**. Mock Mode returns a result instantly. Claude Mode takes three to ten seconds while the model scores all seven dimensions.

**4. Read the result.**
The verdict card shows the decision (**Ship**, **Refine**, or **Skip**), a confidence score, and a one-sentence summary. Click any dimension row in the scorecard to expand its rationale and signals. The Risks panel lists named concerns ordered by severity. Validation Gaps show what is unknown and how to resolve each gap. Refine verdicts include a Suggested Direction panel with named weaknesses, targeted improvements, and a specific re-evaluate trigger.

**5. Export.**
Click **Copy to Markdown** at the bottom of the result to copy the full evaluation — verdict, scorecard, risks, and validation gaps — as formatted Markdown ready to paste into a spec, Notion doc, or PR description.

---

## Overview

### What it does

Ship or Skip evaluates product ideas before engineering work begins. It scores each idea against a structured rubric, identifies risks, surfaces validation gaps, and produces a deterministic verdict driven by weighted dimension scores — not gut feeling or AI free-form opinion.

### Problem it solves

Most product teams make build-or-kill decisions informally: in Slack threads, in sprint planning, or from the loudest voice in the room. Ship or Skip forces a structured evaluation at the moment of ideation — before any design, estimation, or backlog entry happens.

### Why teams need it

- **Stops vanity features early.** Ideas framed as vague engagement bets score low on evidence-of-need and get a Skip before consuming roadmap space.
- **Surfaces what you don't know.** Every unknown signal becomes a concrete validation question with a linked dimension and a how-to-check action.
- **Makes reasoning portable.** Every evaluation exports to Markdown — ready for a spec, a stakeholder update, or a PR description.
- **Works across decision types.** Features, product changes, and strategic pivots each use a different rubric calibrated to what actually predicts success in that category.

### What makes Ship or Skip different?

Most AI tools return free-form opinions. Ship or Skip applies a fixed evaluation framework: the model scores seven named dimensions, and the verdict is computed server-side by a deterministic weighted formula. The same idea evaluated twice produces the same verdict. The model cannot override the framework, skip an inconvenient dimension, or justify a weak idea with a confident summary.

This matters for product decisions: you want a consistent, auditable signal — not a different answer depending on how you phrase the question.

---

## Features

| Feature                     | Description                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **AI-powered evaluation**   | Claude scores 7 weighted dimensions per mode, guided by a structured rubric and strict output schema                            |
| **Three verdicts**          | Ship, Refine, or Skip — computed deterministically from dimension scores, never from model opinion                              |
| **Risk identification**     | 2–5 named risks per evaluation, each linked to a specific rubric dimension and rated high / medium / low                        |
| **Validation gap analysis** | Missing evidence surfaces as concrete questions with a `whyItMatters` explanation and a `howToCheck` action                     |
| **Refine recommendations**  | When a verdict is Refine, the evaluation includes named weaknesses, targeted improvements, and a specific re-evaluation trigger |
| **Three evaluation modes**  | Feature Idea, Product Change, Concept — each with a distinct 7-dimension rubric                                                 |
| **Copy to Markdown**        | One-click export of the full evaluation including scorecard, risks, and validation gaps                                         |
| **Mock mode**               | Full UI test without an API key; five pre-built mock results cover all three modes and all three verdict outcomes                |
| **Dark mode**               | Persists to `localStorage`; respects `prefers-color-scheme` on first visit                                                      |
| **In-memory result cache**  | Identical `(mode, idea)` pairs return cached results for 24 hours, avoiding redundant API calls                                 |

---

## Screenshots

| Landing page | Demo page |
| --- | --- |
| ![Landing page](./docs/screenshots/landing.png) | ![Demo page — example decisions](./docs/screenshots/demo.png) |

| Ship verdict | Refine verdict | Skip verdict |
| --- | --- | --- |
| ![Ship](./docs/screenshots/verdict-ship.png) | ![Refine](./docs/screenshots/verdict-refine.png) | ![Skip](./docs/screenshots/verdict-skip.png) |

![Mock-blocked state](./docs/screenshots/mock-blocked.png)

> **To see it in action:** run `npm run dev` and click **Try Example** — no API key required. The Feature tab ships the bulk-export example, the Change tab refines the remove-comments example, and the Concept tab skips the AI-first pivot.

---

## Technology Stack

### Frontend

- **React 19** — UI components and state
- **TypeScript 6** — end-to-end type safety across frontend and API
- **Tailwind CSS v4** — utility-first styling via the Vite plugin
- **Vite 8** — dev server, HMR, and production build

### Backend

- **Vite SSR middleware** — `api/evaluate.ts` runs inside Vite's module graph; prompt file edits hot-reload without a server restart
- **Zod 4** — request validation and model output schema enforcement
- **Node.js** — serverless-compatible handler in `api/evaluate.ts`

### AI Integration

- **Anthropic Claude** — model is configurable via `ANTHROPIC_MODEL`; defaults to `claude-opus-4-5`
- **Plain HTTP (`fetch`)** — sends requests to `/v1/chat/completions` with the system prompt as a `role:"system"` message
- **Structured prompts** — `prompts/system.md` + mode-specific `prompts/{feature,change,concept}.md`, each containing a complete 7-dimension output example

### Deployment

- **Vercel** — `api/evaluate.ts` exports a standard Node.js handler and runs as a serverless function
- Static frontend assets served from `dist/` after `npm run build`

---

## Architecture Overview

Every evaluation follows a single linear path from user input to rendered result.

```
  Browser (React)
  ──────────────────────────────────────────────────────
  Mode selector  ·  Idea textarea  ·  Submit button
        │
        │  POST /api/evaluate  { mode, idea }
        ▼
  api/evaluate.ts
  ──────────────────────────────────────────────────────
   1  Validate request         Zod — rejects malformed input early
   2  Assemble prompt          prompts/system.md
                             + prompts/{feature|change|concept}.md
   3  Call Claude              POST /v1/chat/completions
                               role:"system" + role:"user"
   4  Extract + validate       JSON parse → Zod schema check
                               7 dimensions, typed signals, char limits
   5  Compute verdict          overallScore = Σ(score × weight)
                               Ship | Refine | Skip  (deterministic)
                               confidence  = f(score, spread, evidence)
   6  Return DecisionResult
        │
        ▼
  Browser (React)
  ──────────────────────────────────────────────────────
  Verdict card  ·  Scorecard  ·  Risks  ·  Validation gaps
  Suggested Direction panel   (Refine verdicts only)
  Copy to Markdown
```

**Key design decisions:**

- **The model does not choose the verdict.** Claude scores dimensions; `api/evaluate.ts` applies the weighted formula and emits `ship`, `refine`, or `skip` deterministically. This makes the verdict auditable and reproducible.
- **Strict output schema.** Model output is rejected if it fails Zod validation — the UI never renders partial or structurally incorrect data. String-length limits, enum constraints, and array bounds are all enforced before the result is assembled.
- **Single process in development.** The `POST /api/evaluate` handler runs inside Vite's SSR middleware — same port as the frontend, no separate server to start. In production it deploys as a Vercel serverless function with no changes to the handler code.
- **Prompt files are hot-reloadable.** `prompts/*.md` are read from disk on every request via `readFileSync`. Editing a prompt file takes effect on the next evaluation without restarting the dev server.

---

## Prerequisites

- **Node.js** ≥ 18 (for native `fetch` support)
- **npm** ≥ 9
- An **Anthropic API key** — obtain one at [console.anthropic.com](https://console.anthropic.com)

---

## Installation

```bash
git clone https://github.com/joshuaearlsultan/ship-or-skip.git
cd ship-or-skip
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env.local` before running the dev server. `.env.local` is gitignored and never committed.

```bash
cp .env.example .env.local
```

| Variable               | Required            | Default                     | Description                                                                                                                                            |
| ---------------------- | ------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ANTHROPIC_API_KEY`    | **Yes** (live mode) | —                           | Your Anthropic API key. Get one at [console.anthropic.com](https://console.anthropic.com). Not needed when running in mock mode.                       |
| `ANTHROPIC_BASE_URL`   | No                  | `https://api.anthropic.com` | Override the API base URL. Use this to point at a custom gateway or proxy. The application calls `/v1/chat/completions` on this base.                  |
| `ANTHROPIC_MODEL`      | No                  | `claude-opus-4-5`           | The model ID to request. Passed as the `model` field. Any model available on your key is valid.                                                        |
| `USE_MOCK_EVALUATIONS` | No                  | `true` (mock on)            | Set to exactly `"false"` to make live API calls. Any other value — including absent — keeps mock mode active. The app never calls the API by accident. |

### Example `.env.local` for live mode

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-opus-4-5
USE_MOCK_EVALUATIONS=false
```

> **Gateway note:** If `ANTHROPIC_BASE_URL` points to a proxy that is OpenAI-compatible, Ship or Skip handles this correctly. It sends the system prompt as a `role:"system"` message to `/v1/chat/completions`, not as Anthropic's native top-level `system` field.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set ANTHROPIC_API_KEY and USE_MOCK_EVALUATIONS=false

# 3. Start the dev server
npm run dev
```

The app starts at **http://localhost:5173** (Vite increments the port if 5173 is in use — check terminal output for the actual URL).

The API endpoint at `POST /api/evaluate` is served by Vite's SSR middleware on the same port as the frontend. No separate backend process is required.

**To run without an API key (mock data):**

Leave `USE_MOCK_EVALUATIONS` unset or set it to any value other than `"false"`. The app returns pre-built results covering all three verdict outcomes.

```bash
# Other useful commands
npm run build     # TypeScript compile + Vite production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint check across all source files
```

---

## Mock Mode and Claude Mode

**Mock Mode** (default) returns one of five pre-built evaluations instantly — no API key, no network call, no tokens consumed. It covers all three modes and all three verdict outcomes. Use it to explore the full result UI before configuring a live key.

In Mock Mode, only the five built-in examples return results. Submitting arbitrary text shows an informational message and prompts switching to Claude Mode.

**Claude Mode** sends the idea to Claude via the Anthropic API. The same evaluation framework applies: Claude scores dimensions, and the server computes the verdict. Results are cached in memory by `(mode, idea)` for the session to avoid duplicate calls.

Switch between modes using the badge in the top-right corner of the evaluator. Switching to Claude Mode shows a confirmation before making any API calls.

---

## Writing Effective Evaluations

The more evidence your description contains, the more useful the evaluation. Vague descriptions produce low evidence-quality scores and long validation-gap lists.

**Include when available:**

- Specific users or customer segments ("18 enterprise customers", "3 deals blocked on sign-off")
- Quantified demand (support ticket counts, feature request volume, survey data)
- Usage data ("below 2% of rows have comments over the past 90 days")
- Revenue or business impact ("conditional on completing the audit")
- Implementation constraints (team size, timeline, technical dependencies)

One sentence with a concrete data point scores better than three paragraphs without one.

---

## Example Inputs

Three canonical examples — one per verdict outcome. Each maps to the same pre-built result shown on the [Demo page](/demo).
Exact dimension scores vary in live mode; verdicts should remain consistent for these inputs.

---

### Example 1 — Ship · Feature Idea tab

```
Add bulk CSV export to the reporting dashboard. 18 enterprise customers have asked
for it in support tickets over the last quarter; three said it is blocking
procurement sign-off.
```

**Expected verdict: Ship**

Validated demand with direct revenue linkage and a usable implementation path. The unknowns are scoping details, not decision blockers.

---

### Example 2 — Refine · Feature Idea tab

```
Pursue SOC2 Type II certification. Several enterprise prospects have stalled in
procurement citing our lack of security certification. Two active deals are
explicitly conditional on completing the audit.
```

**Expected verdict: Refine**

Revenue signal is real but scope, cost, and timeline are unspecified. A readiness assessment is required before any commitment.

---

### Example 3 — Skip · Concept tab

```
Pivot the entire product roadmap to be AI-first. Every existing feature should be
reimagined as an AI-powered workflow. We should position as the AI-native
alternative in the category.
```

**Expected verdict: Skip**

No customer evidence anchors the pivot, the scope is total-roadmap and untestable, and "AI-first" is undifferentiated positioning shared by every competitor.

---

## Other Evaluation Modes

Ship or Skip supports three evaluation modes. Switch tabs in the app to use them.

### Product Change tab

```
Remove the per-row comments thread from the dashboard. Usage telemetry shows fewer
than 2% of rows contain comments. The feature increases maintenance burden. No
enterprise customers currently rely on it.
```

**Expected verdict: Refine**

Usage is low, but affected users, migration impact, and reversibility remain unknown.

> The Concept tab example is covered by **Example 3** above (AI-first Roadmap Pivot → Skip).
> Exact scores may vary between runs, but verdicts should remain consistent for the same inputs.

---

## How Evaluation Works

### Verdicts

The verdict is computed **server-side** from dimension scores using a deterministic formula. The model does not choose the verdict — it only scores dimensions.

```
overallScore = round( Σ score × weight )   // weights are per-mode
minScore     = minimum of all 7 dimension scores
counterCount = number of dimensions with score < 20

Ship   →  overallScore ≥ 72  AND  minScore ≥ 45
Skip   →  overallScore < 45  OR   counterCount ≥ 2
Refine →  everything else
```

| Verdict    | Meaning                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ship**   | Evidence and feasibility are strong. The idea is worth building.                                                                              |
| **Refine** | The direction is plausible but the submission is missing information or has fixable weaknesses. Return with more evidence or a smaller scope. |
| **Skip**   | Fundamental problems with problem definition, evidence, or strategic fit. Not worth building in current form.                                 |

### Confidence Score

A second server-computed metric on a 0–100 scale:

```
confidence = overallScore × 0.6
           + (100 − spread × 2) × 0.25
           + evidenceQuality × 0.15
```

`spread` is the standard deviation of all dimension scores — high spread means the idea is strong in some areas and critically weak in others, reducing confidence. `evidenceQuality` is the fraction of signals that are `positive` or `negative` (rather than `unknown`), reflecting how much the submission gives the model to work with.

### Dimension Scores

Each dimension is scored 0–100 and bucketed into a band:

| Band       | Range  | Meaning                                        |
| ---------- | ------ | ---------------------------------------------- |
| Strong     | 80–100 | Clear positive signal with concrete evidence   |
| Reasonable | 60–79  | Positive but with caveats or partial evidence  |
| Mixed      | 40–59  | Genuinely uncertain; evidence points both ways |
| Weak       | 20–39  | Negative signal; fixable with more information |
| Counter    | 0–19   | Actively argues against building this          |

### Evaluation Modes and Their Dimensions

**Feature Idea** — Is this new capability worth building?

| Dimension           | Weight |
| ------------------- | ------ |
| Problem Clarity     | 18%    |
| Evidence of Need    | 20%    |
| Solution Fit        | 15%    |
| User Value          | 12%    |
| Implementation Cost | 12%    |
| Strategic Alignment | 10%    |
| Risk Profile        | 13%    |

**Product Change** — Is this modification an improvement or a regression risk?

| Dimension                 | Weight |
| ------------------------- | ------ |
| Change Justification      | 18%    |
| Impact Scope              | 15%    |
| Existing User Risk        | 18%    |
| Reversibility             | 12%    |
| Improvement Magnitude     | 15%    |
| Migration Cost            | 10%    |
| Implementation Complexity | 12%    |

**Concept** — Is this strategic direction worth committing resources to?

| Dimension           | Weight |
| ------------------- | ------ |
| Strategic Coherence | 18%    |
| Market Signal       | 17%    |
| Differentiation     | 13%    |
| Testability         | 15%    |
| Resource Demand     | 12%    |
| Optionality         | 10%    |
| Conviction Strength | 15%    |

### Risks

The model identifies 2–5 risks per evaluation. Each risk has a **severity** (`high`, `medium`, `low`), a **statement** naming the specific risk (≤ 140 characters), and a **linkedDimension** tying it to the dimension that surfaces the concern.

### Validation Gaps

Every unknown the model cannot resolve from the submission becomes a `missingValidation` entry with:

- **question** — the specific thing that needs answering
- **whyItMatters** — why this unknown affects the verdict
- **howToCheck** — a concrete action to resolve it (user interview, data query, A/B test)
- **linkedDimension** — which rubric dimension it affects

---

## Project Structure

```
ship-or-skip/
├── api/
│   ├── evaluate.ts        # Evaluation handler; Vercel serverless function entry point
│   ├── prompts.ts         # Loads and assembles system + mode prompt files
│   ├── rubrics.ts         # Dimension definitions and weights per mode
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
│   │   ├── feedback/
│   │   │   └── LoadingState.tsx        # Animated step-by-step progress indicator
│   │   ├── input/
│   │   │   ├── InputSection.tsx        # Idea textarea, examples, submit button
│   │   │   └── ModeTabs.tsx            # Feature / Change / Concept tab switcher
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Logo, dark mode toggle, live/mock toggle (Evaluator)
│   │   │   └── LandingNav.tsx          # Logo, dark mode toggle (Landing and Demo pages)
│   │   └── result/
│   │       ├── DecisionCard.tsx        # Verdict badge, confidence score, summary
│   │       ├── ResultPanel.tsx         # Full result: scorecard, risks, gaps, refine
│   │       ├── VerdictIcon.tsx         # Ship / Refine / Skip boat icon variants
│   │       └── CopyEvaluationButton.tsx # Exports full evaluation to Markdown
│   │
│   ├── data/
│   │   ├── demoExamples.ts # Five canonical examples shown on the Demo page
│   │   ├── examples.ts     # Built-in example ideas and mock result routing
│   │   └── mockResults.ts  # Pre-built Ship / Refine / Skip mock DecisionResults
│   │
│   ├── hooks/
│   │   └── useEvaluation.ts  # State machine: idle → loading → success / error
│   │
│   ├── lib/
│   │   ├── api.ts                    # fetch wrapper for POST /api/evaluate
│   │   ├── buildEvaluationMarkdown.ts # Markdown serialiser for copy button
│   │   ├── evaluationCache.ts        # Client-side sessionStorage cache
│   │   ├── friendlyError.ts          # Maps ApiErrorCode to user-readable strings
│   │   └── schema.ts                 # Frontend Zod schema (mirrors api/schema.ts)
│   │
│   └── types/
│       ├── api.ts       # ApiResponse<T>, ApiError, ApiErrorCode
│       ├── decision.ts  # DecisionResult, Scorecard, Verdict, Risk, and related types
│       └── request.ts   # IdeaMode, EvaluationRequest, MODE_DESCRIPTORS
│
├── docs/
│   ├── CLAUDE.md                # Codebase notes for AI-assisted development
│   ├── PRODUCT.md               # Product design decisions and rationale
│   ├── api-contract.md          # API request/response contract reference
│   └── evaluation-framework.md  # Full rubric specification
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html
├── vite.config.ts     # Registers /api/evaluate as a Vite SSR middleware for dev
├── package.json
├── tsconfig.json      # Project references: tsconfig.app.json + tsconfig.node.json
├── tsconfig.app.json  # Frontend TypeScript config
├── tsconfig.node.json # API/backend TypeScript config
└── .env.example       # Environment variable template
```

---

## Deployment

### Vercel (recommended)

`api/evaluate.ts` exports a `default` handler with the Node.js `(IncomingMessage, ServerResponse) => Promise<void>` signature, which Vercel's Node.js runtime recognises automatically.

```bash
# Build the frontend assets
npm run build

# Deploy
npx vercel --prod
```

Set the following environment variables in the Vercel project dashboard (Project → Settings → Environment Variables):

| Variable               | Value                                  |
| ---------------------- | -------------------------------------- |
| `ANTHROPIC_API_KEY`    | Your Anthropic API key                 |
| `ANTHROPIC_MODEL`      | `claude-opus-4-5` (or preferred model) |
| `USE_MOCK_EVALUATIONS` | `false`                                |

`ANTHROPIC_BASE_URL` is only needed if routing through a custom gateway. Leave it unset to use the Anthropic API directly.

### Other platforms

Any platform that serves static files and runs Node.js serverless functions is compatible. Point the platform's function runner at `api/evaluate.ts` and set the same four environment variables.

---

## Troubleshooting

### The app shows mock results even though I set `USE_MOCK_EVALUATIONS=false`

1. Confirm the variable is in `.env.local`, not `.env` — Vite loads `.env.local` with override priority.
2. The value must be the exact string `false`. An empty string, `0`, or `"true"` all activate mock mode.
3. Restart the dev server after editing `.env.local`. Vite reads environment files at startup, not per-request.

---

### Evaluation fails with `schema_violation: Model output failed validation`

The model returned a response that did not match the Zod schema. Check the terminal for the `PRE-VALIDATION FIELD AUDIT` block, which logs every top-level field and its value before validation runs.

Common causes:

- A dimension `id` in the model response does not match the mode's rubric IDs (see the **Dimension IDs** section in `prompts/system.md`)
- A string field exceeds its character limit
- Prompt edits have not taken effect — restart the dev server to reload `.md` files fresh

---

### Evaluation fails with `upstream_error: Gateway returned 4xx`

- Verify `ANTHROPIC_API_KEY` is valid and has available credits at [console.anthropic.com](https://console.anthropic.com).
- If using a custom `ANTHROPIC_BASE_URL`, confirm the gateway is reachable and accepts `POST /v1/chat/completions` with `role:"system"` messages.
- Confirm `ANTHROPIC_MODEL` names a model available on your key.

---

### Rate limit errors from the app itself

The evaluation handler enforces **10 requests per 5 minutes per IP address** in memory. Restarting the dev server resets the counter. In production on Vercel, each function invocation is a fresh process so the limit applies per cold start.

---

### Stale results being returned

The server caches results by `(mode, idea)` for 24 hours in memory. Restarting the dev server clears the cache. For production on Vercel, the in-memory cache does not persist between function invocations.

---

### TypeScript errors after pulling changes

```bash
npm install       # in case new dependencies were added
npx tsc --noEmit  # verify the full type graph compiles cleanly
```

---

### ESLint errors blocking the build

```bash
npm run lint
```

The project enforces strict TypeScript ESLint rules including `noUnusedLocals` and `noUnusedParameters`. All lint errors must be resolved before `npm run build` will succeed.

---

## Submission Checklist

Run through this list before submitting the repository.

### Security

- [ ] No real API keys anywhere in tracked files — run `git grep -r "sk-ant"` and confirm no output
- [ ] `.env.example` uses placeholder values only (`sk-ant-api03-YOUR_KEY_HERE`)
- [ ] `.env.local` is listed in `.gitignore` (it is — the `*.local` rule covers it)

### Functionality

- [ ] `npm run build` completes with no TypeScript or lint errors
- [ ] Mock mode works with zero configuration: start the server with `USE_MOCK_EVALUATIONS` unset and confirm results appear
- [ ] All three mode tabs return results in mock mode (Feature → Ship, Change → Refine, Concept → Skip)
- [ ] Live mode works with a valid `ANTHROPIC_API_KEY` and `USE_MOCK_EVALUATIONS=false`
- [ ] All three verdict types observed in live mode (Ship, Refine, Skip)
- [ ] Copy to Markdown button produces valid Markdown output

### Documentation

- [ ] Repository URL is correct in the `## Quick Start` section
- [ ] `ANTHROPIC_MODEL` in `.env.example` names a model available on the key being used for testing
- [ ] Troubleshooting section reflects any issues encountered during final test run

### Pre-submission verification commands

```bash
# No secrets committed
git grep -r "sk-ant"

# TypeScript and lint clean
npm run build
npm run lint

# Mock mode: start and immediately test all three tabs
USE_MOCK_EVALUATIONS=true npm run dev
```
