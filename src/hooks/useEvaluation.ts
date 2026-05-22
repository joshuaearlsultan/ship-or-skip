import { useCallback, useRef, useState } from 'react'
import type { DecisionResult } from '../types/decision'
import type { EvaluationRequest } from '../types/request'
import type { ApiError } from '../types/api'
import { evaluate } from '../lib/api'

export type EvaluationState =
  | { status: 'idle' }
  | { status: 'loading'; request: EvaluationRequest }
  | { status: 'ready'; request: EvaluationRequest; result: DecisionResult }
  | { status: 'error'; request: EvaluationRequest; error: ApiError }

export function useEvaluation() {
  const [state, setState] = useState<EvaluationState>({ status: 'idle' })
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async (request: EvaluationRequest) => {
    const trimmed = request.idea.trim()
    if (trimmed.length === 0) {
      setState({
        status: 'error',
        request,
        error: { code: 'invalid_input', message: 'Enter an idea before running.' },
      })
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const activeRequest: EvaluationRequest = { ...request, idea: trimmed }
    setState({ status: 'loading', request: activeRequest })

    try {
      const response = await evaluate(activeRequest, controller.signal)

      if (controller.signal.aborted) return

      if (response.ok) {
        setState({ status: 'ready', request: activeRequest, result: response.data })
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
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({ status: 'idle' })
  }, [])

  return { state, run, reset }
}
