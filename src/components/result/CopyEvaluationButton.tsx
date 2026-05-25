import { useEffect, useRef, useState } from 'react'
import type { DecisionResult } from '../../types/decision'
import type { IdeaMode } from '../../types/request'
import { buildEvaluationMarkdown } from '../../lib/buildEvaluationMarkdown'

interface CopyEvaluationButtonProps {
  result: DecisionResult
  idea: string
  mode: IdeaMode
}

export function CopyEvaluationButton({
  result,
  idea,
  mode,
}: CopyEvaluationButtonProps) {
  const [toast, setToast] = useState<'idle' | 'success' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up the auto-dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleCopy() {
    const markdown = buildEvaluationMarkdown(result, idea, mode)
    try {
      await navigator.clipboard.writeText(markdown)
      setToast('success')
    } catch {
      setToast('error')
    }
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast('idle'), 2500)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-surface-border dark:bg-surface-1 dark:text-neutral-300 dark:hover:bg-surface-2"
      >
        <span aria-hidden>📋</span>
        Copy Evaluation
      </button>

      {/* Toast */}
      {toast !== 'idle' ? (
        <div
          role="status"
          aria-live="polite"
          className={[
            'absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium shadow-md',
            'pointer-events-none select-none',
            toast === 'success'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'bg-rose-600 text-white',
          ].join(' ')}
        >
          {toast === 'success'
            ? 'Evaluation copied to clipboard'
            : 'Copy failed — check clipboard permissions'}
        </div>
      ) : null}
    </div>
  )
}
