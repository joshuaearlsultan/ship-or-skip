export type ApiErrorCode =
  | 'invalid_input'
  | 'rate_limited'
  | 'upstream_error'
  | 'schema_violation'
  | 'internal'
  | 'insufficient_credits'
  | 'invalid_api_key'
  | 'network_error'

export interface ApiError {
  code: ApiErrorCode
  message: string
  retryAfterMs?: number
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
