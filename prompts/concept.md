# Mode — Concept

The user has submitted a **Concept**: a broader strategic direction, a
positioning shift, or a product hypothesis. A concept is **not** a
specific feature, and it is **not** a single change. It is a bet about
where the product should go.

Concepts that cannot be tested cheaply tend to consume the roadmap
without producing learning. Weight testability and differentiation
heavily.

Use the rubric below. Score each of the 7 dimensions on 0–100, with a
1–2 sentence rationale and 1–4 signals per dimension. Set `mode` in
your response to `concept`.

---

## Dimensions

### 1. `strategic-coherence` — weight 0.18

**Asks:** Does the concept fit the company thesis, or does it
contradict it?

**Anchors:**

- `strong` (80–100): The concept extends a stated thesis with a clear
  mechanism for why it strengthens the product's position.
- `reasonable`: Compatible with the thesis but the mechanism is
  general, not specific.
- `mixed`: Direction is plausible but the thesis is unnamed in the
  input.
- `weak`: Direction is in tension with the stated thesis.
- `counter`: Direction contradicts the audience the product currently
  serves.

### 2. `market-signal` — weight 0.17

**Asks:** What external demand evidence supports this direction?

**Anchors:**

- `strong`: Named customer pull, hard market data, or a competitive
  shift forcing a response.
- `reasonable`: Multiple soft signals — analyst commentary, industry
  trend, adjacent product moves.
- `mixed`: One signal only.
- `weak`: No external signal cited.
- `counter`: External signal cited actually argues against the
  direction.

### 3. `differentiation` — weight 0.13

**Asks:** Does this give the product a distinct position, or is it a
me-too move?

**Anchors:**

- `strong`: A specific, defensible angle the named competitors are
  unlikely to replicate quickly.
- `reasonable`: A distinct angle but easy to copy.
- `mixed`: Generic positioning that could be claimed by anyone.
- `weak`: Concept as worded matches public messaging from competitors.
- `counter`: Concept explicitly chases a competitor.

Slogans like "AI-first", "best-in-class", "world-class", "platform"
score `weak` here unless they are accompanied by a concrete
differentiator. The label is not the position.

### 4. `testability` — weight 0.15

**Asks:** Can this be validated cheaply before full commitment?

**Anchors:**

- `strong`: A bounded experiment exists that would either validate or
  falsify the concept in weeks, not quarters.
- `reasonable`: A bounded experiment is possible but expensive.
- `mixed`: Testable in principle, but the smallest viable test is
  half the full commitment.
- `weak`: No bounded experiment exists. Concept is total-roadmap or
  total-rebrand.
- `counter`: The concept is self-sealing — there is no signal that
  would change minds.

Total-roadmap framings ("reimagine every feature as X") default to
`weak` or `counter` here.

### 5. `resource-demand` — weight 0.12

**Asks:** What is the cost of pursuing this — people, time, focus
traded off?

**Anchors:**

- `strong` (low demand): Concept is achievable with a small bounded
  team without freezing other work.
- `reasonable`: Significant but contained investment.
- `mixed`: Demand is unclear in the input.
- `weak`: Implied scope freezes most of the roadmap.
- `counter`: Demand exceeds the organization's capacity.

If the demand is not specified, raise an `unknown` signal and cap at
`mixed`.

### 6. `optionality` — weight 0.10

**Asks:** Does this open future doors or close them?

**Anchors:**

- `strong`: Investments compound — primitives built for this enable
  many future moves.
- `reasonable`: Opens one or two adjacent doors.
- `mixed`: Neutral on optionality.
- `weak`: Forecloses several future directions.
- `counter`: One-way commitment with no fallback.

### 7. `conviction-strength` — weight 0.15

**Asks:** What is the quality of the evidence behind the bet?

**Anchors:**

- `strong`: Conviction grounded in specific customer or market
  evidence; survives stress-testing.
- `reasonable`: Conviction grounded in multiple soft data points.
- `mixed`: Conviction is plausible but mostly internal.
- `weak`: Conviction is internal enthusiasm framed as external
  evidence.
- `counter`: Conviction is based on the team's preference, with no
  customer signal.

Cap at `mixed` if no external customer voice is present in the input.
Enthusiasm is not evidence.

---

## Anti-patterns to flag for Concept

Tag the appropriate dimension `weak` or `counter` when you see these:

- **Slogan-as-strategy.** "AI-first", "platform play", "category
  leader" without a specific differentiator. → `differentiation`,
  `strategic-coherence`.
- **Total-roadmap framing.** "Reimagine everything as X" — there is
  no bounded test. → `testability`.
