export type IdeaMode = "feature" | "change" | "concept";

export interface EvaluationRequest {
  idea: string;
  mode: IdeaMode;
  context?: string;
}

export interface ModeDescriptor {
  id: IdeaMode;
  label: string;
  inputLabel: string;
  placeholder: string;
  blurb: string;
}

export const MODE_DESCRIPTORS: ModeDescriptor[] = [
  {
    id: "feature",
    label: "Feature Idea",
    inputLabel: "Feature Idea",
    placeholder:
      "e.g. Add CSV export to reporting. 18 customers requested it. 3 deals are blocked.",
    blurb: "Is this new capability worth building?",
  },
  {
    id: "change",
    label: "Product Change",
    inputLabel: "Product Change",
    placeholder:
      "e.g. Remove comment threads. Usage is below 2% and maintenance cost is rising.",
    blurb: "Is this modification an improvement or a regression risk?",
  },
  {
    id: "concept",
    label: "Concept",
    inputLabel: "Concept",
    placeholder:
      "e.g. Pivot to an AI-first product strategy. Every workflow becomes AI-assisted.",
    blurb: "Is this direction worth committing resources to?",
  },
];
