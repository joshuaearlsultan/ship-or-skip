import type { DecisionResult } from '../types/decision'

export const shipFeatureMock: DecisionResult = {
  verdict: 'ship',
  confidence: 86,
  mode: 'feature',
  summary:
    'Specific, validated request from named enterprise accounts with explicit revenue linkage. Low scope, contained risk.',
  scorecard: {
    overallScore: 81,
    spread: 8.2,
    evidenceQuality: 92,
    strongest: 'evidence-of-need',
    weakest: 'implementation-cost',
    dimensions: [
      {
        id: 'problem-clarity',
        label: 'Problem Clarity',
        weight: 0.18,
        score: 88,
        band: 'strong',
        rationale:
          'Customers cannot extract reporting data for downstream procurement workflows. Stated explicitly in tickets.',
        signals: [
          { type: 'positive', statement: '18 tickets reference the same blocker' },
        ],
      },
      {
        id: 'evidence-of-need',
        label: 'Evidence of Need',
        weight: 0.2,
        score: 92,
        band: 'strong',
        rationale:
          'Quantified demand from named accounts; three tied to revenue events.',
        signals: [
          { type: 'positive', statement: '18 enterprise tickets in one quarter' },
          { type: 'positive', statement: '3 deals contingent on this capability' },
        ],
      },
      {
        id: 'solution-fit',
        label: 'Solution Fit',
        weight: 0.15,
        score: 84,
        band: 'strong',
        rationale:
          'CSV export is the format procurement systems expect; matches the stated need directly.',
        signals: [
          { type: 'positive', statement: 'Procurement tools standardize on CSV intake' },
        ],
      },
      {
        id: 'user-value',
        label: 'User Value',
        weight: 0.12,
        score: 80,
        band: 'strong',
        rationale:
          'Unblocks a workflow users currently solve with manual screen-scraping.',
        signals: [
          { type: 'positive', statement: 'Replaces a known manual workaround' },
        ],
      },
      {
        id: 'implementation-cost',
        label: 'Implementation Cost',
        weight: 0.12,
        score: 68,
        band: 'reasonable',
        rationale:
          'Standard server-side export; pagination over large datasets adds modest complexity.',
        signals: [
          {
            type: 'negative',
            statement: 'Streaming or pagination needed for accounts above ~50k rows',
          },
          { type: 'unknown', statement: 'Largest expected export size not specified' },
        ],
      },
      {
        id: 'strategic-alignment',
        label: 'Strategic Alignment',
        weight: 0.1,
        score: 78,
        band: 'reasonable',
        rationale:
          'Enterprise segment is a stated focus; export parity is table-stakes there.',
        signals: [
          { type: 'positive', statement: 'Enterprise expansion is a 2026 goal' },
        ],
      },
      {
        id: 'risk-profile',
        label: 'Risk Profile',
        weight: 0.13,
        score: 74,
        band: 'reasonable',
        rationale:
          'Main risk is PII handling and access control on exported data.',
        signals: [
          {
            type: 'negative',
            statement: 'Exports broaden data-egress surface area',
          },
        ],
      },
    ],
  },
  risks: [
    {
      id: 'pii-egress',
      severity: 'medium',
      statement:
        "Exports could leak PII if row-level access controls aren't enforced.",
      linkedDimension: 'risk-profile',
    },
    {
      id: 'large-export-perf',
      severity: 'low',
      statement:
        'A naive implementation will time out on the largest tenants.',
      linkedDimension: 'implementation-cost',
    },
  ],
  missingValidation: [
    {
      question: 'What is the 95th-percentile export size?',
      whyItMatters:
        'Determines whether streaming or batch architecture is needed.',
      howToCheck:
        'Query report dataset sizes for the requesting accounts.',
      linkedDimension: 'implementation-cost',
    },
  ],
  refineRecommendation: null,
  meta: {
    model: 'mock@m1',
    latencyMs: 920,
    promptVersion: 'feature@2026-05-23',
  },
}

