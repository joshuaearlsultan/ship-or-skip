import type { DecisionResult, Verdict } from '../../types/decision'

interface DecisionCardProps {
  result: DecisionResult
}

const VERDICT_LABEL: Record<Verdict, string> = {
  ship: 'Ship',
  refine: 'Refine',
  skip: 'Skip',
}

const VERDICT_PILL_CLASSES: Record<Verdict, string> = {
  ship: 'bg-verdict-ship-soft text-verdict-ship ring-1 ring-inset ring-verdict-ship-ring',
  refine:
    'bg-verdict-refine-soft text-verdict-refine ring-1 ring-inset ring-verdict-refine-ring',
  skip: 'bg-verdict-skip-soft text-verdict-skip ring-1 ring-inset ring-verdict-skip-ring',
}

export function DecisionCard({ result }: DecisionCardProps) {
  const { verdict, confidence, summary, scorecard } = result

  return (
    <section
      aria-label="Decision"
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={[
            'inline-flex items-baseline gap-2 rounded-full px-3 py-1 text-sm font-medium',
            VERDICT_PILL_CLASSES[verdict],
          ].join(' ')}
        >
          <span>{VERDICT_LABEL[verdict]}</span>
          <span className="font-normal opacity-80">({confidence}%)</span>
        </span>
        <span className="text-xs text-neutral-500">
          confidence — how much the model trusts this assessment
        </span>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">
        {summary}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Overall score" value={`${scorecard.overallScore}/100`} />
        <Metric
          label="Evidence quality"
          value={`${scorecard.evidenceQuality}%`}
        />
        <Metric
          label="Spread"
          value={scorecard.spread.toFixed(1)}
          hint="lower = more coherent"
        />
      </dl>
    </section>
  )
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-neutral-500">{hint}</p>
      ) : null}
    </div>
  )
}
