import type { DecisionResult, Verdict } from '../../types/decision'
import { VerdictIcon } from './VerdictIcon'

interface DecisionCardProps {
  result: DecisionResult
}

const VERDICT_LABEL: Record<Verdict, string> = {
  ship: 'Ship',
  refine: 'Refine',
  skip: 'Skip',
}

/** Full-card verdict-tinted background */
const VERDICT_CARD: Record<Verdict, string> = {
  ship: 'bg-verdict-ship-soft border-verdict-ship-ring dark:bg-verdict-ship-dark-bg dark:border-verdict-ship-dark-ring',
  refine:
    'bg-verdict-refine-soft border-verdict-refine-ring dark:bg-verdict-refine-dark-bg dark:border-verdict-refine-dark-ring',
  skip: 'bg-verdict-skip-soft border-verdict-skip-ring dark:bg-verdict-skip-dark-bg dark:border-verdict-skip-dark-ring',
}

/** Verdict label + icon color */
const VERDICT_HEADING: Record<Verdict, string> = {
  ship: 'text-verdict-ship dark:text-verdict-ship-vivid',
  refine: 'text-verdict-refine dark:text-verdict-refine-vivid',
  skip: 'text-verdict-skip dark:text-verdict-skip-vivid',
}

/** Divider between hero area and summary */
const VERDICT_DIVIDER: Record<Verdict, string> = {
  ship: 'border-verdict-ship-ring dark:border-verdict-ship-dark-ring',
  refine: 'border-verdict-refine-ring dark:border-verdict-refine-dark-ring',
  skip: 'border-verdict-skip-ring dark:border-verdict-skip-dark-ring',
}

export function DecisionCard({ result }: DecisionCardProps) {
  const { verdict, confidence, summary, scorecard } = result

  return (
    <section
      aria-label="Decision"
      className={`overflow-hidden rounded-xl border shadow-sm ${VERDICT_CARD[verdict]}`}
    >
      {/* Hero area */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center justify-between gap-4">
          {/* Icon + verdict label */}
          <div className="flex items-center gap-4">
            <VerdictIcon
              verdict={verdict}
              className={`h-16 w-16 shrink-0 ${VERDICT_HEADING[verdict]}`}
            />
            <span
              className={`text-5xl sm:text-6xl font-bold leading-none tracking-tight ${VERDICT_HEADING[verdict]}`}
            >
              {VERDICT_LABEL[verdict]}
            </span>
          </div>

          {/* Overall score */}
          <div className="text-right leading-none">
            <span
              className={`text-[2rem] sm:text-[2.75rem] font-bold tabular-nums leading-none ${VERDICT_HEADING[verdict]}`}
            >
              {scorecard.overallScore}
            </span>
            <span
              className={`text-lg font-normal opacity-50 ${VERDICT_HEADING[verdict]}`}
            >
              /100
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div
          className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium opacity-70 ${VERDICT_HEADING[verdict]}`}
        >
          <span>{confidence}% confidence</span>
          <span aria-hidden className="opacity-60">
            ·
          </span>
          <span>Evidence quality {scorecard.evidenceQuality}%</span>
        </div>
      </div>

      {/* Summary */}
      <div className={`border-t px-6 py-5 ${VERDICT_DIVIDER[verdict]}`}>
        <p className="text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
          {summary}
        </p>
      </div>
    </section>
  )
}