export const refineConceptMock: DecisionResult = {
  verdict: 'refine',
  confidence: 58,
  mode: 'concept',
  summary:
    'Direction has market tailwinds but is scoped as a slogan, not a thesis. Testable in parts; not as a whole.',
  scorecard: {
    overallScore: 56,
    spread: 14.6,
    evidenceQuality: 64,
    strongest: 'market-signal',
    weakest: 'testability',
    dimensions: [
      {
        id: 'strategic-coherence',
        label: 'Strategic Coherence',
        weight: 0.18,
        score: 52,
        band: 'mixed',
        rationale:
          'Compatible with the current product but no thesis for why AI changes the value proposition specifically.',
        signals: [
          { type: 'positive', statement: 'Existing data assets could feed AI features' },
          {
            type: 'unknown',
            statement: 'Underlying user job-to-be-done unchanged or different?',
          },
        ],
      },
      {
        id: 'market-signal',
        label: 'Market Signal',
        weight: 0.17,
        score: 78,
        band: 'reasonable',
        rationale:
          'Category-wide shift toward AI workflows is real; competitors moving in the same direction.',
        signals: [
          {
            type: 'positive',
            statement: 'Adjacent products shipped AI workflows in the last 12 months',
          },
        ],
      },
      {
        id: 'differentiation',
        label: 'Differentiation',
        weight: 0.13,
        score: 44,
        band: 'mixed',
        rationale:
          '"AI-first" as worded is undifferentiated — every competitor is making the same claim.',
        signals: [
          {
            type: 'negative',
            statement: 'Concept matches public messaging from 4+ competitors',
          },
        ],
      },
      {
        id: 'testability',
        label: 'Testability',
        weight: 0.15,
        score: 32,
        band: 'weak',
        rationale:
          '"Reimagine every feature" is not a testable hypothesis. One feature at a time would be.',
        signals: [
          { type: 'negative', statement: 'No bounded experiment proposed' },
        ],
      },
      {
        id: 'resource-demand',
        label: 'Resource Demand',
        weight: 0.12,
        score: 48,
        band: 'mixed',
        rationale:
          'A whole-roadmap pivot would consume most of engineering and design capacity.',
        signals: [
          {
            type: 'negative',
            statement: 'Implied scope freezes the non-AI roadmap',
          },
        ],
      },
      {
        id: 'optionality',
        label: 'Optionality',
        weight: 0.1,
        score: 64,
        band: 'reasonable',
        rationale:
          'Building AI primitives once enables many future features; a hard pivot would foreclose other paths.',
        signals: [
          { type: 'positive', statement: 'Shared AI infrastructure is reusable' },
          {
            type: 'negative',
            statement: 'Whole-roadmap framing reduces optionality',
          },
        ],
      },
      {
        id: 'conviction-strength',
        label: 'Conviction Strength',
        weight: 0.15,
        score: 60,
        band: 'reasonable',
        rationale:
          'Strong internal enthusiasm; no customer-validated win yet.',
        signals: [
          { type: 'unknown', statement: 'No prototype tested with target users' },
        ],
      },
    ],
  },
  risks: [
    {
      id: 'me-too-positioning',
      severity: 'high',
      statement:
        '"AI-first" messaging blurs the product against the broader category.',
      linkedDimension: 'differentiation',
    },
    {
      id: 'capacity-lockout',
      severity: 'high',
      statement:
        'Pivoting the whole roadmap blocks ongoing customer commitments.',
      linkedDimension: 'resource-demand',
    },
    {
      id: 'untestable-hypothesis',
      severity: 'medium',
      statement: 'The bet is too large to validate before committing.',
      linkedDimension: 'testability',
    },
  ],
  missingValidation: [
    {
      question: 'Which single workflow, AI-enabled, would users pay more for?',
      whyItMatters:
        'Anchors the concept to willingness-to-pay rather than category vibes.',
      howToCheck:
        'Run six customer interviews scoped to the top three candidate workflows.',
      linkedDimension: 'testability',
    },
    {
      question:
        'What is the differentiated angle versus the two nearest competitors?',
      whyItMatters:
        'Without one, the pivot replaces a known position with a contested one.',
      howToCheck:
        'Comparative teardown of competitor AI features against your data assets.',
      linkedDimension: 'differentiation',
    },
  ],
  refineRecommendation: {
    whatsWrong: [
      'Framed as a slogan, not a hypothesis.',
      'Scope is total-roadmap, which is untestable.',
      'Positioning is indistinct from competitors as worded.',
    ],
    improvements: [
      {
        action:
          'Narrow to one flagship workflow where AI changes the outcome, not the interface.',
        targetDimension: 'testability',
        expectedLift: 'large',
      },
      {
        action:
          'Articulate the differentiated thesis versus two named competitors.',
        targetDimension: 'differentiation',
        expectedLift: 'moderate',
      },
      {
        action:
          'Define what "AI-first" means for user value, not feature count.',
        targetDimension: 'strategic-coherence',
        expectedLift: 'moderate',
      },
    ],
    smallerExperiment:
      'Pick the workflow with the highest manual time-spent; ship one AI-assisted version; measure time saved and willingness-to-renew.',
    reEvaluateWhen:
      'A single AI workflow demonstrates measurable lift in retention or willingness-to-pay versus its non-AI baseline.',
  },
  meta: {
    model: 'mock@m1',
    latencyMs: 1140,
    promptVersion: 'concept@2026-05-23',
  },
}

