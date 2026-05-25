import markUrl from '../../assets/mark.svg'

interface HeaderProps {
  dark: boolean
  toggleDark: () => void
}

export function Header({ dark, toggleDark }: HeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white dark:border-surface-border dark:bg-surface-0">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
        {/* Brand — mark + wordmark only, no secondary copy */}
        <div className="flex items-center gap-3">
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
        </div>

        {/* Theme toggle only — no marketing copy */}
        <button
          type="button"
          onClick={toggleDark}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-500 dark:hover:bg-surface-2 dark:hover:text-neutral-300"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
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
