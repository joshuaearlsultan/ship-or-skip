import { useMemo, useState } from 'react'
import type { IdeaMode } from '../../types/request'
import { MODE_DESCRIPTORS } from '../../types/request'
import { examplesForMode } from '../../data/examples'
import { ModeTabs } from './ModeTabs'

interface InputSectionProps {
  busy: boolean
  idea: string
  onIdeaChange: (value: string) => void
  onRun: (idea: string, mode: IdeaMode, fromExample?: boolean) => void
  onModeChange?: (mode: IdeaMode) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

const MAX_LEN = 2000

export function InputSection({ busy, idea, onIdeaChange, onRun, onModeChange, textareaRef }: InputSectionProps) {
  const [mode, setMode] = useState<IdeaMode>('feature')
  const [exampleIndex, setExampleIndex] = useState(0)

  const descriptor = useMemo(
    () => MODE_DESCRIPTORS.find((d) => d.id === mode)!,
    [mode],
  )

  const examples = useMemo(() => examplesForMode(mode), [mode])
  const trimmed = idea.trim()
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length
  const canRun = wordCount >= 3 && !busy
  const remaining = MAX_LEN - idea.length

  function handleModeChange(next: IdeaMode) {
    setMode(next)
    setExampleIndex(0)
    onModeChange?.(next)
  }

  function handleTryExample() {
    if (examples.length === 0) return
    const next = examples[exampleIndex % examples.length]
    onIdeaChange(next.idea)
    setExampleIndex((i) => i + 1)
    onRun(next.idea.trim(), mode, true)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canRun) return
    onRun(trimmed, mode)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Step 1 — choose evaluation type */}
      <ModeTabs value={mode} onChange={handleModeChange} disabled={busy} />

      {/* Step 2 — self-contained Q&A card */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-surface-border dark:bg-surface-1">

        {/*
          Blurb as card header and accessible label.
          Serves double duty: visible question for the user,
          and the <label> association for the textarea via htmlFor.
          Replaces the previous separate blurb + duplicate inputLabel.
        */}
        <label
          htmlFor="idea"
          className="block cursor-default border-b border-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 dark:border-surface-border dark:text-neutral-400"
        >
          {descriptor.blurb}
        </label>

        {/* Textarea — rows reduced from 5 → 4 (~20% shorter); resize-y preserved */}
        <textarea
          ref={textareaRef}
          id="idea"
          name="idea"
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value.slice(0, MAX_LEN))}
          placeholder={descriptor.placeholder}
          rows={4}
          disabled={busy}
          className="block w-full resize-y border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-60 dark:text-neutral-100 dark:placeholder:text-neutral-600"
        />

        {/* Footer */}
        <div className="border-t border-neutral-100 px-4 py-2.5 dark:border-surface-border">

          {/* Row 1 — hints (when empty) or clear button (when filled) + char count */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-600">
            {trimmed.length === 0 ? (
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  Include:
                </span>
                {descriptor.hints.map((hint) => (
                  <span
                    key={hint}
                    className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500 dark:bg-surface-2 dark:text-neutral-500"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onIdeaChange('')}
                disabled={busy}
                aria-label="Clear idea text"
                title="Clear"
                className="flex items-center gap-1 text-[11px] text-neutral-400 transition-colors hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:pointer-events-none dark:text-neutral-600 dark:hover:text-neutral-400"
              >
                <XIcon />
                Clear
              </button>
            )}
            <span className="ml-3 shrink-0" aria-hidden>
              {remaining} left
            </span>
          </div>

          {/* Row 2 — onboarding prompt; only shown when the textarea is empty */}
          {trimmed.length === 0 && examples.length > 0 ? (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                Not sure what to write?
              </span>
              <button
                type="button"
                onClick={handleTryExample}
                disabled={busy}
                className="text-[11px] font-medium text-neutral-500 underline-offset-2 transition-colors hover:text-neutral-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:pointer-events-none dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                Try Example
              </button>
            </div>
          ) : null}

        </div>
      </div>

      {/* Step 3 — single primary action */}
      <div className="flex items-center">
        <button
          type="submit"
          disabled={!canRun}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white dark:disabled:bg-surface-2 dark:disabled:text-neutral-600"
        >
          {busy ? 'Running…' : 'Run Ship or Skip'}
        </button>
      </div>

    </form>
  )
}

function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
