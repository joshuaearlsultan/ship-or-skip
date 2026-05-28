import type { IdeaMode } from '../types/request'
import type { DecisionResult } from '../types/decision'
import { refineChangeMock, shipFeatureMock, skipFeatureMock } from './mockResults.js'
import { aiFirstSkipMock, soc2RefineMock } from './demoExamples.js'

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
    id: 'feature-soc2',
    mode: 'feature',
    idea:
      'Pursue SOC2 Type II certification. Several enterprise prospects have stalled in procurement citing our lack of security certification. Two active deals are explicitly conditional on completing the audit.',
    preview: 'SOC2 compliance — enterprise procurement blocker',
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
      'Pivot the entire product roadmap to be AI-first. Every existing feature should be reimagined as an AI-powered workflow. We should position as the AI-native alternative in the category.',
    preview: 'AI-first roadmap pivot',
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

  // Concept mode always resolves to the canonical AI-first Skip example
  if (mode === 'concept') {
    return withMode(aiFirstSkipMock, mode)
  }

  // Social feed → Skip (feature-mode Skip example retained for keyword matching)
  if (lower.includes('social') || lower.includes('feed')) {
    return withMode(skipFeatureMock, mode)
  }

  // SOC2 / compliance → canonical Refine example
  if (
    lower.includes('soc2') ||
    lower.includes('soc 2') ||
    lower.includes('compliance') ||
    lower.includes('certification')
  ) {
    return withMode(soc2RefineMock, mode)
  }

  // CSV / export → canonical Ship example
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
