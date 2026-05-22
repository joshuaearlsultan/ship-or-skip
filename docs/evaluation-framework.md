# Evaluation Framework

This document is the canonical reference for how Ship or Skip evaluates an
input and produces a verdict. The TypeScript models in `src/types/` and the
prompts in `prompts/` are both derived from this document. When in doubt,
this file wins.

The framework is designed to be **explainable**. Every verdict is the visible
sum of weighted dimensional scores, each backed by a rationale and concrete
signals. A user who disagrees with the verdict can point at a specific
scorecard cell, not at a vibe.

---

## 1. Three Modes

Ship or Skip evaluates three categories of pre-build idea. Each category
asks a fundamentally different question, so each uses a different rubric.
The **output shape** is identical across modes; only the dimension set
swaps.

| Mode | Question it answers |
|---|---|
| `feature` — Feature Idea | Should we build this new thing? |
| `change` — Product Change | Should we modify this existing thing? |
| `concept` — Concept | Should we pursue this direction at all? |

A mode is selected by the user before submitting. If a user picks the wrong
mode (e.g. submits a strategic concept under Feature Idea), the dimensions
applied will not be a clean fit and the resulting scorecard will surface
that mismatch through low evidence quality.

---

## 2. Feature Idea Evaluation

A Feature Idea is a specific, named thing a team is considering building.
The evaluation asks whether the proposed feature is anchored to a real,
validated user problem with a tolerable cost.

### Dimensions

| ID | Label | Weight | What it asks |
|---|---|---|---|
| `problem-clarity` | Problem Clarity | 0.18 | Is there a specific, named user problem — not a feature wish? |
| `evidence-of-need` | Evidence of Need | 0.20 | Is the problem validated by data, requests, or signal — not assumed? |
| `solution-fit` | Solution Fit | 0.15 | Does the proposed feature actually solve the named problem? |
| `user-value` | User Value | 0.12 | Concrete benefit to a specific user, not abstract "engagement"? |
| `implementation-cost` | Implementation Cost | 0.12 | Complexity, surface area, and hidden permanent costs (moderation, support, migrations)? |
| `strategic-alignment` | Strategic Alignment | 0.10 | Fit with current product direction and audience? |
| `risk-profile` | Risk Profile | 0.13 | Failure modes, second-order effects, things that break if this ships? |

Weights sum to 1.00.

### Anti-patterns specific to Feature Idea

- A feature proposed **before** the problem is named. Lower
  `problem-clarity`.
- Operator framing ("increase engagement", "drive retention") as the user
  benefit. Lower `user-value`.
- Permanent ongoing costs (moderation, content policy, ToS handling)
  treated as one-time engineering work. Lower `implementation-cost`.
- "Users have asked for it" without volume, named accounts, or revenue
  linkage. Cap `evidence-of-need` at the `mixed` band.

---

## 3. Product Change Evaluation

A Product Change is a modification to existing behavior — a removal, a
redesign, a default change, or an expansion of scope. Unlike a Feature
Idea, a change has **incumbent users** who will be affected whether or not
they asked for it. The evaluation weights downside and reversibility more
heavily than upside.

### Dimensions

| ID | Label | Weight | What it asks |
|---|---|---|---|
| `change-justification` | Change Justification | 0.18 | Why now? What changed in the world or the data? |
| `impact-scope` | Impact Scope | 0.15 | Who is affected, how many, how deeply? |
| `existing-user-risk` | Existing User Risk | 0.18 | Downside for users who rely on current behavior? |
| `reversibility` | Reversibility | 0.12 | If we're wrong, how hard is it to undo? |
| `improvement-magnitude` | Improvement Magnitude | 0.15 | Size of the upside relative to the disruption? |
| `migration-cost` | Migration Cost | 0.10 | User behavior change, communication load, support load? |
| `implementation-complexity` | Implementation Complexity | 0.12 | Engineering surface area and dependencies? |

Weights sum to 1.00.

### Anti-patterns specific to Product Change

- Change driven by aesthetic or internal preference, with no external
  signal. Lower `change-justification`.
- Removal of a feature whose usage is presented in aggregate without
  knowing **who** uses it. Long-tail enterprise reliance is a frequent
  blind spot. Lower `existing-user-risk`.
- "We can always roll it back" applied to schema, pricing, or API changes
  that are functionally irreversible. Lower `reversibility`.
- Improvement framed in operator metrics with no user-facing benefit
  named. Cap `improvement-magnitude` at the `mixed` band.

---

## 4. Concept Evaluation

A Concept is a broader strategic direction, a positioning shift, or a
product hypothesis — not a specific feature. The evaluation weights
testability and differentiation heavily, because concepts that cannot be
tested cheaply tend to consume the roadmap without producing learning.

### Dimensions

| ID | Label | Weight | What it asks |
|---|---|---|---|
| `strategic-coherence` | Strategic Coherence | 0.18 | Does it fit the company thesis, or contradict it? |
| `market-signal` | Market Signal | 0.17 | External demand evidence — customers, competitors, trends? |
| `differentiation` | Differentiation | 0.13 | Distinct position, or me-too? |
| `testability` | Testability | 0.15 | Can it be validated cheaply before full commitment? |
| `resource-demand` | Resource Demand | 0.12 | Cost of pursuing — people, time, focus traded off? |
| `optionality` | Optionality | 0.10 | Opens or closes future doors? |
| `conviction-strength` | Conviction Strength | 0.15 | Evidence quality behind the bet, not just enthusiasm? |

Weights sum to 1.00.

### Anti-patterns specific to Concept

