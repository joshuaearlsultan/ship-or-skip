# Ship or Skip — Product Definition

## 1. Product Overview

Ship or Skip is a pre-build decision engine for product teams.

It helps answer:
"Before you build it—should it exist?"

This is not a productivity tool.
This is a decision-quality tool.

---

## 2. Core Problem

Teams often:

- build features on time and within budget
- but those features fail because they were the wrong things to build

The failure happens before development:

- before sprint planning
- before tickets are created

No structured way exists to evaluate:
"Should we build this at all?"

---

## 3. Solution

Users input a feature idea.

The system:

- analyzes the idea using AI (Claude)
- identifies the real user problem
- challenges assumptions
- surfaces risks

Outputs a decision:

- Ship → strong signal, proceed
- Refine → promising but needs improvement
- Skip → weak or risky idea

---

## 4. Product Principles

- Calm, analytical tone (no hype or excitement)
- Structured output (not long paragraphs)
- Decision-first, not explanation-first
- No "Great idea!" or emotional language

---

## 5. UI Behavior

### Input

- Label: "Feature Idea"
- Placeholder: "Describe a feature idea, product change, or concept..."

### Actions

- Primary button: "Run Ship or Skip"
- Secondary: "Try Example"

### Output Sections

Each result includes:

- Decision (Ship / Refine / Skip + confidence %)
- Key Summary
- Risks
- Missing Validation
- Suggested Direction (especially for Refine)

---

## 6. Decision Definitions

### Ship

- Clear user problem
- Validated need or strong signal
- Reasonable complexity

Output:
"Ship (XX%)"

---

### Skip

- No clear user problem
- Assumptions without validation
- High complexity for unclear value

Output:
"Skip (XX%)"

---

### Refine

- Partial signal
- Needs improvement before building

Must include:

- What’s wrong
- How to improve the idea

Output:
"Refine (XX%)"

---

## 7. Example Input

"Add a social feed so users can share progress and increase engagement"

---

## 8. Expected Output Behavior

Skip Example:

- No clear user problem
- Engagement assumed, not validated
- High complexity (moderation, content)

Refine Example:

- Suggest smaller experiments
- Validate engagement drivers first

Ship Example:

- Clear problem
- Clear benefit
- Low complexity

---

## 9. Technical Direction

- Frontend: React (Vite)

- Single-page app

- Clean, minimal UI (dark theme optional)

- AI: Anthropic Claude

- Prompt-based structured output

---

## 10. Goal

Help teams:

- avoid building the wrong things
- improve decision quality
- reduce wasted engineering effort

---

## 11. Non-Goals

- Not a project management tool
- Not a backlog system
- Not a chatbot UI

---

## 12. Key Message

"Build the right thing—or don’t build it at all."
