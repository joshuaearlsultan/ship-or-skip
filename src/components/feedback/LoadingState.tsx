import { useEffect, useRef, useState } from 'react'

const STEPS = [
  'Analyzing input',
  'Reviewing evidence',
  'Evaluating tradeoffs',
  'Scoring dimensions',
  'Computing verdict',
]

// SVG arc spinner — r=40, circumference ≈ 251, 78% arc ≈ 196px, gap ≈ 55px
function EvalSpinner() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 100 100"
      aria-hidden
      className="animate-spin text-neutral-800 dark:text-neutral-200"
      style={{ animationDuration: '1.4s', animationTimingFunction: 'linear' }}
    >
      {/* Track ring */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeOpacity="0.1"
      />
      {/* Spinning arc — 78 % of circumference */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="196 55"
        strokeDashoffset="0"
      />
    </svg>
  )
}

export function LoadingState() {
  const [step, setStep] = useState(0)
  const [fade, setFade] = useState(true)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      fadeTimerRef.current = setTimeout(() => {
        setStep((s) => (s + 1) % STEPS.length)
        setFade(true)
      }, 200)
    }, 1800)
    return () => {
      clearInterval(interval)
      if (fadeTimerRef.current !== null) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Evaluating your idea"
      className="flex min-h-[280px] flex-col items-center justify-center gap-5 rounded-xl border border-neutral-200 bg-white px-8 py-12 shadow-sm dark:border-surface-border dark:bg-surface-1"
    >
      <EvalSpinner />

      <p className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-200">
        Evaluating your idea&hellip;
      </p>

      <p
        aria-hidden
        className="text-sm text-neutral-500 transition-opacity duration-200 dark:text-neutral-500"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {STEPS[step]}
      </p>
    </div>
  )
}
