import type { EvaluationRequest } from '../types/request'
import type { DecisionResult } from '../types/decision'
import type { ApiError, ApiResponse } from '../types/api'
import { parseDecisionResult } from './schema'

export async function evaluate(
  request: EvaluationRequest,
  signal?: AbortSignal,
): Promise<ApiResponse<DecisionResult>> {
  let response: Response
  try {
    response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sos-version': '1',
      },
      body: JSON.stringify(request),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    return {
      ok: false,
      error: { code: 'internal', message: 'Network error. Check your connection and try again.' },
    }
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    return {
      ok: false,
      error: { code: 'internal', message: 'Server returned an unreadable response.' },
    }
  }

  if (!response.ok) {
    const err = (json as { error?: ApiError }).error
    return {
      ok: false,
      error: err ?? { code: 'internal', message: `Request failed (${response.status}).` },
    }
  }

  try {
    const data = parseDecisionResult(json)
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      error: { code: 'schema_violation', message: 'Server returned an unexpected response shape.' },
    }
  }
}
