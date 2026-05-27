import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { EvaluationState } from '../hooks/useEvaluation'
import type { Verdict } from '../types/decision'
import { DEMO_EXAMPLES } from '../data/demoExamples'
import { LandingNav } from '../components/layout/LandingNav'
import { ResultPanel } from '../components/result/ResultPanel'
import { VerdictIcon } from '../components/result/VerdictIcon'

interface DemoPageProps {
  dark: boolean
  toggleDark: () => void
}

export function DemoPage({ dark, toggleDark }: DemoPageProps) {
  const [selectedId, setSelectedId] = useState(DEMO_EXAMPLES[0].id)

  const selected = DEMO_EXAMPLES.find((e) => e.id === selectedId) ?? DEMO_EXAMPLES[0]

  // Construct a synthetic ready state — no hook, no API call, no loading
  const syntheticState: EvaluationState = {
    status: 'ready',
    request: { idea: selected.idea, mode: selected.mode },
    result: selected.result,
    fromCache: false,
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-0">
      <LandingNav dark={dark} toggleDark={toggleDark} />

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Example evaluations
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-500">
            Three pre-run evaluations showing each verdict outcome. No AI tokens consumed.
          </p>
        </div>

        {/* Example selector */}
        <div
          role="tablist"
          aria-label="Select an example evaluation"
          className="grid grid-cols-3 gap-3"
        >
          {DEMO_EXAMPLES.map((example) => (
            <ExampleCard
              key={example.id}
              title={example.title}
              rationale={example.rationale}
              verdict={example.result.verdict}
              active={example.id === selectedId}
              onClick={() => setSelectedId(example.id)}
            />
          ))}
        </div>

        {/* Idea text */}
        <IdeaBlock idea={selected.idea} mode={selected.mode === 'feature' ? 'Feature Idea' : selected.mode === 'change' ? 'Product Change' : 'Concept'} />

        {/* Full result — rendered via the existing ResultPanel, no reset button */}
        <ResultPanel state={syntheticState} />

        {/* CTA strip */}
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
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-sm dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              ← Back to landing
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Selector card ────────────────────────────────────────────────────────────

const VERDICT_CARD_ACTIVE: Record<Verdict, string> = {
  ship: 'bg-verdict-ship-soft border-verdict-ship-ring dark:bg-verdict-ship-dark-bg dark:border-verdict-ship-dark-ring',
  refine: 'bg-verdict-refine-soft border-verdict-refine-ring dark:bg-verdict-refine-dark-bg dark:border-verdict-refine-dark-ring',
  skip: 'bg-verdict-skip-soft border-verdict-skip-ring dark:bg-verdict-skip-dark-bg dark:border-verdict-skip-dark-ring',
}

const VERDICT_LABEL_COLOR: Record<Verdict, string> = {
  ship: 'text-verdict-ship dark:text-verdict-ship-vivid',
  refine: 'text-verdict-refine dark:text-verdict-refine-vivid',
  skip: 'text-verdict-skip dark:text-verdict-skip-vivid',
}

const VERDICT_LABEL: Record<Verdict, string> = {
  ship: 'SHIP',
  refine: 'REFINE',
  skip: 'SKIP',
}

interface ExampleCardProps {
  title: string
  rationale: string
  verdict: Verdict
  active: boolean
  onClick: () => void
}

function ExampleCard({ title, rationale, verdict, active, onClick }: ExampleCardProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex flex-col gap-2.5 rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-400',
        active
          ? VERDICT_CARD_ACTIVE[verdict]
          : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-surface-border dark:bg-surface-1 dark:hover:bg-surface-2',
      ].join(' ')}
    >
      {/* Icon + verdict label */}
      <div className="flex items-center gap-2">
        <VerdictIcon
          verdict={verdict}
          className={`h-6 w-6 shrink-0 ${active ? VERDICT_LABEL_COLOR[verdict] : 'text-neutral-300 dark:text-neutral-700'}`}
        />
        <span
          className={`text-sm font-bold tracking-tight ${active ? VERDICT_LABEL_COLOR[verdict] : 'text-neutral-400 dark:text-neutral-600'}`}
        >
          {VERDICT_LABEL[verdict]}
        </span>
      </div>

      {/* Title */}
      <span className="text-[13px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
        {title}
      </span>

      {/* One-line rationale */}
      <span className="text-[11px] leading-snug text-neutral-500 dark:text-neutral-500">
        {rationale}
      </span>
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
