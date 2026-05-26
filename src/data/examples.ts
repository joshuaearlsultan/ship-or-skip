import type { IdeaMode } from '../types/request'
import type { DecisionResult } from '../types/decision'
import {
  refineChangeMock,
  refineConceptMock,
  shipFeatureMock,
  skipFeatureMock,
} from './mockResults'

export interface Example {
  id: string
  mode: IdeaMode
  idea: string
  preview: string
}

export const EXAMPLES: Example[] = [
  {
    id: 'feature-bulk-export',
    mode: 'feature',
    idea:
      'Add bulk CSV export to the reporting dashboard. 18 enterprise customers have asked for it in support tickets over the last quarter; three said it is blocking procurement sign-off.',
    preview: 'Bulk CSV export — validated enterprise request',
  },
  {
    id: 'feature-social-feed',
    mode: 'feature',
    idea:
      'Add a social feed so users can share progress and increase engagement.',
    preview: 'Social feed for progress sharing',
  },
  {
    id: 'concept-ai-first',
    mode: 'concept',
    idea:
      'Pivot the roadmap to AI-first: every existing feature should be reimagined as an AI workflow.',
    preview: 'Pivot roadmap to AI-first',
  },
  {
    id: 'change-remove-comments',
    mode: 'change',
    idea:
      'Remove the per-row comments thread from the dashboard. Usage is below 2% and it complicates the data layer.',
    preview: 'Remove low-usage comments feature',
  },
]

export function examplesForMode(mode: IdeaMode): Example[] {
  return EXAMPLES.filter((e) => e.mode === mode)
}

export function resolveMockResult(
  mode: IdeaMode,
  idea: string,
): DecisionResult {
  const lower = idea.toLowerCase()

  if (mode === 'concept') {
    return withMode(refineConceptMock, mode)
  }

  if (lower.includes('social') || lower.includes('feed')) {
    return withMode(skipFeatureMock, mode)
  }

  if (
    lower.includes('export') ||
    lower.includes('csv') ||
    lower.includes('bulk')
  ) {
    return withMode(shipFeatureMock, mode)
  }

  if (mode === 'change') {
    return withMode(refineChangeMock, mode)
  }

  return withMode(skipFeatureMock, mode)
}

function withMode(result: DecisionResult, mode: IdeaMode): DecisionResult {
  return result.mode === mode ? result : { ...result, mode }
}