export const refineChangeMock: DecisionResult = {
  verdict: 'refine',
  confidence: 65,
  mode: 'change',
  summary:
    'Usage data justifies the removal but the risk to the active minority is unquantified. No migration or archival path described.',
  scorecard: {
    overallScore: 57,
    spread: 9.5,
    evidenceQuality: 73,
    strongest: 'implementation-complexity',
    weakest: 'reversibility',
    dimensions: [
      {
        id: 'change-justification',
        label: 'Change Justification',
        weight: 0.18,
        score: 65,
        band: 'reasonable',
        rationale:
          'Sub-2% engagement is a meaningful signal; stated data-layer complexity is a real cost with some evidence.',
        signals: [
          { type: 'positive', statement: 'Usage below 2% cited from telemetry' },
          { type: 'positive', statement: 'Data layer complexity reduction is concrete' },
        ],
      },
      {
        id: 'impact-scope',
        label: 'Impact Scope',
        weight: 0.15,
        score: 58,
        band: 'mixed',
        rationale:
          'Feature is visible to all dashboard users on removal; active users face a harder break.',
        signals: [
          { type: 'negative', statement: 'Removal affects all dashboard users immediately' },
          { type: 'unknown', statement: 'Absolute count of users with existing comments not stated' },
        ],
      },
      {
        id: 'existing-user-risk',
        label: 'Existing User Risk',
        weight: 0.18,
        score: 45,
        band: 'mixed',
        rationale:
          'The 2% who do use comments have built workflows around them; removal without notice causes real friction.',
        signals: [
          { type: 'negative', statement: '2% of active users have data at risk of loss' },
          { type: 'unknown', statement: 'Whether those users have documented workarounds is unknown' },
        ],
      },
      {
        id: 'reversibility',
        label: 'Reversibility',
        weight: 0.12,
        score: 42,
        band: 'mixed',
        rationale:
          'Comment data deletion is permanent. Restoring the feature requires schema and UI reconstruction.',
        signals: [
          { type: 'negative', statement: 'Deleted comment data cannot be recovered' },
          { type: 'negative', statement: 'Re-adding the feature requires a full rebuild' },
        ],
      },
      {
        id: 'improvement-magnitude',
        label: 'Improvement Magnitude',
        weight: 0.15,
        score: 62,
        band: 'reasonable',
        rationale:
          'Removing the feature simplifies the data model and reduces test surface in a measurable way.',
        signals: [
          { type: 'positive', statement: 'Data layer simplification is concrete and measurable' },
        ],
      },
      {
        id: 'migration-cost',
        label: 'Migration Cost',
        weight: 0.1,
        score: 55,
        band: 'mixed',
        rationale:
          'Existing comment data must be archived or exported before removal. No plan is described.',
        signals: [
          { type: 'unknown', statement: 'Comment data export or archival path not defined' },
        ],
      },
      {
        id: 'implementation-complexity',
        label: 'Implementation Complexity',
        weight: 0.12,
        score: 70,
        band: 'reasonable',
        rationale:
          'Removal is lower complexity than the original build; main effort is data cleanup and deprecation notice.',
        signals: [
          { type: 'positive', statement: 'Removal generally lower effort than original feature build' },
        ],
      },
    ],
  },
  risks: [
    {
      id: 'active-user-data-loss',
      severity: 'high',
      statement: 'Users with existing comments lose data permanently without a migration path.',
      linkedDimension: 'existing-user-risk',
    },
    {
      id: 'irreversible-deletion',
      severity: 'medium',
      statement: 'No rollback once comment data is dropped from the schema.',
      linkedDimension: 'reversibility',
    },
    {
      id: 'scope-undercount',
      severity: 'low',
      statement: '2% of a large user base may represent a significant absolute user count.',
      linkedDimension: 'impact-scope',
    },
  ],
  missingValidation: [
    {
      question: 'How many users have at least one existing comment?',
      whyItMatters:
        'Absolute count determines whether a formal migration path is required before deletion.',
      howToCheck:
        'Query the comment table for distinct user_ids with at least one row.',
      linkedDimension: 'existing-user-risk',
    },
    {
      question: 'Is there a comment data export or archival plan?',
      whyItMatters:
        'Permanent deletion without user notice is a trust and compliance risk.',
      howToCheck:
        'Define a CSV export flow or read-only archive before scheduling removal.',
      linkedDimension: 'migration-cost',
    },
  ],
  refineRecommendation: {
    whatsWrong: [
      'No migration or archival plan exists for existing comment data.',
      'Impact on the active 2% is unquantified in absolute terms.',
      'Reversibility is low with no staged removal path described.',
    ],
    improvements: [
      {
        action:
          'Define a data export path for users with existing comments before any schema change.',
        targetDimension: 'migration-cost',
        expectedLift: 'large',
      },
      {
        action:
          'Query absolute count of affected users to determine deprecation notice requirements.',
        targetDimension: 'existing-user-risk',
        expectedLift: 'moderate',
      },
      {
        action:
          'Stage removal: hide the UI first, monitor support tickets for 30 days, delete data only after.',
        targetDimension: 'reversibility',
        expectedLift: 'moderate',
      },
    ],
    smallerExperiment:
      'Hide the comments UI behind a feature flag for 30 days and measure support ticket volume before committing to data deletion.',
    reEvaluateWhen:
      'A data export path is defined and the absolute count of affected users is confirmed below the threshold requiring proactive migration support.',
  },
  meta: {
    model: 'mock@m1',
    latencyMs: 1050,
    promptVersion: 'change@2026-05-27',
  },
}

