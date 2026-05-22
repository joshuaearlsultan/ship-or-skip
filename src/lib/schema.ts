import { z } from 'zod'
import type { DecisionResult } from '../types/decision'

const DimensionSignalSchema = z.object({
  type: z.enum(['positive', 'negative', 'unknown']),
  statement: z.string(),
})

const EvaluationDimensionSchema = z.object({
  id: z.string(),
  label: z.string(),
  weight: z.number(),
  score: z.number().int().min(0).max(100),
  band: z.enum(['strong', 'reasonable', 'mixed', 'weak', 'counter']),
  rationale: z.string(),
  signals: z.array(DimensionSignalSchema),
})

const ScorecardSchema = z.object({
  overallScore: z.number(),
  spread: z.number(),
  evidenceQuality: z.number(),
  dimensions: z.array(EvaluationDimensionSchema),
  strongest: z.string(),
  weakest: z.string(),
})

const RiskSchema = z.object({
  id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  statement: z.string(),
  linkedDimension: z.string(),
})

const MissingValidationSchema = z.object({
  question: z.string(),
  whyItMatters: z.string(),
  howToCheck: z.string(),
  linkedDimension: z.string(),
})

const ImprovementSchema = z.object({
  action: z.string(),
  targetDimension: z.string(),
  expectedLift: z.enum(['small', 'moderate', 'large']),
})

const RefineRecommendationSchema = z.object({
  whatsWrong: z.array(z.string()),
  improvements: z.array(ImprovementSchema),
  smallerExperiment: z.string().nullable(),
  reEvaluateWhen: z.string(),
})

export const DecisionResultSchema = z.object({
  verdict: z.enum(['ship', 'refine', 'skip']),
  confidence: z.number().int().min(0).max(100),
  mode: z.enum(['feature', 'change', 'concept']),
  summary: z.string(),
  scorecard: ScorecardSchema,
  risks: z.array(RiskSchema),
  missingValidation: z.array(MissingValidationSchema),
  refineRecommendation: RefineRecommendationSchema.nullable(),
  meta: z.object({
    model: z.string(),
    latencyMs: z.number(),
    promptVersion: z.string(),
  }),
})

export function parseDecisionResult(value: unknown): DecisionResult {
  return DecisionResultSchema.parse(value) as DecisionResult
}
