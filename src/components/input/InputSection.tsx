import { useMemo, useState } from 'react'
import type { IdeaMode } from '../../types/request'
import { MODE_DESCRIPTORS } from '../../types/request'
import { examplesForMode } from '../../data/examples'
import { ModeTabs } from './ModeTabs'

interface InputSectionProps {
  busy: boolean
  onRun: (idea: string, mode: IdeaMode) => void
  onModeChange?: (mode: IdeaMode) => void
}

const MAX_LEN = 2000

export function InputSection({ busy, onRun, onModeChange }: InputSectionProps) {
  const [mode, setMode] = useState<IdeaMode>('feature')
  const [idea, setIdea] = useState('')
  const [exampleIndex, setExampleIndex] = useState(0)

  const descriptor = useMemo(
    () => MODE_DESCRIPTORS.find((d) => d.id === mode)!,
    [mode],
  )

  const examples = useMemo(() => examplesForMode(mode), [mode])
  const trimmed = idea.trim()
  const canRun = trimmed.length > 0 && !busy
  const remaining = MAX_LEN - idea.length

  function handleModeChange(next: IdeaMode) {
    setMode(next)
    setExampleIndex(0)
    onModeChange?.(next)
  }

  function handleTryExample() {
    if (examples.length === 0) return
    const next = examples[exampleIndex % examples.length]
    setIdea(next.idea)
    setExampleIndex((i) => i + 1)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canRun) return
    onRun(trimmed, mode)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ModeTabs value={mode} onChange={handleModeChange} disabled={busy} />
        <p className="text-xs text-neutral-500">{descriptor.blurb}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <label
          htmlFor="idea"
          className="block px-4 pt-4 text-sm font-medium text-neutral-700"
        >
          {descriptor.inputLabel}
        </label>
        <textarea
          id="idea"
          name="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value.slice(0, MAX_LEN))}
          placeholder={descriptor.placeholder}
          rows={5}
          disabled={busy}
          className="block w-full resize-y border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5 text-xs text-neutral-500">
          <span>
            {trimmed.length === 0
              ? 'Describe the idea in plain language.'
              : `${trimmed.length} characters`}
          </span>
          <span aria-hidden>{remaining}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={!canRun}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {busy ? 'Running…' : 'Run Ship or Skip'}
        </button>
        <button
          type="button"
          onClick={handleTryExample}
          disabled={busy || examples.length === 0}
          className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Try Example
        </button>
      </div>
    </form>
  )
}
