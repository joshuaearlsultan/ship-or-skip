import type { DecisionResult } from '../types/decision'
import type { IdeaMode } from '../types/request'

// In-memory cache — cleared on page reload, which is intentional.
// Keyed by mode + normalised idea text so identical requests skip Anthropic.
const cache = new Map<string, DecisionResult>()

function key(idea: string, mode: IdeaMode): string {
  // Collapse whitespace + lower-case so minor edits don't bust the cache
  return `${mode}::${idea.trim().toLowerCase().replace(/\s+/g, ' ')}`
}

export function getCached(idea: string, mode: IdeaMode): DecisionResult | null {
  return cache.get(key(idea, mode)) ?? null
}

export function setCached(idea: string, mode: IdeaMode, result: DecisionResult): void {
  cache.set(key(idea, mode), result)
}

export function cacheSize(): number {
  return cache.size
}
