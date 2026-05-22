# Ship or Skip

## Project purpose

Ship or Skip is a pre-build decision tool for product teams.
The app evaluates feature ideas before implementation work starts.
The product tone is calm, analytical, and decision-first.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4 via `@import "tailwindcss"`

## Key commands

- `npm run dev` starts the Vite dev server.
- `npm run lint` runs ESLint across the repo.
- `npm run build` runs TypeScript build checks and produces the Vite build.
- `npm run preview` serves the production build locally.

## Codebase map

- `src/App.tsx` wires the page, demo data rotation, and result rendering.
- `src/components/` holds the UI surface.
- `src/data/mockResult.ts` contains demo decision outputs.
- `src/types/decision.ts` defines the decision result contract.
- `PRODUCT.md` is the product source of truth for behavior and tone.

## Working rules

- Prefer small focused edits over broad rewrites.
- Preserve the existing React function-component style.
- Keep types explicit when the shape matters across components.
- Reuse the existing decision vocabulary: `ship`, `refine`, `skip`.
- Keep UI copy concise and non-hype.
- When editing decision output, make the answer structured and scannable rather than chatty.
- Validate with `npm run lint` after meaningful source edits.
- Run `npm run build` when changing types, component contracts, or build-sensitive code.

## UX and copy constraints

- The product is not a chatbot UI.
- Output should lead with the decision, then supporting rationale.
- Avoid praise like "great idea" or "love this".
- Prefer concrete risks, missing validation, and next-step guidance.

## Notes for Claude Code

- Use `PRODUCT.md` when product intent or output behavior is ambiguous.
- Use the skills in `.claude/skills/` for repeatable project tasks.
- Use the project agents in `.claude/agents/` when a task is clearly specialized.
