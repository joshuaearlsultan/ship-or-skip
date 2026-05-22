export type ApiErrorCode =
  | 'invalid_input'
  | 'rate_limited'
  | 'upstream_error'
  | 'schema_violation'
  | 'internal'

export interface ApiError {
  code: ApiErrorCode
  message: string
  retryAfterMs?: number
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
