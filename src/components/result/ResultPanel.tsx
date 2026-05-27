import { useEffect, useRef, useState } from 'react'
import type {
  DecisionResult,
  EvaluationDimension,
  Improvement,
  ImprovementLift,
  MissingValidation,
  RefineRecommendation,
  Risk,
  RiskSeverity,
  ScoreBand,
} from '../../types/decision'
import type { EvaluationState } from '../../hooks/useEvaluation'
import type { EvaluationRequest } from '../../types/request'
import { LoadingState } from '../feedback/LoadingState'
import { DecisionCard } from './DecisionCard'
import { CopyEvaluationButton } from './CopyEvaluationButton'
import { getFriendlyError } from '../../lib/friendlyError'

interface ResultPanelProps {
  state: EvaluationState
  onReset?: () => void
  onSwitchToMock?: () => void
  onSwitchToClaude?: () => void
}

export function ResultPanel({ state, onReset, onSwitchToMock, onSwitchToClaude }: ResultPanelProps) {
  if (state.status === 'idle') return <EmptyState />
  if (state.status === 'mock-blocked') return <MockBlockedState onSwitchToClaude={onSwitchToClaude} />
  if (state.status === 'loading') return <LoadingState />
  if (state.status === 'error')
    return <ErrorState error={state.error} onSwitchToMock={onSwitchToMock} />
  // Key on idea+mode so ReadyState remounts (resetting local toast) on each new evaluation
  const resultKey = `${state.request.mode}:${state.request.idea}`
  return (
    <ReadyState
      key={resultKey}
      result={state.result}
      request={state.request}
      fromCache={state.fromCache}
      onReset={onReset}
    />
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-8 text-center dark:border-surface-border dark:bg-surface-1">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Get a verdict before you build.
      </p>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
        Each idea is scored against a fixed evaluation framework — the same
        dimensions and criteria applied every time. You receive a scored
        verdict, a dimension-by-dimension scorecard, identified risks, and
        validation gaps to close before committing. The verdict is calculated
        from the scores, not generated as a freeform response.
      </p>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
        Paste a feature, change, or concept above, or{' '}
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          Try Example
        </span>{' '}
        to run a sample evaluation.
      </p>
    </div>
  )
}

function MockBlockedState({ onSwitchToClaude }: { onSwitchToClaude?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-8 dark:border-surface-border dark:bg-surface-1">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Mock Mode only supports the built-in example decisions.
      </p>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
        To evaluate your own idea, switch to Claude Mode.
      </p>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
        Or use Try Example to explore Ship, Refine, and Skip outcomes without consuming AI tokens.
      </p>
      {onSwitchToClaude ? (
        <button
          type="button"
          onClick={onSwitchToClaude}
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
        >
          Switch to Claude Mode
        </button>
      ) : null}
    </div>
  )
}

