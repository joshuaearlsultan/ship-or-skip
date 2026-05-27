import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { EvaluationState } from '../hooks/useEvaluation'
import type { IdeaMode } from '../types/request'
import type { Verdict } from '../types/decision'
import { DEMO_EXAMPLES } from '../data/demoExamples'
import { LandingNav } from '../components/layout/LandingNav'
import { ResultPanel } from '../components/result/ResultPanel'
import { VerdictIcon } from '../components/result/VerdictIcon'

interface DemoPageProps {
  dark: boolean
  toggleDark: () => void
}

// ─── Static config ─────────────────────────────────────────────────────────────

const MODE_GROUPS: { mode: IdeaMode; label: string }[] = [
  { mode: 'feature', label: 'Feature Ideas' },
  { mode: 'change', label: 'Product Changes' },
  { mode: 'concept', label: 'Strategic Concepts' },
]

const MODE_LABEL: Record<IdeaMode, string> = {
  feature: 'Feature Idea',
  change: 'Product Change',
  concept: 'Strategic Concept',
}

const VERDICT_LABEL: Record<Verdict, string> = {
  ship: 'SHIP',
  refine: 'REFINE',
  skip: 'SKIP',
}

const VERDICT_LABEL_COLOR: Record<Verdict, string> = {
  ship: 'text-verdict-ship dark:text-verdict-ship-vivid',
  refine: 'text-verdict-refine dark:text-verdict-refine-vivid',
  skip: 'text-verdict-skip dark:text-verdict-skip-vivid',
}

// Active row: light verdict tint background + verdict-coloured left border
const VERDICT_ROW_ACTIVE_BG: Record<Verdict, string> = {
  ship: 'bg-verdict-ship-soft dark:bg-verdict-ship-dark-bg',
  refine: 'bg-verdict-refine-soft dark:bg-verdict-refine-dark-bg',
  skip: 'bg-verdict-skip-soft dark:bg-verdict-skip-dark-bg',
}

const VERDICT_ROW_ACTIVE_BORDER: Record<Verdict, string> = {
  ship: 'border-l-2 border-verdict-ship-ring dark:border-verdict-ship-dark-ring',
  refine: 'border-l-2 border-verdict-refine-ring dark:border-verdict-refine-dark-ring',
  skip: 'border-l-2 border-verdict-skip-ring dark:border-verdict-skip-dark-ring',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function DemoPage({ dark, toggleDark }: DemoPageProps) {
  const [selectedId, setSelectedId] = useState(DEMO_EXAMPLES[0].id)

  const selected = DEMO_EXAMPLES.find((e) => e.id === selectedId) ?? DEMO_EXAMPLES[0]

  // Synthetic ready state — no hook, no API call, no loading
  const syntheticState: EvaluationState = {
    status: 'ready',
    request: { idea: selected.idea, mode: selected.mode },
    result: selected.result,
    fromCache: false,
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-0">
      <LandingNav dark={dark} toggleDark={toggleDark} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* ── Left: sticky example selector (lg+) ─────────────────────── */}
          <aside className="lg:sticky lg:top-6 lg:w-72 lg:shrink-0">

            {/* Sidebar header */}
            <div className="mb-5 px-3">
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Explore Example Decisions
              </h1>
              <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-500">
                5 evaluations · 3 modes · 3 verdicts · No AI tokens
              </p>
            </div>

            {/* Grouped example list */}
            <nav aria-label="Example evaluations">
              {MODE_GROUPS.map(({ mode, label }, i) => {
                const group = DEMO_EXAMPLES.filter((e) => e.mode === mode)
                if (group.length === 0) return null
                return (
                  <div key={mode} className={i > 0 ? 'mt-4' : ''}>
                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                      {label}
                    </p>
                    {group.map((example) => (
                      <ExampleRow
                        key={example.id}
                        title={example.title}
                        rationale={example.rationale}
                        verdict={example.result.verdict}
                        active={example.id === selectedId}
                        onClick={() => setSelectedId(example.id)}
                      />
                    ))}
                  </div>
                )
              })}
            </nav>
          </aside>

          {/* ── Right: evaluation result ─────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-6">
            <IdeaBlock idea={selected.idea} mode={MODE_LABEL[selected.mode]} />
            <ResultPanel state={syntheticState} />
            <CTAStrip />
          </div>

        </div>
      </main>
    </div>
  )
}

// ─── Example row ──────────────────────────────────────────────────────────────

interface ExampleRowProps {
  title: string
  rationale: string
  verdict: Verdict
  active: boolean
  onClick: () => void
}

function ExampleRow({ title, rationale, verdict, active, onClick }: ExampleRowProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600',
        active
          ? `${VERDICT_ROW_ACTIVE_BG[verdict]} ${VERDICT_ROW_ACTIVE_BORDER[verdict]}`
          : 'hover:bg-neutral-100/60 dark:hover:bg-white/[0.04]',
      ].join(' ')}
    >
      <VerdictIcon
        verdict={verdict}
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          active ? VERDICT_LABEL_COLOR[verdict] : 'text-neutral-300 dark:text-neutral-700'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </span>
          <span
            className={`shrink-0 text-[10px] font-bold tracking-wide ${
              active
                ? VERDICT_LABEL_COLOR[verdict]
                : 'text-neutral-400 dark:text-neutral-600'
            }`}
          >
            {VERDICT_LABEL[verdict]}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 dark:text-neutral-500">
          {rationale}
        </p>
      </div>
    </button>
  )
}

// ─── Idea block ───────────────────────────────────────────────────────────────

function IdeaBlock({ idea, mode }: { idea: string; mode: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm dark:border-surface-border dark:bg-surface-1">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
        {mode} · Input evaluated
      </p>
      <p className="text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        {idea}
      </p>
    </div>
  )
}

// ─── CTA strip ────────────────────────────────────────────────────────────────

function CTAStrip() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-6 py-5 dark:border-surface-border dark:bg-surface-1">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Ready to evaluate your own idea?
      </p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
        Paste any feature, change, or concept and get a scored verdict in seconds.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          to="/evaluate"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
        >
          Run Ship or Skip
        </Link>
        <Link
          to="/"
          className="rounded-sm text-sm text-neutral-500 transition-colors hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          ← Back to landing
        </Link>
      </div>
    </div>
  )
}
