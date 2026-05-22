export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-baseline justify-between px-6 py-5">
        <div className="flex items-baseline gap-3">
          <span className="text-base font-semibold tracking-tight text-neutral-900">
            Ship or Skip
          </span>
          <span className="text-xs text-neutral-500">
            Pre-build decision engine
          </span>
        </div>
        <span className="hidden text-xs text-neutral-500 sm:inline">
          Build the right thing — or don&rsquo;t build it at all.
        </span>
      </div>
    </header>
  )
}
