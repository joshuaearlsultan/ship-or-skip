# Mode — Product Change

The user has submitted a **Product Change**: a modification to existing
behavior. This could be a removal, a redesign, a default change, a
deprecation, or an expansion of scope on an existing feature.

A product change has incumbent users who will be affected whether or
not they asked for it. Weight downside and reversibility heavily.

Use the rubric below. Score each of the 7 dimensions on 0–100, with a
1–2 sentence rationale and 1–4 signals per dimension. Set `mode` in
your response to `change`.

---

## Dimensions

### 1. `change-justification` — weight 0.18

**Asks:** Why now? What changed externally to motivate this change?

**Anchors:**

- `strong` (80–100): A specific external trigger — usage data, named
  customer feedback, competitive shift, regulatory change.
- `reasonable`: A trigger is present but partially internal (e.g. team
  preference plus some external signal).
- `mixed`: Plausible justification but no external trigger named.
- `weak`: Change is driven by internal aesthetic or team preference
  only.
- `counter`: Change is driven by recency bias or team boredom with the
  existing solution.

### 2. `impact-scope` — weight 0.15

**Asks:** Who is affected, how many, how deeply?

**Anchors:**

- `strong` (low scope, well-understood): Change touches a narrow
  feature with named users, easy to communicate.
- `reasonable`: Moderate scope, segment is known.
- `mixed`: Scope is broad but described in aggregate (e.g. "all paying
  users") without segment detail.
- `weak`: Scope is large and not well-characterized.
- `counter`: Scope is unknown and the team is treating that as fine.

A high score here means the scope is **clearly understood**, not
necessarily that the scope is small.

### 3. `existing-user-risk` — weight 0.18

**Asks:** What is the downside for users who rely on current behavior?

**Anchors:**

- `strong` (low risk): No users rely materially on the current
  behavior, or those who do have been consulted.
- `reasonable`: Some user reliance, but mitigation is described.
- `mixed`: User reliance plausible but unmeasured.
- `weak`: Likely material user reliance with no mitigation plan.
- `counter`: Removal of behavior on which named customers have built
  workflows or integrations.

Specifically watch for: API surface, schema, default behaviors, and
features whose users are systematically harder to survey (enterprise,
power users, integrators).

### 4. `reversibility` — weight 0.12

**Asks:** If we are wrong, how hard is it to undo?

**Anchors:**

- `strong` (highly reversible): UI changes behind a flag, easy to
  toggle off.
- `reasonable`: Reversible with some user disruption.
- `mixed`: Partially reversible; data or muscle memory cannot be
  recovered.
- `weak`: Functionally irreversible: schema changes, API removals,
  pricing changes, data migrations.
- `counter`: One-way door framed as reversible.

Treat "we can always roll it back" with skepticism. If the change
touches pricing, schema, API contracts, or user data, default to at
most `mixed`.

### 5. `improvement-magnitude` — weight 0.15

**Asks:** Size of the upside relative to the disruption?

**Anchors:**

- `strong`: Large user-facing improvement, clearly stated.
- `reasonable`: Moderate improvement, well-described.
- `mixed`: Improvement present but small relative to disruption.
- `weak`: Improvement is internal (cleaner code, less complexity)
  with little user-visible upside.
- `counter`: The change is framed as an improvement but reduces a
  user capability.

If the improvement is described only in operator metrics, cap at
`mixed`.

### 6. `migration-cost` — weight 0.10

**Asks:** What user behavior change, communication, and support load
does this create?

**Anchors:**

- `strong` (low migration cost): Behavior change is invisible or
  improves discoverability.
- `reasonable`: Modest behavior change with clear communication.
- `mixed`: Behavior change requires user retraining.
- `weak`: Significant retraining; integrations or saved workflows
  break.
- `counter`: Migration cost is borne entirely by users with no
  tooling support.

### 7. `implementation-complexity` — weight 0.12

**Asks:** What is the engineering surface and dependency footprint?

**Anchors:**

- `strong` (low complexity): Contained edit, no new dependencies.
- `reasonable`: Standard scope, dependencies known.
- `mixed`: Touches multiple systems; coordination needed.
- `weak`: Cross-team coordination, new infrastructure, or significant
  data work.
- `counter`: Requires changes the team does not have the competency
  to make.

---

## Anti-patterns to flag for Product Change

Tag the appropriate dimension `weak` or `counter` when you see these:

- **Aesthetic-driven change.** "We want it to feel cleaner" without
  external signal. → `change-justification`.
- **Removal by aggregate usage.** "Less than 2% use it, so we'll
  remove it" without knowing **who** the 2% is. → `existing-user-risk`.
- **Irreversibility ignored.** Schema, API, pricing, or data changes
  framed as easily revertable. → `reversibility`.
- **Internal benefit, no user benefit.** "Simplifies the data layer"
  with no user-facing improvement named. → `improvement-magnitude`.
- **Migration cost externalized.** Users are expected to figure out the
  new behavior without tooling or communication. → `migration-cost`.

---

## Reminders

- Set `mode` to `change`.
- Submit exactly 7 dimension scores using the IDs above.
- Apply the verdict formula from the system prompt before deciding
  whether `refineRecommendation` is `null`.
- Every `linkedDimension` value in `risks` and `missingValidation`
  must match one of the 7 dimension IDs above.

---

## Output Example

The following is a complete, correctly structured response for
`mode: change`. Every field name, every dimension `id`, and the
overall object shape are canonical. Replace all values with content
derived from the actual input. Do not add or remove fields.

Note: this example scores **Refine** and therefore includes a
populated `refineRecommendation` object. Set it to `null` for Ship
or Skip verdicts.

```json
{
  "mode": "change",
  "summary": "Justification is internal. Existing user reliance is unmeasured and the change is partially irreversible.",
  "scorecard": {
    "dimensions": [
      {
        "id": "change-justification",
        "score": 55,
        "rationale": "A trigger is present but it is internal preference only. No external signal named.",
        "signals": [
          { "type": "negative", "statement": "Stated reason is team preference for a simpler data layer." },
          { "type": "unknown",  "statement": "No external customer feedback or usage trend cited." }
        ]
      },
      {
        "id": "impact-scope",
        "score": 60,
        "rationale": "Affected segment described in aggregate only. No breakdown by user type or tier.",
        "signals": [
          { "type": "positive", "statement": "Feature usage is below 2% overall." },
          { "type": "negative", "statement": "Identity of the 2% is unknown — could be power users or enterprise accounts." }
        ]
      },
      {
        "id": "existing-user-risk",
        "score": 35,
        "rationale": "User reliance is plausible but unmeasured. No mitigation plan is described.",
        "signals": [
          { "type": "negative", "statement": "No survey or outreach to current feature users has been done." },
          { "type": "unknown",  "statement": "Whether enterprise accounts depend on this feature is not stated." }
        ]
      },
      {
        "id": "reversibility",
        "score": 50,
        "rationale": "UI removal is reversible. Any API surface that exposes this behavior is not.",
        "signals": [
          { "type": "positive", "statement": "No schema changes described." },
          { "type": "unknown",  "statement": "Whether an API endpoint exposes this feature is not stated." }
        ]
      },
      {
        "id": "improvement-magnitude",
        "score": 45,
        "rationale": "Improvement is internal only. No user-facing benefit is described.",
        "signals": [
          { "type": "negative", "statement": "Benefit framed as reduced data layer complexity with no user-visible upside." }
        ]
      },
      {
        "id": "migration-cost",
        "score": 60,
        "rationale": "No active data migration required. Users who relied on the feature will lose it without notice.",
        "signals": [
          { "type": "positive", "statement": "No data migration required." },
          { "type": "negative", "statement": "Affected users receive no warning or workaround." }
        ]
      },
      {
        "id": "implementation-complexity",
        "score": 70,
        "rationale": "Scope is a contained removal with no new dependencies or cross-team coordination.",
        "signals": [
          { "type": "positive", "statement": "Single-team removal with no stated cross-system dependencies." }
        ]
      }
    ]
  },
  "risks": [
    {
      "id": "risk-unknown-reliant-users",
      "severity": "high",
      "statement": "The users who rely on this feature have not been identified or contacted before removal.",
      "linkedDimension": "existing-user-risk"
    },
    {
      "id": "risk-internal-justification-only",
      "severity": "medium",
      "statement": "Change is driven entirely by internal preference with no external trigger.",
      "linkedDimension": "change-justification"
    }
  ],
  "missingValidation": [
    {
      "question": "Who are the users currently using this feature, and what account tier are they on?",
      "whyItMatters": "Removal that affects enterprise or power users carries disproportionate churn risk.",
      "howToCheck": "Segment usage data by account tier and user role before proceeding.",
      "linkedDimension": "existing-user-risk"
    },
    {
      "question": "Is this feature exposed via a public API or third-party integration?",
      "whyItMatters": "API removals are functionally irreversible and require advance deprecation notice.",
      "howToCheck": "Audit API documentation and search for external references in support tickets.",
      "linkedDimension": "reversibility"
    }
  ],
  "refineRecommendation": {
    "whatsWrong": [
      "Existing user reliance is unmeasured — the identity of the 2% who use this is unknown.",
      "No external trigger justifies the timing of this change.",
      "User-facing benefit is absent; the stated improvement is entirely internal."
    ],
    "improvements": [
      {
        "action": "Segment feature usage by account tier and user role before deciding to remove.",
        "targetDimension": "existing-user-risk",
        "expectedLift": "large"
      },
      {
        "action": "Identify one external signal — a customer complaint, support trend, or competitive reason — that justifies the timing.",
        "targetDimension": "change-justification",
        "expectedLift": "moderate"
      }
    ],
    "smallerExperiment": "Hide the feature behind a flag for 30 days and measure whether any users report its absence before removing it permanently.",
    "reEvaluateWhen": "Usage segment by account tier is known and at least one external justification for the timing is documented."
  }
}
```
