import { z } from 'zod'

const DimensionSignalSchema = z.object({
  type: z.enum(['positive', 'negative', 'unknown']),
  statement: z.string().max(140),
})

const RawDimensionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/, 'Dimension id must be kebab-case'),
  score: z.number().int().min(0).max(100),
  rationale: z.string().max(220),
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
  whyItMatters: z.string().max(140),
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
  reEvaluateWhen: z.string().max(180),
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

export const SUBMIT_DECISION_TOOL = {
  name: 'submit_decision',
  description:
    'Submit a structured scorecard evaluation. Call this exactly once with your full assessment.',
  input_schema: {
    type: 'object' as const,
    required: [
      'mode',
      'summary',
      'scorecard',
      'risks',
      'missingValidation',
      'refineRecommendation',
    ],
    additionalProperties: false,
    properties: {
      mode: {
        type: 'string',
        enum: ['feature', 'change', 'concept'],
      },
      summary: { type: 'string', maxLength: 240 },
      scorecard: {
        type: 'object',
        required: ['dimensions'],
        additionalProperties: false,
        properties: {
          dimensions: {
            type: 'array',
            minItems: 7,
            maxItems: 7,
            items: {
              type: 'object',
              required: ['id', 'score', 'rationale', 'signals'],
              additionalProperties: false,
              properties: {
                id: { type: 'string', pattern: '^[a-z][a-z0-9-]+$' },
                score: { type: 'integer', minimum: 0, maximum: 100 },
                rationale: { type: 'string', maxLength: 220 },
                signals: {
                  type: 'array',
                  minItems: 1,
                  maxItems: 4,
                  items: {
                    type: 'object',
                    required: ['type', 'statement'],
                    additionalProperties: false,
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['positive', 'negative', 'unknown'],
                      },
                      statement: { type: 'string', maxLength: 140 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      risks: {
        type: 'array',
        minItems: 2,
        maxItems: 5,
        items: {
          type: 'object',
          required: ['id', 'severity', 'statement', 'linkedDimension'],
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
            statement: { type: 'string', maxLength: 140 },
            linkedDimension: { type: 'string' },
          },
        },
      },
      missingValidation: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'object',
          required: ['question', 'whyItMatters', 'howToCheck', 'linkedDimension'],
          additionalProperties: false,
          properties: {
            question: { type: 'string', maxLength: 160 },
            whyItMatters: { type: 'string', maxLength: 140 },
            howToCheck: { type: 'string', maxLength: 180 },
            linkedDimension: { type: 'string' },
          },
        },
      },
      refineRecommendation: {
        oneOf: [
          { type: 'null' },
          {
            type: 'object',
            required: ['whatsWrong', 'improvements', 'reEvaluateWhen'],
            additionalProperties: false,
            properties: {
              whatsWrong: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string', maxLength: 140 },
              },
              improvements: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: {
                  type: 'object',
                  required: ['action', 'targetDimension', 'expectedLift'],
                  additionalProperties: false,
                  properties: {
                    action: { type: 'string', maxLength: 180 },
                    targetDimension: { type: 'string' },
                    expectedLift: {
                      type: 'string',
                      enum: ['small', 'moderate', 'large'],
                    },
                  },
                },
              },
              smallerExperiment: {
                oneOf: [
                  { type: 'string', maxLength: 220 },
                  { type: 'null' },
                ],
              },
              reEvaluateWhen: { type: 'string', maxLength: 180 },
            },
          },
        ],
      },
    },
  },
}
