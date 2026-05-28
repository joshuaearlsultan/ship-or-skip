# Configuration

## Environment Variables

Copy `.env.example` to `.env.local` before running the dev server. `.env.local` is gitignored and never committed.

```bash
cp .env.example .env.local
```

### Complete Reference

| Variable               | Required when               | Default                         |
| ---------------------- | --------------------------- | ------------------------------- |
| `USE_MOCK_EVALUATIONS` | Always                      | `true` (mock active if absent)  |
| `USE_COMPANY_GATEWAY`  | Always                      | `false` (direct Anthropic)      |
| `ANTHROPIC_API_KEY`    | `USE_COMPANY_GATEWAY=false` | —                               |
| `ANTHROPIC_MODEL`      | Live mode                   | `claude-sonnet-4-6`             |
| `COMPANY_GATEWAY_URL`  | `USE_COMPANY_GATEWAY=true`  | —                               |
| `COMPANY_GATEWAY_KEY`  | `USE_COMPANY_GATEWAY=true`  | —                               |

**`USE_MOCK_EVALUATIONS`** must be the exact string `"false"` to enable live AI calls. An absent value, empty string, `0`, or any other string keeps mock mode active. The app never calls an AI provider by accident.

---

## Local Development — Direct Anthropic

For development using a personal Anthropic key:

```env
USE_COMPANY_GATEWAY=false
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4-6
USE_MOCK_EVALUATIONS=false
```

---

## Local Development — Company Gateway

For development using an internal AI gateway (OpenAI-compatible endpoint):

```env
USE_COMPANY_GATEWAY=true
COMPANY_GATEWAY_URL=https://your-gateway-hostname
COMPANY_GATEWAY_KEY=your-gateway-key
ANTHROPIC_MODEL=claude-quality
USE_MOCK_EVALUATIONS=false
```

---

## Vercel Deployment

```bash
npm run build
npx vercel --prod
```

Set the following in Vercel → Project → Settings → Environment Variables:

| Variable               | Value               |
| ---------------------- | ------------------- |
| `USE_COMPANY_GATEWAY`  | `false`             |
| `ANTHROPIC_API_KEY`    | `sk-ant-api03-...`  |
| `ANTHROPIC_MODEL`      | `claude-sonnet-4-6` |
| `USE_MOCK_EVALUATIONS` | `false`             |

Do not set `ANTHROPIC_BASE_URL` — it is unused in direct Anthropic mode. If a stale value exists from a previous configuration, delete it.

### Other Platforms

Any platform that serves static files and runs Node.js serverless functions is compatible. Point the function runner at `api/evaluate.ts` and set the same environment variables listed above.

---

## Other Commands

```bash
npm run build     # TypeScript compile + Vite production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint check across all source files
```

---

## Troubleshooting

### Mock results showing even with `USE_MOCK_EVALUATIONS=false`

1. Confirm the variable is in `.env.local`, not `.env` — Vite loads `.env.local` with override priority.
2. The value must be the exact string `false`. An empty string, `0`, or `"true"` all activate mock mode.
3. Restart the dev server after editing `.env.local`.

### `schema_violation: Model output failed validation`

The model returned a response that did not match the Zod schema. Check the terminal for the `PRE-VALIDATION FIELD AUDIT` block, which logs every top-level field before validation runs.

Common causes:

- A dimension `id` in the model response does not match the mode's rubric IDs — see `prompts/system.md`
- A string field exceeds its character limit
- Prompt edits have not taken effect — restart the dev server to reload prompt files

### `upstream_error: API returned 4xx`

**Direct Anthropic mode (`USE_COMPANY_GATEWAY=false`):**

- Verify `ANTHROPIC_API_KEY` is valid and has available credits at [console.anthropic.com](https://console.anthropic.com).
- Confirm `ANTHROPIC_MODEL` is a real Anthropic model name (e.g. `claude-sonnet-4-6`), not a gateway alias.
- Confirm `ANTHROPIC_BASE_URL` is **not** set — a stale gateway URL causes every request to 404.

**Company gateway mode (`USE_COMPANY_GATEWAY=true`):**

- Confirm `COMPANY_GATEWAY_URL` is reachable and `COMPANY_GATEWAY_KEY` is valid.
- Confirm `ANTHROPIC_MODEL` matches a model alias configured on the gateway.

### Rate limit errors

The evaluation handler enforces **10 requests per 5 minutes per IP address** in memory. Restarting the dev server resets the counter. On Vercel, the limit applies per cold start.

### Stale results being returned

The server caches results by `(mode, idea)` for 24 hours in memory. Restarting the dev server clears the cache. On Vercel, the in-memory cache does not persist between function invocations.

### TypeScript errors after pulling changes

```bash
npm install        # in case new dependencies were added
npx tsc --noEmit   # verify the full type graph compiles cleanly
```

### ESLint errors blocking the build

```bash
npm run lint
```

The project enforces strict TypeScript ESLint rules including `noUnusedLocals` and `noUnusedParameters`. All lint errors must be resolved before `npm run build` will succeed.
