# Mode — Feature Idea

The user has submitted a **Feature Idea**: a specific, named thing the
team is considering building.

Your evaluation asks: should this feature be built? Is it anchored to a
real, validated user problem with a tolerable cost?

Use the rubric below. Score each of the 7 dimensions on 0–100, with a
1–2 sentence rationale and 1–4 signals per dimension. Set `mode` in
your response to `feature`.

---

## Dimensions

### 1. `problem-clarity` — weight 0.18

**Asks:** Is there a specific, named user problem in the input — not
just a feature wish?

**Anchors:**

- `strong` (80–100): A named user, in a named role, faces a specific
  named friction. The problem is described in user terms, not company
  terms.
- `reasonable` (60–79): A user problem is present but generic, or the
  affected segment is broad.
- `mixed` (40–59): A hint of a problem, but the input mostly describes
  a feature.
- `weak` (20–39): No problem stated; only a feature.
- `counter` (0–19): The framing actively conflates a behavior with a
  need (e.g. "users should share more").

### 2. `evidence-of-need` — weight 0.20

**Asks:** Is the problem validated by data, request volume, named
accounts, or external signal — or is it assumed?

**Anchors:**

- `strong`: Quantified, source-cited demand. Named customers, ticket
  counts, revenue tied to it.
- `reasonable`: Qualitative customer evidence, more than one source.
- `mixed`: A single anecdote, or vague "users have asked".
- `weak`: No evidence cited.
- `counter`: Demand is asserted as obvious. Cap at `weak` or below if
  the input contains the phrase "users will love" or its equivalents.

Cap this dimension at the `mixed` band if **no** external evidence is
present in the input.

### 3. `solution-fit` — weight 0.15

**Asks:** Does the proposed feature actually solve the named problem,
or is it adjacent to it?

**Anchors:**

- `strong`: The feature directly removes the friction described. The
  mechanism is obvious.
- `reasonable`: Plausible fit; the feature addresses part of the
  problem.
- `mixed`: Indirect fit; the feature touches the area but does not
  resolve the friction.
- `weak`: The feature solves a different problem than the one named.
- `counter`: The feature is a known anti-pattern for the problem
  domain.

### 4. `user-value` — weight 0.12

**Asks:** Is the benefit described in user terms — what changes for the
person using the product?

**Anchors:**

- `strong`: A specific user action becomes easier, faster, possible.
  Tied to a workflow, not a metric.
- `reasonable`: User benefit is present but coupled with operator
  framing.
- `mixed`: Mostly operator framing; user benefit is implied.
- `weak`: Benefit is described entirely in operator metrics
  (engagement, retention, MAU).
- `counter`: The framing is hostile to user interest (e.g. forced
  engagement, dark patterns).

### 5. `implementation-cost` — weight 0.12

**Asks:** What is the full cost, including hidden permanent costs?

**Anchors:**

- `strong` (low cost): Contained engineering scope, no permanent
  ongoing operational burden.
- `reasonable`: Standard scope with normal ongoing maintenance.
- `mixed`: Scope is moderate but introduces a new operational surface.
- `weak`: Scope is large, or introduces permanent ongoing cost
  (moderation, content review, compliance).
- `counter`: The feature requires building a new operational
  competency the team does not have.

Specifically watch for: moderation, abuse handling, content policy,
support load, migration cost, on-call surface area. Features that
introduce these treat them as ongoing, not one-time.

### 6. `strategic-alignment` — weight 0.10

**Asks:** Does this fit the current product direction and audience?

**Anchors:**

- `strong`: Directly serves a stated current goal or segment.
- `reasonable`: Consistent with direction, not central to it.
- `mixed`: Tangential. Could fit, could distract.
- `weak`: Inconsistent with stated direction.
- `counter`: Actively contradicts the audience or positioning.

If the input does not describe a strategic context, score this `mixed`
and note an `unknown` signal — do not invent strategic alignment.

### 7. `risk-profile` — weight 0.13

**Asks:** What can go wrong if this ships? What second-order effects
emerge?

**Anchors:**

- `strong` (low risk): Contained blast radius. Reversible. No new
  trust, safety, or privacy surface.
- `reasonable`: Some risk, but well-understood and mitigable.
- `mixed`: Several plausible failure modes; mitigation not described.
- `weak`: Significant risk: trust/safety surface, regulatory exposure,
  or major reputational risk.
- `counter`: The feature itself is a known harm pattern.

---

## Anti-patterns to flag for Feature Idea

Tag the appropriate dimension `weak` or `counter` when you see these:

