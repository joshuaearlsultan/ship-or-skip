import type { IdeaMode } from '../types/request'
import type { DecisionResult } from '../types/decision'
import { refineChangeMock, shipFeatureMock, skipFeatureMock } from './mockResults'

export interface DemoExample {
  id: string
  title: string
  /** One-line explanation shown in the selector card beneath the verdict */
  rationale: string
  /** Full idea text passed to the result panel as the evaluated input */
  idea: string
  mode: IdeaMode
  result: DecisionResult
}

// ─── SOC2 Compliance → Refine ─────────────────────────────────────────────────
//
// Feature mode. Revenue signal is real but implementation scope is unquantified
// and a readiness baseline is missing. overallScore ≈ 61, verdict: refine.

export const soc2RefineMock: DecisionResult = {
  verdict: 'refine',
  confidence: 68,
  mode: 'feature',
  summary:
    'Revenue signal is real but scope, cost, and timeline are unspecified. Without a readiness baseline and defined resourcing, this is a timeline promise — not a bounded project.',
  scorecard: {
    overallScore: 61,
    spread: 11.8,
    evidenceQuality: 72,
    strongest: 'evidence-of-need',
    weakest: 'implementation-cost',
    dimensions: [
      {
        id: 'problem-clarity',
        label: 'Problem Clarity',
        weight: 0.18,
        score: 74,
        band: 'reasonable',
        rationale:
          'Enterprise prospects are blocking on security review. The friction is concrete and repeatable across the sales funnel.',
        signals: [
          { type: 'positive', statement: 'Multiple prospects citing certification as an explicit procurement blocker' },
          { type: 'positive', statement: 'Pattern reported consistently across Q3 and Q4 pipeline' },
        ],
      },
      {
        id: 'evidence-of-need',
        label: 'Evidence of Need',
        weight: 0.2,
        score: 78,
        band: 'reasonable',
        rationale:
          'Two active deals explicitly conditional on certification provides a direct commercial signal.',
        signals: [
          { type: 'positive', statement: 'Two in-flight deals gated on SOC2 Type II completion' },
          { type: 'positive', statement: 'Sales team reports recurring objection in enterprise segment' },
          { type: 'unknown', statement: 'Combined revenue value of blocked deals not stated' },
        ],
      },
      {
        id: 'solution-fit',
        label: 'Solution Fit',
        weight: 0.15,
        score: 62,
        band: 'reasonable',
        rationale:
          'SOC2 Type II is the accepted enterprise security certification standard and directly addresses the stated procurement objection.',
        signals: [
          { type: 'positive', statement: 'SOC2 Type II is the standard credential for the target buyer segment' },
          { type: 'unknown', statement: 'Whether Type I would satisfy near-term deals is not addressed' },
        ],
      },
      {
        id: 'user-value',
        label: 'User Value',
        weight: 0.12,
        score: 50,
        band: 'mixed',
        rationale:
          'Certification is a procurement gate, not a direct improvement to product value for end users. Benefit flows to buyers and security reviewers.',
        signals: [
          { type: 'negative', statement: 'End-user experience is unchanged by certification' },
          { type: 'unknown', statement: 'Whether certification improves perceived trust for existing users is unmeasured' },
        ],
      },
      {
        id: 'implementation-cost',
        label: 'Implementation Cost',
        weight: 0.12,
        score: 35,
        band: 'weak',
        rationale:
          'SOC2 Type II requires 12–18 months from a prepared baseline through audit completion, dedicated security program resources, and ongoing annual recertification overhead.',
        signals: [
          { type: 'negative', statement: 'Audit cycle is 12–18 months minimum from a prepared baseline' },
          { type: 'negative', statement: 'Requires dedicated security resources or a vCISO engagement' },
          { type: 'negative', statement: 'Annual recertification creates permanent ongoing overhead' },
          { type: 'unknown', statement: 'Current security posture and gap-to-baseline not assessed' },
        ],
      },
      {
        id: 'strategic-alignment',
        label: 'Strategic Alignment',
        weight: 0.1,
        score: 72,
        band: 'reasonable',
        rationale:
          'Enterprise expansion is a stated 2026 motion; certification is table-stakes in that segment.',
        signals: [
          { type: 'positive', statement: 'Enterprise segment named as a 2026 growth priority' },
        ],
      },
      {
        id: 'risk-profile',
        label: 'Risk Profile',
        weight: 0.13,
        score: 47,
        band: 'mixed',
        rationale:
          'Scope is routinely underestimated before a readiness assessment. Committing to prospects before scoping creates a binding timeline expectation that is difficult to retract.',
        signals: [
          { type: 'negative', statement: 'Premature commitment to prospects creates expectations before scope is known' },
          { type: 'negative', statement: 'Implementation scope typically larger than anticipated without a gap assessment' },
        ],
      },
    ],
  },
  risks: [
    {
      id: 'timeline-commitment',
      severity: 'high',
      statement:
        'Committing to a certification timeline before a readiness assessment often creates undeliverable promises to prospects.',
      linkedDimension: 'risk-profile',
    },
    {
      id: 'unscoped-cost',
      severity: 'high',
      statement:
        'Implementation cost is unspecified; resourcing for a 12–18 month audit program has not been scoped.',
      linkedDimension: 'implementation-cost',
    },
    {
      id: 'recurring-overhead',
      severity: 'medium',
      statement:
        'Annual recertification creates permanent compliance overhead not reflected in current cost estimates.',
      linkedDimension: 'implementation-cost',
    },
  ],
  missingValidation: [
    {
      question: 'What does a readiness assessment reveal about current security gaps?',
      whyItMatters:
        'Without knowing the delta between current posture and SOC2 requirements, any timeline estimate is guesswork.',
      howToCheck:
        'Engage an auditor or consulting firm for a pre-assessment before making commitments to prospects.',
      linkedDimension: 'implementation-cost',
    },
    {
      question: 'What is the total revenue attached to certification-blocked deals?',
      whyItMatters:
        'Frames whether a 12–18 month program investment is justified this year versus next.',
      howToCheck:
        'Pull a list of stalled deals with a certification dependency from CRM and sum the ACV.',
      linkedDimension: 'evidence-of-need',
    },
    {
      question: 'Would a SOC2 Type I report satisfy near-term deals while Type II is pursued?',
      whyItMatters:
        'Type I can be completed in 3–6 months and may unblock deals without the full audit cycle.',
      howToCheck:
        'Ask the security reviewer at each blocked prospect what the minimum acceptable credential is.',
      linkedDimension: 'solution-fit',
    },
  ],
  refineRecommendation: {
    whatsWrong: [
      'No readiness assessment baseline — scope and remediation cost are unknown.',
      'Implementation timeline and resource requirement are unquantified.',
      'Revenue justification relies on two deals; aggregate value has not been confirmed.',
    ],
    improvements: [
      {
        action:
          'Commission a readiness assessment before any timeline commitment to prospects.',
        targetDimension: 'implementation-cost',
        expectedLift: 'large',
      },
      {
        action:
          'Confirm the combined ACV of certification-blocked deals to validate program ROI.',
        targetDimension: 'evidence-of-need',
        expectedLift: 'moderate',
      },
      {
        action:
          'Evaluate SOC2 Type I as a faster path to unblocking near-term deals while Type II proceeds.',
        targetDimension: 'solution-fit',
        expectedLift: 'moderate',
      },
    ],
    smallerExperiment:
      'Engage one blocked prospect\'s security team to confirm whether a Type I report satisfies their procurement threshold, before committing to the full Type II program.',
    reEvaluateWhen:
      'A readiness assessment is complete, the gap-to-baseline is known, and confirmed deal ACV can be weighed against program cost and timeline.',
  },
  meta: {
    model: 'mock@m1',
    latencyMs: 1080,
    promptVersion: 'feature@2026-05-27',
  },
}

