import type { DecisionResult, Verdict } from '../../types/decision'

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

// ─── Verdict icons ────────────────────────────────────────────────────────────
//
// All three share the same 64×64 origami boat geometry.
// Coordinates (2× scale of the master mark):
//   Left fold:  10,48  18,8  32,28  32,48
//   Right fold: 54,48  46,8  32,28  32,48
//   Hull:       10,48  54,48  52,58  12,58
//   Crease:     32,28 → 32,48
//
// Ship   — upright, two-tone (shadow/light panels), confident posture
// Refine — right fold ghosted + dashed crease, suggesting mid-re-fold
// Skip   — entire boat rotated +38° CW around (32,40), capsizing

interface VerdictIconProps {
  verdict: Verdict
  className?: string
}

function VerdictIcon({ verdict, className }: VerdictIconProps) {
  if (verdict === 'ship') return <ShipBoat className={className} />
  if (verdict === 'refine') return <RefineBoat className={className} />
  return <SkipBoat className={className} />
}

function ShipBoat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      {/* Left fold — shadow side, slightly muted */}
      <polygon
        points="10,48 18,8 32,28 32,48"
        fill="currentColor"
        opacity="0.50"
      />
      {/* Right fold — light side, full opacity */}
      <polygon points="54,48 46,8 32,28 32,48" fill="currentColor" />
      {/* Hull */}
      <polygon
        points="10,48 54,48 52,58 12,58"
        fill="currentColor"
        opacity="0.72"
      />
      {/* Center crease */}
      <line
        x1="32"
        y1="28"
        x2="32"
        y2="48"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.40"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RefineBoat({ className }: { className?: string }) {
  // Rotated −14° CCW around the boat's visual center (32, 40)
  // Right fold appears as a ghost (low opacity + dashed outline) —
  // the paper is being unfolded and re-shaped
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <g transform="rotate(-14, 32, 40)">
        {/* Left fold — stays solid, this side holds */}
        <polygon
          points="10,48 18,8 32,28 32,48"
          fill="currentColor"
          opacity="0.55"
        />
        {/* Right fold — ghosted fill, dashed outline = being unfolded */}
        <polygon
          points="54,48 46,8 32,28 32,48"
          fill="currentColor"
          opacity="0.18"
        />
        <polygon
          points="54,48 46,8 32,28 32,48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="3.5 2.5"
          strokeLinejoin="round"
          opacity="0.65"
        />
        {/* Hull */}
        <polygon
          points="10,48 54,48 52,58 12,58"
          fill="currentColor"
          opacity="0.70"
        />
        {/* Crease — dashed to signal "in progress" */}
        <line
          x1="32"
          y1="28"
          x2="32"
          y2="48"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.40"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
      </g>
    </svg>
  )
}

function SkipBoat({ className }: { className?: string }) {
  // Rotated +38° CW around (32, 40) — clearly capsizing
  // Reduced opacity overall reinforces the "fading out" feeling
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <g transform="rotate(38, 32, 40)">
        {/* Left fold */}
        <polygon
          points="10,48 18,8 32,28 32,48"
          fill="currentColor"
          opacity="0.45"
        />
        {/* Right fold */}
        <polygon
          points="54,48 46,8 32,28 32,48"
          fill="currentColor"
          opacity="0.75"
        />
        {/* Hull */}
        <polygon
          points="10,48 54,48 52,58 12,58"
          fill="currentColor"
          opacity="0.60"
        />
        {/* Center crease */}
        <line
          x1="32"
          y1="28"
          x2="32"
          y2="48"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.35"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
