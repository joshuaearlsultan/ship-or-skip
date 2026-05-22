import type { IdeaMode } from './types/request'
import { Header } from './components/layout/Header'
import { InputSection } from './components/input/InputSection'
import { ResultPanel } from './components/result/ResultPanel'
import { useEvaluation } from './hooks/useEvaluation'

function App() {
  const { state, run, reset } = useEvaluation()
  const busy = state.status === 'loading'

  function handleRun(idea: string, mode: IdeaMode) {
    void run({ idea, mode })
  }

  function handleModeChange() {
    if (state.status !== 'idle') reset()
  }

  return (
    <div className="min-h-full bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        <InputSection
          busy={busy}
          onRun={handleRun}
          onModeChange={handleModeChange}
        />
        <ResultPanel state={state} />
      </main>
    </div>
  )
}

export default App