function ErrorState({
  error,
  onSwitchToMock,
}: {
  error: import('../../types/api').ApiError
  onSwitchToMock?: () => void
}) {
  const friendly = getFriendlyError(error)
  const hasActions = (friendly.actions?.length ?? 0) > 0
  const showMock = friendly.showSwitchToMock && onSwitchToMock

  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950"
    >
      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
        {friendly.title}
      </p>
      <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{friendly.message}</p>
      {(hasActions || showMock) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {friendly.actions?.map((action) => (
            <a
              key={action.href}
              href={action.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:bg-surface-1 dark:text-neutral-200 dark:ring-surface-border dark:hover:bg-surface-2"
            >
              {action.label}
              <svg className="h-3 w-3 opacity-50" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 12L12 4M12 4H6M12 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
          {showMock ? (
            <button
              type="button"
              onClick={onSwitchToMock}
              className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:bg-surface-1 dark:text-neutral-200 dark:ring-surface-border dark:hover:bg-surface-2"
            >
              Switch to Mock Mode
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ReadyState({
  result,
  request,
  fromCache,
  onReset,
}: {
  result: DecisionResult
  request: EvaluationRequest
  fromCache: boolean
  onReset?: () => void
}) {
  return (
    <div className="space-y-4">
      <DecisionCard result={result} />
      <ScorecardSection dimensions={result.scorecard.dimensions} />
      <RisksSection risks={result.risks} />
      <MissingValidationSection items={result.missingValidation} />
      {result.refineRecommendation ? (
        <RefineSection recommendation={result.refineRecommendation} />
      ) : null}
      <div className="flex items-center justify-between pt-1">
        <CacheToast show={fromCache} />
        <div className="flex items-center gap-2">
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:border-surface-border dark:bg-surface-1 dark:text-neutral-400 dark:hover:bg-surface-2"
            >
              New evaluation
            </button>
          ) : null}
          <CopyEvaluationButton
            result={result}
            idea={request.idea}
            mode={request.mode}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Cache toast ──────────────────────────────────────────────────────────────

function CacheToast({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!show) return
    timerRef.current = setTimeout(() => setVisible(false), 3000)
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [show])

  if (!visible) return <span /> // keeps flex layout stable

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:bg-surface-2 dark:text-neutral-400"
    >
      <span aria-hidden>⚡</span>
      Served from cache
    </span>
  )
}

// ─── Scorecard ────────────────────────────────────────────────────────────────
// Intentionally quieter than the verdict card: muted heading, thinner bars,
// slightly lower-contrast text so the verdict stays dominant.

const BAND_LABEL: Record<ScoreBand, string> = {
  strong: 'Strong',
  reasonable: 'Reasonable',
  mixed: 'Mixed',
  weak: 'Weak',
  counter: 'Counter',
}

const BAND_BAR_CLASS: Record<ScoreBand, string> = {
  strong: 'bg-band-strong',
  reasonable: 'bg-band-reasonable',
  mixed: 'bg-band-mixed',
  weak: 'bg-band-weak',
  counter: 'bg-band-counter',
}

const BAND_BADGE_CLASS: Record<ScoreBand, string> = {
  strong: 'text-band-strong',
  reasonable: 'text-band-reasonable',
  mixed: 'text-band-mixed',
  weak: 'text-band-weak',
  counter: 'text-band-counter',
}

function ScorecardSection({
  dimensions,
}: {
  dimensions: EvaluationDimension[]
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section
      aria-label="Scorecard"
      className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm dark:border-surface-border dark:bg-surface-1"
    >
      {/* Quiet heading — intentionally subordinate to the verdict card */}
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-500">
        Scorecard
      </h2>

      <ul className="mt-3 divide-y divide-neutral-100 dark:divide-surface-border">
        {dimensions.map((d) => (
          <ScorecardRow
            key={d.id}
            dimension={d}
            isExpanded={expanded.has(d.id)}
            onToggle={() => toggle(d.id)}
          />
        ))}
      </ul>
    </section>
  )
}

function ScorecardRow({
  dimension: d,
  isExpanded,
  onToggle,
}: {
  dimension: EvaluationDimension
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full cursor-pointer rounded-md py-2.5 text-left transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300 dark:hover:bg-white/[0.04] dark:focus-visible:ring-neutral-600"
      >
        <div className="flex items-center gap-2">
          <span className="flex-1 text-[13px] font-medium text-neutral-700 dark:text-neutral-400">
            {d.label}
          </span>
          <span
            className={`shrink-0 text-[10px] uppercase tracking-wide ${BAND_BADGE_CLASS[d.band]}`}
          >
            {BAND_LABEL[d.band]}
          </span>
          <span className="w-6 shrink-0 text-right font-mono text-[13px] text-neutral-600 dark:text-neutral-500">
            {d.score}
          </span>
          <Chevron open={isExpanded} />
        </div>
        {/* Thinner bar — visually subordinate */}
        <div
          className="mt-1.5 h-1 w-full rounded-full bg-neutral-100 dark:bg-surface-2"
          aria-hidden
        >
          <div
            className={`h-full rounded-full ${BAND_BAR_CLASS[d.band]}`}
            style={{ width: `${d.score}%` }}
          />
        </div>
      </button>

      {isExpanded ? (
        <div className="pb-3">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-600">
            weight {(d.weight * 100).toFixed(0)}% of overall score
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            {d.rationale}
          </p>
          {d.signals.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {d.signals.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-neutral-500 dark:text-neutral-500"
                >
                  <SignalDot kind={s.type} />
                  <span>{s.statement}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 text-neutral-300 transition-transform duration-150 dark:text-neutral-700 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SignalDot({ kind }: { kind: 'positive' | 'negative' | 'unknown' }) {
  const cls =
    kind === 'positive'
      ? 'bg-band-strong'
      : kind === 'negative'
        ? 'bg-band-counter'
        : 'bg-neutral-300 dark:bg-surface-2'
  return (
    <span
      aria-label={kind}
      className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${cls}`}
    />
  )
}

// ─── Risks ────────────────────────────────────────────────────────────────────

const SEVERITY_BADGE: Record<RiskSeverity, string> = {
  high: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:ring-rose-900',
  medium:
    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-900',
  low: 'bg-neutral-50 text-neutral-600 ring-1 ring-inset ring-neutral-200 dark:bg-surface-2 dark:text-neutral-400 dark:ring-surface-border',
}

const SEVERITY_ORDER: Record<RiskSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const SEVERITY_ACCENT: Record<RiskSeverity, string> = {
  high: 'border-l-2 border-rose-300 dark:border-rose-700 pl-3',
  medium: 'border-l-2 border-amber-200 dark:border-amber-700 pl-3',
  low: 'border-l-2 border-transparent pl-3',
}

function RisksSection({ risks }: { risks: Risk[] }) {
  if (risks.length === 0) return null

  const sorted = risks
    .slice()
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const highCount = risks.filter((r) => r.severity === 'high').length
  const medCount = risks.filter((r) => r.severity === 'medium').length
  const summary = [
    highCount > 0 ? `${highCount} high` : null,
    medCount > 0 ? `${medCount} medium` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section
      aria-label="Risks"
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-surface-border dark:bg-surface-1"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
          Risks
        </h2>
        {summary ? (
          <span className="text-xs font-medium text-rose-600 dark:text-rose-500">
            {summary}
          </span>
        ) : null}
      </div>
      <ul className="mt-3 space-y-2.5">
        {sorted.map((r) => (
          <li
            key={r.id}
            className={`flex items-start gap-3 py-0.5 ${SEVERITY_ACCENT[r.severity]}`}
          >
            <span
              className={`mt-0.5 inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${SEVERITY_BADGE[r.severity]}`}
            >
              {r.severity}
            </span>
            <p className="text-[13px] text-neutral-700 dark:text-neutral-400">
              {r.statement}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Validation gaps ──────────────────────────────────────────────────────────

function MissingValidationSection({ items }: { items: MissingValidation[] }) {
  if (items.length === 0) return null
  return (
    <section
      aria-label="Validation gaps"
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-surface-border dark:bg-surface-1"
    >
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
        Validation gaps
      </h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-600">
        Answer these before committing to the work.
      </p>
      <ul className="mt-3 space-y-4">
        {items.map((m, i) => (
          <li key={i} className="space-y-1">
            <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-200">
              {m.question}
            </p>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-500">
              {m.whyItMatters}
            </p>
            <div className="mt-1.5 flex items-start gap-2 rounded-md bg-neutral-50 px-2.5 py-2 dark:bg-surface-2">
              <span className="mt-px shrink-0 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                Check
              </span>
              <p className="text-[12px] text-neutral-700 dark:text-neutral-400">
                {m.howToCheck}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Refine direction ─────────────────────────────────────────────────────────

const LIFT_LABEL: Record<ImprovementLift, string> = {
  small: 'small lift',
  moderate: 'moderate lift',
  large: 'large lift',
}

function RefineSection({
  recommendation,
}: {
  recommendation: RefineRecommendation
}) {
  return (
    <section
      aria-label="Suggested direction"
      className="rounded-xl border border-verdict-refine-ring bg-verdict-refine-soft p-5 dark:border-verdict-refine-dark-ring dark:bg-verdict-refine-dark-bg"
    >
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
        Suggested direction
      </h2>

      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          What&rsquo;s wrong
        </h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-neutral-700 dark:text-neutral-400">
          {recommendation.whatsWrong.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          Improvements
        </h3>
        <ul className="mt-1 space-y-2 text-[13px] text-neutral-700 dark:text-neutral-400">
          {recommendation.improvements.map((imp, i) => (
            <ImprovementRow key={i} improvement={imp} />
          ))}
        </ul>
      </div>

      {recommendation.smallerExperiment ? (
        <div className="mt-3">
          <h3 className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
            Smaller experiment
          </h3>
          <p className="mt-1 text-[13px] text-neutral-700 dark:text-neutral-400">
            {recommendation.smallerExperiment}
          </p>
        </div>
      ) : null}

      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          Re-evaluate when
        </h3>
        <p className="mt-1 text-[13px] text-neutral-700 dark:text-neutral-400">
          {recommendation.reEvaluateWhen}
        </p>
      </div>
    </section>
  )
}

function ImprovementRow({ improvement }: { improvement: Improvement }) {
  return (
    <li className="flex flex-col gap-0.5">
      <span>{improvement.action}</span>
      <span className="text-[11px] text-neutral-500 dark:text-neutral-500">
        {LIFT_LABEL[improvement.expectedLift]}
      </span>
    </li>
  )
}

// To restore debug metadata in the result view, add this back to ReadyState and
// uncomment the component below:
//
//   <p className="text-[11px] text-neutral-500">
//     {result.meta.model} · {result.meta.promptVersion} · {result.meta.latencyMs} ms
//   </p>
