import { useRef, useState } from 'react'
import type { IdeaMode } from '../types/request'
import { Header } from '../components/layout/Header'
import { InputSection } from '../components/input/InputSection'
import { ResultPanel } from '../components/result/ResultPanel'
import { useEvaluation } from '../hooks/useEvaluation'

interface EvaluatorPageProps {
  dark: boolean
  toggleDark: () => void
}

export function EvaluatorPage({ dark, toggleDark }: EvaluatorPageProps) {
  const { state, run, reset, evalMode, setEvalMode } = useEvaluation()
  const busy = state.status === 'loading'

  const [idea, setIdea] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleRun(idea: string, mode: IdeaMode, fromExample?: boolean) {
    void run({ idea, mode }, { fromExample })
  }

  function handleSwitchToClaude() {
    reset()
    setEvalMode('claude')
  }

  function handleModeChange() {
    if (state.status !== 'idle') reset()
  }

  function handleReset() {
    reset()
    setIdea('')
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-0">
      <Header
        dark={dark}
        toggleDark={toggleDark}
        evalMode={evalMode}
        onEvalModeChange={setEvalMode}
      />
      <main className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        <InputSection
          busy={busy}
          idea={idea}
          onIdeaChange={setIdea}
          textareaRef={textareaRef}
          onRun={handleRun}
          onModeChange={handleModeChange}
        />
        <ResultPanel
          state={state}
          onReset={handleReset}
          onSwitchToMock={() => setEvalMode('mock')}
          onSwitchToClaude={handleSwitchToClaude}
        />
      </main>
    </div>
  )
}
