import type { EvalMode } from '../../hooks/useEvaluation'

interface RuntimeStatusProps {
  evalMode: EvalMode
}

/**
 * RuntimeStatus
 *
 * Renders a compact status indicator only when BOTH conditions hold:
 *   1. The deployment is running in deterministic mode  (__AI_RUNTIME_PAUSED__ = true)
 *   2. The user has selected Claude Mode                (evalMode === 'claude')
 *
 * Hidden in Mock Mode — deterministic responses are expected there.
 * Hidden entirely in live-AI deployments via compile-time DCE (see below).
 *
 * ── Tree-shaking note ────────────────────────────────────────────────────────
 * The early `if (!__AI_RUNTIME_PAUSED__) return null` is the DCE hook.
 * When __AI_RUNTIME_PAUSED__ = false, the bundler constant-folds it to
 * `if (true) return null` — making all code below an unconditional dead path.
 * esbuild eliminates everything after that return, including the full JSX.
 *
 * The evalMode check must NOT be combined into the same `if` condition, nor
 * placed in a prior `if` block. esbuild's intra-function DCE only fires for
 * code-after-unconditional-return — a compound `&&` condition or a second
 * `if` statement prevents the "unconditional" classification and defeats DCE.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function RuntimeStatus({ evalMode }: RuntimeStatusProps) {
  if (!__AI_RUNTIME_PAUSED__) return null
  return evalMode !== 'claude' ? null : (
    <div
      role="status"
      aria-label="AI runtime status"
      className="rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/25"
    >
      <div className="flex items-center gap-2">
        {/* Muted pulsing dot — operational status, not an error */}
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500/80 dark:bg-amber-400/70"
        />
        <span className="text-[13px] font-medium tracking-tight text-amber-800 dark:text-amber-300">
          Public AI Runtime: Paused
        </span>
      </div>
      <p className="mt-1 pl-3.5 text-[12px] leading-snug text-amber-700/80 dark:text-amber-400/70">
        Claude Mode is currently using deterministic evaluation responses on this deployment.
      </p>
      <p className="mt-0.5 pl-3.5 text-[12px] leading-snug text-amber-700/55 dark:text-amber-400/50">
        Live Claude-powered evaluation remains available in configured environments.
      </p>
    </div>
  )
}