// ─── AI-first Roadmap Pivot → Skip ───────────────────────────────────────────
//
// Concept mode. No customer evidence anchors the pivot; positioning is
// undifferentiated; scope is untestable. overallScore ≈ 36, verdict: skip.

export const aiFirstSkipMock: DecisionResult = {
  verdict: 'skip',
  confidence: 81,
  mode: 'concept',
  summary:
    '"AI-first" may be the right direction but the framing is untestable, the scope is total-roadmap, and no customer evidence anchors the pivot. Every competitor is making the same claim.',
  scorecard: {
    overallScore: 36,
    spread: 13.4,
    evidenceQuality: 38,
    strongest: 'market-signal',
    weakest: 'testability',
    dimensions: [
      {
        id: 'strategic-coherence',
        label: 'Strategic Coherence',
        weight: 0.18,
        score: 44,
        band: 'mixed',
        rationale:
          'The direction is plausible given category trends, but there is no thesis for why AI changes the specific value proposition for this product\'s users.',
        signals: [
          { type: 'negative', statement: 'No defined change in user job-to-be-done' },
          { type: 'unknown', statement: 'Whether AI delivers meaningfully better outcomes in this domain is assumed, not evidenced' },
        ],
      },
      {
        id: 'market-signal',
        label: 'Market Signal',
        weight: 0.17,
        score: 55,
        band: 'mixed',
        rationale:
          'AI adoption in the category is real, but category momentum describes market conditions — not differentiated product-market fit for this company.',
        signals: [
          { type: 'positive', statement: 'Competitor AI feature launches visible in the last 12 months' },
          { type: 'negative', statement: 'Category-wide signal does not translate to a defensible opportunity' },
        ],
      },
      {
        id: 'differentiation',
        label: 'Differentiation',
        weight: 0.13,
        score: 22,
        band: 'weak',
        rationale:
          '"AI-first" and "AI-native" are the undifferentiated claims of every player in the market. No distinct angle, proprietary data advantage, or unique workflow is articulated.',
        signals: [
          { type: 'negative', statement: 'Identical positioning used by 5+ direct and adjacent competitors' },
          { type: 'negative', statement: 'No proprietary data, model, or workflow advantage described' },
        ],
      },
      {
        id: 'testability',
        label: 'Testability',
        weight: 0.15,
        score: 15,
        band: 'counter',
        rationale:
          '"Every feature reimagined" is not a hypothesis. It cannot be validated, falsified, or scoped. It is a direction, not a bet.',
        signals: [
          { type: 'negative', statement: 'No bounded experiment proposed' },
          { type: 'negative', statement: 'Success condition undefined — no metric or threshold stated' },
          { type: 'negative', statement: 'No single workflow identified for initial validation' },
        ],
      },
      {
        id: 'resource-demand',
        label: 'Resource Demand',
        weight: 0.12,
        score: 22,
        band: 'weak',
        rationale:
          'Reimagining every feature implies freezing or abandoning the existing roadmap and committing all engineering and design capacity with no defined off-ramp.',
        signals: [
          { type: 'negative', statement: 'Existing roadmap commitments would be paused or abandoned' },
          { type: 'negative', statement: 'No phased or parallel-track approach defined' },
        ],
      },
      {
        id: 'optionality',
        label: 'Optionality',
        weight: 0.1,
        score: 38,
        band: 'weak',
        rationale:
          'A full-portfolio pivot forecloses alternative strategic paths and creates a single point of failure if AI adoption curves differ by segment.',
        signals: [
          { type: 'negative', statement: 'Total pivot reduces the ability to hedge across segments and timelines' },
        ],
      },
      {
        id: 'conviction-strength',
        label: 'Conviction Strength',
        weight: 0.15,
        score: 46,
        band: 'mixed',
        rationale:
          'Strong internal enthusiasm; no customer-validated demand, prototype evidence, or willingness-to-pay signal cited.',
        signals: [
          { type: 'unknown', statement: 'No user research or prototype test referenced' },
          { type: 'negative', statement: 'Conviction appears trend-driven rather than customer-validated' },
        ],
      },
    ],
  },
  risks: [
    {
      id: 'no-customer-evidence',
      severity: 'high',
      statement:
        'No customer evidence anchors the pivot. Internal enthusiasm about AI trends is not validated demand.',
      linkedDimension: 'conviction-strength',
    },
    {
      id: 'roadmap-destruction',
      severity: 'high',
      statement:
        'Abandoning the current roadmap eliminates existing customer commitments without a defined replacement value.',
      linkedDimension: 'resource-demand',
    },
    {
      id: 'commoditized-positioning',
      severity: 'high',
      statement:
        '"AI-first" is commoditized positioning. Without a differentiated thesis, the company enters a crowded field with no advantage.',
      linkedDimension: 'differentiation',
    },
    {
      id: 'untestable-scope',
      severity: 'medium',
      statement:
        '"Every feature" scope removes the ability to learn — the bet is too large to validate before full commitment.',
      linkedDimension: 'testability',
    },
  ],
  missingValidation: [
    {
      question: 'Which single workflow, if AI-powered, would cause a current user to pay more or churn less?',
      whyItMatters:
        'Identifies the highest-conviction starting point and converts a vague direction into a testable hypothesis.',
      howToCheck:
        'Run 6–8 customer interviews probing which tasks feel most manual, slow, or error-prone today.',
      linkedDimension: 'testability',
    },
    {
      question: 'What proprietary signal, data, or workflow would make this product\'s AI implementation better than a competitor\'s?',
      whyItMatters:
        'Without a defensible advantage, the pivot replicates rather than differentiates.',
      howToCheck:
        'Audit existing data assets and workflows against two named competitors for uniqueness.',
      linkedDimension: 'differentiation',
    },
  ],
  refineRecommendation: null,
  meta: {
    model: 'mock@m1',
    latencyMs: 1120,
    promptVersion: 'concept@2026-05-27',
  },
}

