import { Link } from 'react-router-dom'
import markUrl from '../assets/mark.svg'
import { VerdictIcon } from '../components/result/VerdictIcon'

interface LandingPageProps {
  dark: boolean
  toggleDark: () => void
}

export function LandingPage({ dark, toggleDark }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-0">
      <LandingNav dark={dark} toggleDark={toggleDark} />
      <main>
        <HeroSection />
        <VerdictSection />
        <HowItWorksSection />
        <WhyTeamsSection />
      </main>
      <LandingFooter />
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function LandingNav({ dark, toggleDark }: { dark: boolean; toggleDark: () => void }) {
  return (
    <header className="border-b border-neutral-200 bg-white dark:border-surface-border dark:bg-surface-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          <img
            src={markUrl}
            alt=""
            aria-hidden
            width={24}
            height={24}
            className="dark:[filter:brightness(0)_invert(1)_opacity(0.85)]"
          />
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Ship or Skip
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-500 dark:hover:bg-surface-2 dark:hover:text-neutral-300"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link
            to="/evaluate"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
          >
            Try it now
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
        Is your idea worth building?
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
        Ship or Skip evaluates product ideas, features, and changes before a single line of code is written.
        Get a structured verdict — <strong className="font-semibold text-neutral-800 dark:text-neutral-200">Ship</strong>,{' '}
        <strong className="font-semibold text-neutral-800 dark:text-neutral-200">Refine</strong>, or{' '}
        <strong className="font-semibold text-neutral-800 dark:text-neutral-200">Skip</strong> — with scores and
        reasoning in seconds.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/evaluate"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
        >
          Run Ship or Skip
        </Link>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-400 cursor-not-allowed dark:border-surface-border dark:bg-surface-1 dark:text-neutral-600"
        >
          View Example Decisions
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-surface-2 dark:text-neutral-500">
            Coming soon
          </span>
        </button>
      </div>
    </section>
  )
}

// ─── Verdict showcase ─────────────────────────────────────────────────────────

const VERDICTS = [
  {
    verdict: 'ship' as const,
    card: 'bg-verdict-ship-soft border-verdict-ship-ring dark:bg-verdict-ship-dark-bg dark:border-verdict-ship-dark-ring',
    heading: 'text-verdict-ship dark:text-verdict-ship-vivid',
    label: 'SHIP',
    description: 'Strong signal, clear user value, and manageable risk. This idea is ready to build.',
  },
  {
    verdict: 'refine' as const,
    card: 'bg-verdict-refine-soft border-verdict-refine-ring dark:bg-verdict-refine-dark-bg dark:border-verdict-refine-dark-ring',
    heading: 'text-verdict-refine dark:text-verdict-refine-vivid',
    label: 'REFINE',
    description: 'Promising but incomplete. Specific gaps need closing before it\'s worth committing to.',
  },
  {
    verdict: 'skip' as const,
    card: 'bg-verdict-skip-soft border-verdict-skip-ring dark:bg-verdict-skip-dark-bg dark:border-verdict-skip-dark-ring',
    heading: 'text-verdict-skip dark:text-verdict-skip-vivid',
    label: 'SKIP',
    description: 'Weak signal, high risk, or unclear value. Redirect your team\'s time elsewhere.',
  },
] as const

function VerdictSection() {
  return (
    <section className="bg-neutral-50 dark:bg-surface-1 border-y border-neutral-100 dark:border-surface-border">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-500">
          Every evaluation ends with one of three verdicts
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {VERDICTS.map(({ verdict, card, heading, label, description }) => (
            <div
              key={verdict}
              className={`rounded-xl border p-6 ${card}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <VerdictIcon verdict={verdict} className={`h-10 w-10 shrink-0 ${heading}`} />
                <span className={`text-2xl font-bold tracking-tight ${heading}`}>{label}</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    title: 'Describe your idea',
    body: 'Write a plain-English description of the feature, change, or concept you\'re considering. Include the problem, target user, and expected outcome.',
  },
  {
    number: '02',
    title: 'Choose an evaluation mode',
    body: 'Select Feature Idea, Product Change, or New Concept. Each mode uses a tailored rubric for that type of decision.',
  },
  {
    number: '03',
    title: 'Get a structured verdict',
    body: 'Receive a Ship, Refine, or Skip verdict with dimension-by-dimension scores, identified risks, and concrete next steps.',
  },
] as const

function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        How it works
      </h2>
      <div className="grid gap-8 sm:grid-cols-3">
        {STEPS.map(({ number, title, body }) => (
          <div key={number} className="flex flex-col gap-3">
            <span className="text-3xl font-bold tabular-nums text-neutral-200 dark:text-neutral-700 leading-none">
              {number}
            </span>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Why teams ────────────────────────────────────────────────────────────────

const REASONS = [
  {
    title: 'Gut-check before grooming',
    body: 'Catch weak ideas before they consume sprint planning, design, and engineering hours.',
  },
  {
    title: 'Structured, not arbitrary',
    body: 'Scores across seven dimensions — not one vague thumbs-up. Every verdict comes with reasoning you can act on.',
  },
  {
    title: 'Faster alignment',
    body: 'Share a one-page evaluation with your team instead of re-litigating the same debate in three different meetings.',
  },
  {
    title: 'Works at any stage',
    body: 'Evaluate early-stage concepts, proposed changes to existing features, or anything in between.',
  },
] as const

function WhyTeamsSection() {
  return (
    <section className="bg-neutral-50 dark:bg-surface-1 border-t border-neutral-100 dark:border-surface-border">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Why teams use it
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {REASONS.map(({ title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-surface-border dark:bg-surface-0"
            >
              <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/evaluate"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
          >
            Run your first evaluation
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-surface-border dark:bg-surface-0">
      <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={markUrl}
            alt=""
            aria-hidden
            width={18}
            height={18}
            className="opacity-40 dark:[filter:brightness(0)_invert(1)_opacity(0.35)]"
          />
          <span className="text-xs text-neutral-400 dark:text-neutral-600">
            Ship or Skip
          </span>
        </div>
        <Link
          to="/evaluate"
          className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-sm dark:text-neutral-600 dark:hover:text-neutral-300"
        >
          Open evaluator →
        </Link>
      </div>
    </footer>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M11.54 4.46l1.06-1.06M3.4 12.6l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M13.5 9A6 6 0 0 1 7 2.5c0-.4.04-.79.11-1.17A6.5 6.5 0 1 0 14.67 8.9 5.9 5.9 0 0 1 13.5 9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
