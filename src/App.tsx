import { useEffect, useRef, useState } from 'react'
import type { IdeaMode } from './types/request'
import { Header } from './components/layout/Header'
import { InputSection } from './components/input/InputSection'
import { ResultPanel } from './components/result/ResultPanel'
import { useEvaluation } from './hooks/useEvaluation'

function App() {
  const { state, run, reset, evalMode, setEvalMode } = useEvaluation()
  const busy = state.status === 'loading'

  const [idea, setIdea] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  function handleRun(idea: string, mode: IdeaMode) {
    void run({ idea, mode })
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
    <div className="min-h-full bg-neutral-50 dark:bg-surface-0">
      <Header
          dark={dark}
          toggleDark={() => setDark((d) => !d)}
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
        <ResultPanel state={state} onReset={handleReset} onSwitchToMock={() => setEvalMode('mock')} />
      </main>
    </div>
  )
}

export default App
