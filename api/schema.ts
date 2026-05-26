import { z } from 'zod'

const DimensionSignalSchema = z.object({
  type: z.enum(['positive', 'negative', 'unknown']),
  statement: z.string().max(140),
})

const RawDimensionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/, 'Dimension id must be kebab-case'),
  score: z.number().int().min(0).max(100),
  rationale: z.string().max(300),
  signals: z.array(DimensionSignalSchema).min(1).max(4),
})

const RiskSchema = z.object({
  id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  statement: z.string().max(140),
  linkedDimension: z.string(),
})

const MissingValidationSchema = z.object({
  question: z.string().max(160),
  whyItMatters: z.string().max(200),
  howToCheck: z.string().max(180),
  linkedDimension: z.string(),
})

const ImprovementSchema = z.object({
  action: z.string().max(180),
  targetDimension: z.string(),
  expectedLift: z.enum(['small', 'moderate', 'large']),
})

const RefineRecommendationSchema = z.object({
  whatsWrong: z.array(z.string().max(140)).min(1).max(4),
  improvements: z.array(ImprovementSchema).min(1).max(4),
  smallerExperiment: z.string().max(220).nullable(),
  reEvaluateWhen: z.string().max(240),
})

export const ToolOutputSchema = z.object({
  mode: z.enum(['feature', 'change', 'concept']),
  summary: z.string().max(240),
  scorecard: z.object({
    dimensions: z.array(RawDimensionSchema).length(7),
  }),
  risks: z.array(RiskSchema).min(2).max(5),
  missingValidation: z.array(MissingValidationSchema).min(1).max(5),
  refineRecommendation: RefineRecommendationSchema.nullable(),
})

export type ToolOutput = z.infer<typeof ToolOutputSchema>

export const EvaluationRequestSchema = z.object({
  idea: z.string().min(1).max(2000),
  mode: z.enum(['feature', 'change', 'concept']),
  context: z.string().max(1000).optional(),
})

export type ValidatedRequest = z.infer<typeof EvaluationRequestSchema>
