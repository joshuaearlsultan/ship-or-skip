export type IdeaMode = 'feature' | 'change' | 'concept'

export interface EvaluationRequest {
  idea: string
  mode: IdeaMode
  context?: string
}

export interface ModeDescriptor {
  id: IdeaMode
  label: string
  inputLabel: string
  placeholder: string
  blurb: string
}

export const MODE_DESCRIPTORS: ModeDescriptor[] = [
  {
    id: 'feature',
    label: 'Feature Idea',
    inputLabel: 'Feature Idea',
    placeholder:
      'Describe a feature idea you are considering building. Include the user problem if you know it.',
    blurb: 'Is this new capability worth building?',
  },
  {
    id: 'change',
    label: 'Product Change',
    inputLabel: 'Product Change',
    placeholder:
      'Describe a change to existing behavior — removal, redesign, default change, or expansion.',
    blurb: 'Is this modification an improvement or a regression risk?',
  },
  {
    id: 'concept',
    label: 'Concept',
    inputLabel: 'Concept',
    placeholder:
      'Describe a strategic direction, positioning shift, or broader product hypothesis.',
    blurb: 'Is this direction worth committing resources to?',
  },
]
