import type { ApiError, ApiErrorCode } from '../types/api'

export interface FriendlyError {
  title: string
  message: string
  actions?: { label: string; href: string }[]
  showSwitchToMock?: boolean
}

const ERROR_MAP: Record<ApiErrorCode, FriendlyError> = {
  insufficient_credits: {
    title: 'Insufficient API credits',
    message:
      'Your Anthropic account has run out of credits. Add credits to continue using live evaluations, or switch to Mock Mode.',
    actions: [
      { label: 'Purchase credits', href: 'https://console.anthropic.com/settings/billing' },
    ],
    showSwitchToMock: true,
  },
  invalid_api_key: {
    title: 'Invalid API key',
    message:
      'The configured Anthropic API key was rejected. Verify that ANTHROPIC_API_KEY is set correctly in .env.local.',
    showSwitchToMock: true,
  },
  rate_limited: {
    title: 'Rate limit reached',
    message: 'Too many evaluations in a short window. Wait a few minutes and try again.',
  },
  upstream_error: {
    title: 'Anthropic API error',
    message: 'The Anthropic API returned an unexpected error. This is usually temporary — try again.',
    showSwitchToMock: true,
  },
  network_error: {
    title: 'Connection error',
    message:
      'Could not reach the evaluation server. Check your internet connection and try again.',
    showSwitchToMock: true,
  },
  schema_violation: {
    title: 'Unexpected response',
    message: 'The model returned a response in an unexpected format. Try again.',
  },
  invalid_input: {
    title: 'Not enough to evaluate',
    message:
      'Describe a specific feature idea, product change, or strategic concept. Including customer demand, usage data, revenue impact, or implementation constraints improves the evaluation.',
  },
  internal: {
    title: 'Something went wrong',
    message: 'An internal error occurred. Try again.',
  },
}

export function getFriendlyError(error: ApiError): FriendlyError {
  return ERROR_MAP[error.code] ?? { title: 'Evaluation failed', message: error.message }
}
