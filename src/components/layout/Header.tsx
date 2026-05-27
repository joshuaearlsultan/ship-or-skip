import { Link } from 'react-router-dom'
import markUrl from '../../assets/mark.svg'
import type { EvalMode } from '../../hooks/useEvaluation'

interface HeaderProps {
  dark: boolean
  toggleDark: () => void
  evalMode: EvalMode
  onEvalModeChange: (mode: EvalMode) => void
}

export function Header({ dark, toggleDark, evalMode, onEvalModeChange }: HeaderProps) {
  function handleModeBadgeClick() {
    if (evalMode === 'mock') {
      const confirmed = window.confirm(
        'Live Claude evaluations will consume Anthropic API credits.\n\nContinue?',
      )
      if (confirmed) onEvalModeChange('claude')
    } else {
      onEvalModeChange('mock')
    }
  }

  return (
    <header className="border-b border-neutral-200 bg-white dark:border-surface-border dark:bg-surface-0">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-sm">
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

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Eval mode badge — clickable toggle */}
          <button
            type="button"
            onClick={handleModeBadgeClick}
            title={
              evalMode === 'mock'
                ? 'Switch to live Claude evaluations'
                : 'Switch back to mock mode'
            }
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              evalMode === 'mock'
                ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-100 focus-visible:ring-amber-400 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800 dark:hover:bg-amber-900'
                : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 focus-visible:ring-blue-400 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-800 dark:hover:bg-blue-900',
            ].join(' ')}
          >
            <span aria-hidden>{evalMode === 'mock' ? '🧪' : '🤖'}</span>
            {evalMode === 'mock' ? 'Mock Mode' : 'Claude Mode'}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-500 dark:hover:bg-surface-2 dark:hover:text-neutral-300"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}

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
