import type { IdeaMode } from './request'

export type Verdict = 'ship' | 'refine' | 'skip'

export type ScoreBand =
  | 'strong'
  | 'reasonable'
  | 'mixed'
  | 'weak'
  | 'counter'

export type SignalKind = 'positive' | 'negative' | 'unknown'

export interface DimensionSignal {
  type: SignalKind
  statement: string
}

export interface EvaluationDimension {
  id: string
  label: string
  weight: number
  score: number
  band: ScoreBand
  rationale: string
  signals: DimensionSignal[]
}

export type RiskSeverity = 'high' | 'medium' | 'low'

export interface Risk {
  id: string
  severity: RiskSeverity
  statement: string
  linkedDimension: string
}

export interface MissingValidation {
  question: string
  whyItMatters: string
  howToCheck: string
  linkedDimension: string
}

export type ImprovementLift = 'small' | 'moderate' | 'large'

export interface Improvement {
  action: string
  targetDimension: string
  expectedLift: ImprovementLift
}

export interface RefineRecommendation {
  whatsWrong: string[]
  improvements: Improvement[]
  smallerExperiment: string | null
  reEvaluateWhen: string
}

export interface Scorecard {
  overallScore: number
  spread: number
  evidenceQuality: number
  dimensions: EvaluationDimension[]
  strongest: string
  weakest: string
}

export interface DecisionMeta {
  model: string
  latencyMs: number
  promptVersion: string
}

export interface DecisionResult {
  verdict: Verdict
  confidence: number
  mode: IdeaMode
  summary: string
  scorecard: Scorecard
  risks: Risk[]
  missingValidation: MissingValidation[]
  refineRecommendation: RefineRecommendation | null
  meta: DecisionMeta
}
