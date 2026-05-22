import type { IdeaMode } from '../src/types/request'

export interface DimensionDef {
  id: string
  label: string
  weight: number
}

export const RUBRICS: Record<IdeaMode, DimensionDef[]> = {
  feature: [
    { id: 'problem-clarity',      label: 'Problem Clarity',      weight: 0.18 },
    { id: 'evidence-of-need',     label: 'Evidence of Need',     weight: 0.20 },
    { id: 'solution-fit',         label: 'Solution Fit',         weight: 0.15 },
    { id: 'user-value',           label: 'User Value',           weight: 0.12 },
    { id: 'implementation-cost',  label: 'Implementation Cost',  weight: 0.12 },
    { id: 'strategic-alignment',  label: 'Strategic Alignment',  weight: 0.10 },
    { id: 'risk-profile',         label: 'Risk Profile',         weight: 0.13 },
  ],
  change: [
    { id: 'change-justification',    label: 'Change Justification',    weight: 0.18 },
    { id: 'impact-scope',            label: 'Impact Scope',            weight: 0.15 },
    { id: 'existing-user-risk',      label: 'Existing User Risk',      weight: 0.18 },
    { id: 'reversibility',           label: 'Reversibility',           weight: 0.12 },
    { id: 'improvement-magnitude',   label: 'Improvement Magnitude',   weight: 0.15 },
    { id: 'migration-cost',          label: 'Migration Cost',          weight: 0.10 },
    { id: 'implementation-complexity', label: 'Implementation Complexity', weight: 0.12 },
  ],
  concept: [
    { id: 'strategic-coherence', label: 'Strategic Coherence', weight: 0.18 },
    { id: 'market-signal',       label: 'Market Signal',       weight: 0.17 },
    { id: 'differentiation',     label: 'Differentiation',     weight: 0.13 },
    { id: 'testability',         label: 'Testability',         weight: 0.15 },
    { id: 'resource-demand',     label: 'Resource Demand',     weight: 0.12 },
    { id: 'optionality',         label: 'Optionality',         weight: 0.10 },
    { id: 'conviction-strength', label: 'Conviction Strength', weight: 0.15 },
  ],
}
