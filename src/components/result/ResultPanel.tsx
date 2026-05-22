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
import { LoadingState } from '../feedback/LoadingState'
import { DecisionCard } from './DecisionCard'

interface ResultPanelProps {
  state: EvaluationState
}

export function ResultPanel({ state }: ResultPanelProps) {
  if (state.status === 'idle') return <EmptyState />
  if (state.status === 'loading') return <LoadingState />
  if (state.status === 'error') return <ErrorState message={state.error.message} />
  return <ReadyState result={state.result} />
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-8 text-center">
      <p className="text-sm font-medium text-neutral-700">
        No evaluation yet.
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Enter an idea above, or load a sample with{' '}
        <span className="font-medium text-neutral-700">Try Example</span>.
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-5"
    >
      <p className="text-sm font-medium text-rose-800">Could not evaluate.</p>
      <p className="mt-1 text-sm text-rose-700">{message}</p>
    </div>
  )
}

function ReadyState({ result }: { result: DecisionResult }) {
  return (
    <div className="space-y-4">
      <DecisionCard result={result} />
      <ScorecardSection dimensions={result.scorecard.dimensions} />
      <RisksSection risks={result.risks} />
      <MissingValidationSection items={result.missingValidation} />
      {result.refineRecommendation ? (
        <RefineSection recommendation={result.refineRecommendation} />
      ) : null}
      <FooterMeta result={result} />
    </div>
  )
}

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
  return (
    <section
      aria-label="Scorecard"
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-neutral-900">Scorecard</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Each dimension is scored 0–100 with a rationale and evidence.
      </p>

      <ul className="mt-4 divide-y divide-neutral-100">
        {dimensions.map((d) => (
          <li key={d.id} className="py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-neutral-900">
                  {d.label}
                </span>
                <span
                  className={`text-[11px] uppercase tracking-wide ${BAND_BADGE_CLASS[d.band]}`}
                >
                  {BAND_LABEL[d.band]}
                </span>
              </div>
              <div className="flex items-baseline gap-2 text-xs text-neutral-500">
                <span>weight {(d.weight * 100).toFixed(0)}%</span>
                <span className="font-mono text-sm text-neutral-900">
                  {d.score}
                </span>
              </div>
            </div>

            <div
              className="mt-2 h-1.5 w-full rounded-full bg-neutral-100"
              aria-hidden
            >
              <div
                className={`h-full rounded-full ${BAND_BAR_CLASS[d.band]}`}
                style={{ width: `${d.score}%` }}
              />
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-neutral-700">
              {d.rationale}
            </p>

            {d.signals.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {d.signals.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-neutral-600"
                  >
                    <SignalDot kind={s.type} />
                    <span>{s.statement}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function SignalDot({ kind }: { kind: 'positive' | 'negative' | 'unknown' }) {
  const cls =
    kind === 'positive'
      ? 'bg-band-strong'
      : kind === 'negative'
        ? 'bg-band-counter'
        : 'bg-neutral-300'
  return (
    <span
      aria-label={kind}
      className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${cls}`}
    />
  )
}

const SEVERITY_BADGE: Record<RiskSeverity, string> = {
  high: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  low: 'bg-neutral-50 text-neutral-700 ring-1 ring-inset ring-neutral-200',
}

function RisksSection({ risks }: { risks: Risk[] }) {
  if (risks.length === 0) return null
  return (
    <section
      aria-label="Risks"
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-neutral-900">Risks</h2>
      <ul className="mt-3 space-y-3">
        {risks.map((r) => (
          <li key={r.id} className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${SEVERITY_BADGE[r.severity]}`}
            >
              {r.severity}
            </span>
            <div className="text-[13px] text-neutral-800">
              <p>{r.statement}</p>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                links to: {r.linkedDimension}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MissingValidationSection({ items }: { items: MissingValidation[] }) {
  if (items.length === 0) return null
  return (
    <section
      aria-label="Missing validation"
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-neutral-900">
        Missing validation
      </h2>
      <ul className="mt-3 space-y-3">
        {items.map((m, i) => (
          <li key={i} className="space-y-1 text-[13px]">
            <p className="font-medium text-neutral-900">{m.question}</p>
            <p className="text-neutral-700">{m.whyItMatters}</p>
            <p className="text-neutral-600">
              <span className="text-[11px] uppercase tracking-wide text-neutral-500">
                How to check —{' '}
              </span>
              {m.howToCheck}
            </p>
            <p className="text-[11px] text-neutral-500">
              links to: {m.linkedDimension}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

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
      className="rounded-xl border border-verdict-refine-ring bg-verdict-refine-soft p-5"
    >
      <h2 className="text-sm font-semibold text-neutral-900">
        Suggested direction
      </h2>

      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-wide text-neutral-500">
          What&rsquo;s wrong
        </h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-neutral-800">
          {recommendation.whatsWrong.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-wide text-neutral-500">
          Improvements
        </h3>
        <ul className="mt-1 space-y-2 text-[13px] text-neutral-800">
          {recommendation.improvements.map((imp, i) => (
            <ImprovementRow key={i} improvement={imp} />
          ))}
        </ul>
      </div>

      {recommendation.smallerExperiment ? (
        <div className="mt-3">
          <h3 className="text-[11px] uppercase tracking-wide text-neutral-500">
            Smaller experiment
          </h3>
          <p className="mt-1 text-[13px] text-neutral-800">
            {recommendation.smallerExperiment}
          </p>
        </div>
      ) : null}

      <div className="mt-3">
        <h3 className="text-[11px] uppercase tracking-wide text-neutral-500">
          Re-evaluate when
        </h3>
        <p className="mt-1 text-[13px] text-neutral-800">
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
      <span className="text-[11px] text-neutral-500">
        targets {improvement.targetDimension} —{' '}
        {LIFT_LABEL[improvement.expectedLift]}
      </span>
    </li>
  )
}

function FooterMeta({ result }: { result: DecisionResult }) {
  return (
    <p className="text-[11px] text-neutral-500">
      {result.meta.model} · {result.meta.promptVersion} ·{' '}
      {result.meta.latencyMs} ms
    </p>
  )
}
