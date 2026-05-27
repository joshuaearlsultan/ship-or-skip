import { useCallback, useRef, useState } from 'react'
import type { DecisionResult } from '../types/decision'
import type { EvaluationRequest } from '../types/request'
import type { ApiError } from '../types/api'
import { evaluate } from '../lib/api'
import { resolveMockResult } from '../data/examples'
import { getCached, setCached } from '../lib/evaluationCache'

export type EvalMode = 'mock' | 'claude'

export type EvaluationState =
  | { status: 'idle' }
  | { status: 'loading'; request: EvaluationRequest }
  | { status: 'ready'; request: EvaluationRequest; result: DecisionResult; fromCache: boolean }
  | { status: 'error'; request: EvaluationRequest; error: ApiError }
  | { status: 'mock-blocked' }

export function useEvaluation() {
  const [state, setState] = useState<EvaluationState>({ status: 'idle' })
  const [evalMode, setEvalMode] = useState<EvalMode>('mock')
  const abortRef = useRef<AbortController | null>(null)
  // Ref so `run` always sees the current mode without needing a dep-array rebuild
  const evalModeRef = useRef<EvalMode>('mock')

  const handleSetEvalMode = useCallback((mode: EvalMode) => {
    evalModeRef.current = mode
    setEvalMode(mode)
  }, [])

  const run = useCallback(async (request: EvaluationRequest, options?: { fromExample?: boolean }) => {
    const trimmed = request.idea.trim()
    if (trimmed.length === 0) {
      setState({
        status: 'error',
        request,
        error: { code: 'invalid_input', message: 'Enter an idea before running.' },
      })
      return
    }

    const activeRequest: EvaluationRequest = { ...request, idea: trimmed }
    const mode = evalModeRef.current

    // ── Mock mode: resolve locally, no network call ────────────────────────
    if (mode === 'mock') {
      // Only built-in examples are supported in Mock Mode. Arbitrary text is
      // blocked immediately — no loading state, no delay.
      if (!options?.fromExample) {
        setState({ status: 'mock-blocked' })
        return
      }
      setState({ status: 'loading', request: activeRequest })
      // Brief pause so the skeleton loading state is visible
      await new Promise<void>((resolve) => setTimeout(resolve, 700))
      const data = resolveMockResult(activeRequest.mode, trimmed)
      setState({ status: 'ready', request: activeRequest, result: data, fromCache: false })
      return
    }

    // ── Claude mode: check in-memory cache first ───────────────────────────
    const cached = getCached(trimmed, activeRequest.mode)
    if (cached) {
      setState({ status: 'ready', request: activeRequest, result: cached, fromCache: true })
      return
    }

    // ── Claude mode: live Anthropic call ───────────────────────────────────
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ status: 'loading', request: activeRequest })

    try {
      const response = await evaluate(activeRequest, controller.signal)

      if (controller.signal.aborted) return

      if (response.ok) {
        setCached(trimmed, activeRequest.mode, response.data)
        setState({ status: 'ready', request: activeRequest, result: response.data, fromCache: false })
      } else {
        setState({ status: 'error', request: activeRequest, error: response.error })
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setState({
        status: 'error',
        request: activeRequest,
        error: { code: 'internal', message: 'Unexpected error. Try again.' },
      })
    }
  }, []) // stable — reads mode via ref

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({ status: 'idle' })
  }, [])

  return { state, run, reset, evalMode, setEvalMode: handleSetEvalMode }
}