// ─── Demo examples ────────────────────────────────────────────────────────────

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'csv-export',
    title: 'CSV Export',
    rationale: 'Validated enterprise demand',
    idea: 'Add bulk CSV export to the reporting dashboard. 18 enterprise customers have asked for it in support tickets over the last quarter; three said it is blocking procurement sign-off.',
    mode: 'feature',
    result: shipFeatureMock,
  },
  {
    id: 'soc2-compliance',
    title: 'SOC2 Compliance',
    rationale: 'Revenue opportunity but major unknowns',
    idea: 'Pursue SOC2 Type II certification. Several enterprise prospects have stalled in procurement citing our lack of security certification. Two active deals are explicitly conditional on completing the audit.',
    mode: 'feature',
    result: soc2RefineMock,
  },
  {
    id: 'social-feed',
    title: 'Social Feed',
    rationale: 'No validated problem or demand evidence',
    idea: 'Add a social feed so users can share progress and increase engagement.',
    mode: 'feature',
    result: skipFeatureMock,
  },
  {
    id: 'remove-comments',
    title: 'Remove Comments',
    rationale: 'Usage is low but affected users are unquantified',
    idea: 'Remove the per-row comments thread from the dashboard. Usage is below 2% and it complicates the data layer.',
    mode: 'change',
    result: refineChangeMock,
  },
  {
    id: 'ai-first-pivot',
    title: 'AI-first Pivot',
    rationale: 'No customer evidence or bounded test',
    idea: 'Pivot the entire product roadmap to be AI-first. Every existing feature should be reimagined as an AI-powered workflow. We should position as the AI-native alternative in the category.',
    mode: 'concept',
    result: aiFirstSkipMock,
  },
]