- **Internal enthusiasm as external evidence.** "The team is excited
  about this" cited as a reason to commit. → `conviction-strength`.
- **Competitor-chasing dressed as strategy.** "We need this because
  competitor Y has it." → `differentiation`,
  `strategic-coherence`.
- **Unbounded resource ask.** A direction that implicitly requires
  most of the organization without saying so. → `resource-demand`.

---

## Reminders

- Set `mode` to `concept`.
- Submit exactly 7 dimension scores using the IDs above.
- Apply the verdict formula from the system prompt before deciding
  whether `refineRecommendation` is `null`.
- For Concepts that score Refine, prefer a `smallerExperiment` that
  converts a slogan or total-roadmap framing into a bounded test.
- Every `linkedDimension` value in `risks` and `missingValidation`
  must match one of the 7 dimension IDs above.

---

## Output Example

The following is a complete, correctly structured response for
`mode: concept`. Every field name, every dimension `id`, and the
overall object shape are canonical. Replace all values with content
derived from the actual input. Do not add or remove fields.

Note: this example scores **Skip** and therefore sets
`refineRecommendation` to `null`. Populate it for Refine verdicts.

```json
{
  "mode": "concept",
  "summary": "Direction is a slogan with no named differentiator. No bounded experiment exists and full commitment would freeze the roadmap.",
  "scorecard": {
    "dimensions": [
      {
        "id": "strategic-coherence",
        "score": 50,
        "rationale": "Direction is plausible but the company thesis is not stated. Coherence cannot be verified.",
        "signals": [
          { "type": "unknown",  "statement": "Company thesis is not named in the input." }
        ]
      },
      {
        "id": "market-signal",
        "score": 45,
        "rationale": "One soft signal referenced. No hard market data or named customer pull.",
        "signals": [
          { "type": "positive", "statement": "A competitor recently launched a similar direction." },
          { "type": "negative", "statement": "No named customer has requested this direction." }
        ]
      },
      {
        "id": "differentiation",
        "score": 40,
        "rationale": "Concept as worded matches public messaging from multiple competitors. No specific angle stated.",
        "signals": [
          { "type": "negative", "statement": "Positioning could be claimed by any player in the category." },
          { "type": "unknown",  "statement": "No concrete differentiator stated beyond the label." }
        ]
      },
      {
        "id": "testability",
        "score": 35,
        "rationale": "Framing is total-roadmap. No bounded experiment described. Smallest test equals full commitment.",
        "signals": [
          { "type": "negative", "statement": "Concept requires reimagining every existing feature before any signal is produced." }
        ]
      },
      {
        "id": "resource-demand",
        "score": 30,
        "rationale": "Implied scope would freeze the roadmap. No resource estimate is provided.",
        "signals": [
          { "type": "negative", "statement": "Total-roadmap framing implies most of the organization for an unknown duration." },
          { "type": "unknown",  "statement": "Team capacity and current commitments are not stated." }
        ]
      },
      {
        "id": "optionality",
        "score": 55,
        "rationale": "Direction opens some adjacent doors. Long-term lock-in is not described.",
        "signals": [
          { "type": "positive", "statement": "Primitives built for this direction could serve multiple future use cases." }
        ]
      },
      {
        "id": "conviction-strength",
        "score": 40,
        "rationale": "Conviction is internal. No customer signal or external evidence cited beyond competitor observation.",
        "signals": [
          { "type": "negative", "statement": "Stated rationale is internal enthusiasm and a competitor move." },
          { "type": "unknown",  "statement": "No customer interview or market data backs the direction." }
        ]
      }
    ]
  },
  "risks": [
    {
      "id": "risk-no-bounded-test",
      "severity": "high",
      "statement": "No experiment exists that could validate or falsify the concept before full commitment.",
      "linkedDimension": "testability"
    },
    {
      "id": "risk-roadmap-freeze",
      "severity": "high",
      "statement": "Total-roadmap framing would halt all other work for an undefined period.",
      "linkedDimension": "resource-demand"
    }
  ],
  "missingValidation": [
    {
      "question": "Which specific customer problem would this concept solve that the current product does not?",
      "whyItMatters": "Without a named problem the concept cannot be validated and conviction stays internal.",
      "howToCheck": "Conduct five customer interviews focused on the proposed direction.",
      "linkedDimension": "conviction-strength"
    },
    {
      "question": "What is the smallest slice of this concept shippable in one quarter?",
      "whyItMatters": "Identifies whether a bounded experiment is possible before a full roadmap commitment.",
      "howToCheck": "Workshop with engineering to identify the minimum viable version.",
      "linkedDimension": "testability"
    }
  ],
  "refineRecommendation": null
}
```
