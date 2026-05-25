export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Evaluating"
      className="space-y-4"
    >
      {/* Verdict card skeleton */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-surface-border dark:bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-xl bg-neutral-200 dark:bg-surface-2" />
            <div className="h-14 w-28 animate-pulse rounded-lg bg-neutral-200 dark:bg-surface-2" />
          </div>
          <div className="h-10 w-14 animate-pulse rounded-lg bg-neutral-200 dark:bg-surface-2" />
        </div>
        <div className="mt-4 flex gap-3">
          <div className="h-3 w-28 animate-pulse rounded bg-neutral-200 dark:bg-surface-2" />
          <div className="h-3 w-36 animate-pulse rounded bg-neutral-200 dark:bg-surface-2" />
        </div>
        <div className="mt-5 space-y-2 border-t border-neutral-100 pt-5 dark:border-surface-border">
          <div className="h-3 w-full animate-pulse rounded bg-neutral-100 dark:bg-surface-1" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100 dark:bg-surface-1" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-neutral-100 dark:bg-surface-1" />
        </div>
      </div>

      {/* Scorecard skeleton */}
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm dark:border-surface-border dark:bg-surface-1">
        <div className="mb-3 h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-surface-2" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-36 animate-pulse rounded bg-neutral-200 dark:bg-surface-2" />
              <div className="h-1 flex-1 animate-pulse rounded-full bg-neutral-100 dark:bg-surface-1" />
              <div className="h-3 w-6 animate-pulse rounded bg-neutral-200 dark:bg-surface-2" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-600">
        Scoring dimensions and weighting evidence.
      </p>
    </div>
  )
}