export const skipFeatureMock: DecisionResult = {
  verdict: 'skip',
  confidence: 79,
  mode: 'feature',
  summary:
    'Solution proposed before the problem is named. "Engagement" is assumed as a goal, not validated. Cost is high relative to evidence.',
  scorecard: {
    overallScore: 34,
    spread: 11.4,
    evidenceQuality: 41,
    strongest: 'strategic-alignment',
    weakest: 'evidence-of-need',
    dimensions: [
      {
        id: 'problem-clarity',
        label: 'Problem Clarity',
        weight: 0.18,
        score: 28,
        band: 'weak',
        rationale:
          'No user problem is stated. "Sharing progress" is a behavior, not a need.',
        signals: [
          { type: 'negative', statement: 'Input describes a feature, not a problem' },
        ],
      },
      {
        id: 'evidence-of-need',
        label: 'Evidence of Need',
        weight: 0.2,
        score: 18,
        band: 'counter',
        rationale:
          'No data, request volume, or signal cited. Engagement framed as a goal in itself.',
        signals: [
          { type: 'negative', statement: 'No customer demand evidence provided' },
          {
            type: 'unknown',
            statement: 'Engagement metric and target not defined',
          },
        ],
      },
      {
        id: 'solution-fit',
        label: 'Solution Fit',
        weight: 0.15,
        score: 36,
        band: 'weak',
        rationale:
          'Social feeds are weakly correlated with retention outside consumer-social categories.',
        signals: [
          {
            type: 'negative',
            statement: 'Pattern fails in most B2B and productivity contexts',
          },
        ],
      },
      {
        id: 'user-value',
        label: 'User Value',
        weight: 0.12,
        score: 32,
        band: 'weak',
        rationale:
          'Benefit to the individual user is unspecified; gain is framed at the company-metric level.',
        signals: [
          {
            type: 'negative',
            statement: '"Increase engagement" is operator framing, not user framing',
          },
        ],
      },
      {
        id: 'implementation-cost',
        label: 'Implementation Cost',
        weight: 0.12,
        score: 22,
        band: 'weak',
        rationale:
          'Social features carry permanent cost in moderation, reporting, and content policy.',
        signals: [
          { type: 'negative', statement: 'Moderation pipeline becomes table-stakes' },
          {
            type: 'negative',
            statement: 'Privacy and reporting tooling required from day one',
          },
        ],
      },
      {
        id: 'strategic-alignment',
        label: 'Strategic Alignment',
        weight: 0.1,
        score: 52,
        band: 'mixed',
        rationale:
          'Could fit if product positioning is community-driven; not established here.',
        signals: [
          { type: 'unknown', statement: 'No stated community thesis' },
        ],
      },
      {
        id: 'risk-profile',
        label: 'Risk Profile',
        weight: 0.13,
        score: 46,
        band: 'mixed',
        rationale:
          'Trust, safety, and abuse surface area expands materially with any social primitive.',
        signals: [
          { type: 'negative', statement: 'Abuse and harassment vectors introduced' },
        ],
      },
    ],
  },
  risks: [
    {
      id: 'engagement-as-goal',
      severity: 'high',
      statement:
        'Optimizing for engagement with no tied user outcome rewards the wrong behavior.',
      linkedDimension: 'user-value',
    },
    {
      id: 'permanent-mod-cost',
      severity: 'high',
      statement:
        'Social features require ongoing moderation investment regardless of usage.',
      linkedDimension: 'implementation-cost',
    },
    {
      id: 'trust-safety-surface',
      severity: 'medium',
      statement:
        'Harassment and abuse become product problems with no prior tooling.',
      linkedDimension: 'risk-profile',
    },
  ],
  missingValidation: [
    {
      question: 'What specific user problem would a social feed solve?',
      whyItMatters:
        'Without a named problem, success has no definition and failure has no signal.',
      howToCheck:
        'Five interviews asking users to describe times they wanted to share progress and what they did instead.',
      linkedDimension: 'problem-clarity',
    },
    {
      question:
        'Is engagement a leading indicator of any outcome you care about?',
      whyItMatters:
        "If engagement isn't tied to retention or revenue, the goal is vanity.",
      howToCheck:
        'Correlate current engagement events with 90-day retention.',
      linkedDimension: 'evidence-of-need',
    },
  ],
  refineRecommendation: null,
  meta: {
    model: 'mock@m1',
    latencyMs: 980,
    promptVersion: 'feature@2026-05-23',
  },
}