- Sloganeering ("AI-first", "world-class", "best-in-class") in place of a
  thesis. Lower `strategic-coherence`.
- Total-roadmap framing ("reimagine everything as X") that has no
  bounded experiment. Lower `testability`.
- Positioning that matches public messaging from multiple competitors.
  Lower `differentiation`.
- Internal enthusiasm cited as external evidence. Cap
  `conviction-strength` at the `mixed` band.

---

## 5. Scoring

### 5.1 Dimension score

Every dimension is scored 0–100 on a five-band scale:

| Band | Score range | Meaning |
|---|---|---|
| `strong` | 80–100 | Clear positive signal |
| `reasonable` | 60–79 | Positive but caveated |
| `mixed` | 40–59 | Genuinely uncertain |
| `weak` | 20–39 | Negative signal, fixable |
| `counter` | 0–19 | Actively argues against |

Every dimension score must be backed by **at least one signal** — a short
factual statement tagged `positive`, `negative`, or `unknown`. `unknown`
signals are how the model declares that a relevant fact is missing from
the input, and they feed `missingValidation` downstream.

### 5.2 Scorecard aggregates

The server computes the following from the dimension scores, using the
mode's weights:

```
overallScore    = round( Σ dimension.score × dimension.weight )
spread          = stddev( dimension.score for all dimensions )
evidenceQuality = round( 100 × (count of non-'unknown' signals)
                            / (total signal count) )
strongest       = id of dimension with highest score
weakest         = id of dimension with lowest score
```

`evidenceQuality` is a separate axis from `overallScore`. A high score
with low evidence quality is a *speculative* positive — the kind of
result that should make a PM ask follow-up questions. The scorecard
surfaces both numbers so the user can read the difference.

### 5.3 Confidence

Confidence is not the same as score. It reflects how much the model
trusts its own assessment:

```
confidence = round( clamp(0, 100,
    overallScore        × 0.60
  + (100 − spread × 2)  × 0.25      // tight spread → more confident
  + evidenceQuality     × 0.15
))
```

A high score with high spread (one dimension flagged `counter`, the rest
`strong`) yields only **moderate** confidence — exactly the case that
should make a reader pause and inspect the outlier.

---

## 6. Verdict Rules

The verdict is **derived from the scorecard server-side**, not chosen by
the model. This split is load-bearing: the model is good at reasoning
about a single dimension at a time, and bad at arithmetic. The server is
good at arithmetic and incapable of rationalizing.

```
let minScore     = min(dimension.score for all dimensions)
let counterCount = count of dimensions in 'counter' band

Ship   ⇐  overallScore ≥ 72  AND  minScore ≥ 45
Skip   ⇐  overallScore < 45  OR   counterCount ≥ 2
Refine ⇐  everything else
```

Notes:

- The `minScore ≥ 45` floor on Ship prevents shipping when one dimension
  is critically broken even if six are excellent.
- The `counterCount ≥ 2` clause on Skip catches ideas where multiple
  fundamentals are actively negative, even if the weighted mean is
  borderline.
- Refine is the residual. It is the most common verdict by design — most
  ideas need refinement.

---

## 7. Refine Recommendation

When the verdict is `refine`, the result **must** include a
`refineRecommendation` containing:

- `whatsWrong` — 1–4 short statements naming the specific weaknesses.
- `improvements` — 1–4 concrete actions, each linked to the dimension it
  would lift and an expected qualitative lift (`small` / `moderate` /
  `large`).
- `smallerExperiment` — optional. A cheaper test the team could run
  before fully committing. Often turns an untestable Concept into a
  testable one.
- `reEvaluateWhen` — the specific signal that would change the verdict
  on re-submission. Without this, "refine" is advice without a finish
  line.

When the verdict is `ship` or `skip`, `refineRecommendation` **must be
null**. A Skip verdict does not come with a path to Ship — it comes with
the reasons it is a Skip. A Ship verdict does not need refinement.

Expected lift is qualitative on purpose. Quantitative "+15 points" would
be false precision; the underlying scores are themselves judgments.

---

## 8. Explainability Principles

Every output cell in the response is traceable to a scorecard
dimension:

- Each `Risk` has a `linkedDimension` pointing to the dimension whose
  low score it reflects.
- Each `MissingValidation` item has a `linkedDimension` pointing to the
  dimension whose evidence is incomplete.
- Each `Improvement` inside a `RefineRecommendation` has a
  `targetDimension` it would lift.

This lets the UI route the eye from a verdict, through a dimension, to
its supporting signals and back. Users argue with cells, not with the
final answer.

---

## 9. Tone Constraints

These are part of the framework because they are part of the product
promise.

The response must:

- Lead with the verdict and confidence, then supporting structure.
- Use short, scannable sentences. No multi-paragraph prose.
- Avoid praise ("great idea", "love this", "exciting", "amazing",
  "wonderful").
- Avoid hedging filler ("it could be argued that", "in many ways").
- Use operator-neutral language. Do not address the user as "you" in
  the rationale — describe the idea, not the submitter.
- Treat unknowns as unknowns. Do not invent evidence to fill a gap;
  raise a `MissingValidation` item instead.

A tone violation is treated as a schema violation by the server-side
linter and triggers a regeneration.

---

## 10. Versioning

The mode dimension sets, weights, and verdict thresholds in this
document constitute version **1** of the framework. Any change to
weights, thresholds, or dimension membership is a framework version
bump and must be accompanied by a re-baseline of the evaluation suite
in `evals/`.

The framework version is reflected in each prompt's `promptVersion`
field, e.g. `feature@2026-05-23`, so a stored result can be traced to
the exact rubric that produced it.
