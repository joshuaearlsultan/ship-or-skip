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