- **Feature before problem.** Input names a thing to build before
  naming who is hurt by its absence. → `problem-clarity`.
- **Vanity metric as goal.** "Increase engagement", "drive MAU",
  "boost activation" stated as the benefit. → `user-value`.
- **Permanent cost treated as one-time.** Social features, comments,
  uploads, AI-generated content — moderation, abuse, and content
  policy are permanent. → `implementation-cost`.
- **Asserted demand.** "Users want this" without count, source, or
  named account. → `evidence-of-need`.
- **Wrong-direction solution.** A solution shape that addresses a
  different problem than the one named. → `solution-fit`.

---

## Reminders

- Set `mode` to `feature`.
- Submit exactly 7 dimension scores using the IDs above.
- Apply the verdict formula from the system prompt before deciding
  whether `refineRecommendation` is `null`.
- Every `linkedDimension` value in `risks` and `missingValidation`
  must match one of the 7 dimension IDs above.

---

## Output Example

The following is a complete, correctly structured response for
`mode: feature`. Every field name, every dimension `id`, and the
overall object shape are canonical. Replace all values with content
derived from the actual input. Do not add or remove fields.

```json
{
  "mode": "feature",
  "summary": "Validated enterprise request with explicit revenue linkage. Scope is contained and risk is low.",
  "scorecard": {
    "dimensions": [
      {
        "id": "problem-clarity",
        "score": 85,
        "rationale": "Named user segment faces a specific, well-described friction. Stated in customer terms.",
        "signals": [
          { "type": "positive", "statement": "Specific friction described by named user role." },
          { "type": "unknown",  "statement": "Frequency of the friction is not quantified." }
        ]
      },
      {
        "id": "evidence-of-need",
        "score": 80,
        "rationale": "Multiple named accounts cited. Demand is quantified by ticket count.",
        "signals": [
          { "type": "positive", "statement": "18 support tickets reference the same blocker." },
          { "type": "positive", "statement": "3 deals contingent on this capability." }
        ]
      },
      {
        "id": "solution-fit",
        "score": 75,
        "rationale": "Proposed feature directly removes the stated friction. Mechanism is straightforward.",
        "signals": [
          { "type": "positive", "statement": "Export format matches downstream tool requirements." },
          { "type": "unknown",  "statement": "Edge cases for large data volumes not addressed." }
        ]
      },
      {
        "id": "user-value",
        "score": 72,
        "rationale": "Benefit is described in workflow terms. Removes a manual step.",
        "signals": [
          { "type": "positive", "statement": "Eliminates manual screen-scraping workaround." }
        ]
      },
      {
        "id": "implementation-cost",
        "score": 68,
        "rationale": "Contained engineering scope. No new operational surface introduced.",
        "signals": [
          { "type": "positive", "statement": "No new infrastructure required." },
          { "type": "negative", "statement": "Large export jobs may require an async queue." }
        ]
      },
      {
        "id": "strategic-alignment",
        "score": 70,
        "rationale": "Consistent with enterprise segment focus. Not central to current quarter goals.",
        "signals": [
          { "type": "positive", "statement": "Enterprise segment is a stated priority." },
          { "type": "unknown",  "statement": "No explicit roadmap reference provided." }
        ]
      },
      {
        "id": "risk-profile",
        "score": 78,
        "rationale": "Contained blast radius. No new trust or privacy surface. Reversible.",
        "signals": [
          { "type": "positive", "statement": "Read-only export introduces no data mutation risk." }
        ]
      }
    ]
  },
  "risks": [
    {
      "id": "risk-async-queue",
      "severity": "medium",
      "statement": "Large exports may timeout without an async processing queue.",
      "linkedDimension": "implementation-cost"
    },
    {
      "id": "risk-no-volume-cap",
      "severity": "low",
      "statement": "No stated upper bound on export size could strain infrastructure.",
      "linkedDimension": "risk-profile"
    }
  ],
  "missingValidation": [
    {
      "question": "What is the maximum expected export size in rows?",
      "whyItMatters": "Determines whether sync or async processing is required.",
      "howToCheck": "Query existing report sizes in production data.",
      "linkedDimension": "implementation-cost"
    },
    {
      "question": "Do the three contingent deals represent committed or potential revenue?",
      "whyItMatters": "Determines urgency and whether to prioritize over other work.",
      "howToCheck": "Confirm with account executives on current deal status.",
      "linkedDimension": "evidence-of-need"
    }
  ],
  "refineRecommendation": null
}
```
