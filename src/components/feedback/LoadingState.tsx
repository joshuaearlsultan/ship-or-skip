export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Evaluating"
      className="space-y-4"
    >
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-3 h-4 w-28 animate-pulse rounded bg-neutral-200" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-40 animate-pulse rounded bg-neutral-200" />
              <div className="h-2 flex-1 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-8 animate-pulse rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Scoring dimensions and weighting evidence.
      </p>
    </div>
  )
}
