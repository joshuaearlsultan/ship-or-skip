// api/sanitize.ts
// ─────────────────────────────────────────────────────────────────────────
// Output normalization layer.
//
// Applied AFTER extractJSON, BEFORE ToolOutputSchema.safeParse.
// Architecture: LLM → extractJSON → sanitizeToolOutput → safeParse → render
//
// CONTRACT:
//   - Only human-readable prose strings are modified.
//   - Enums, IDs, scores, booleans, and structural fields pass through unchanged.
//   - The function is safe to call on any unknown value — it does not throw.
// ─────────────────────────────────────────────────────────────────────────

// ── Exported utilities ──────────────────────────────────────────────────────

/**
 * Collapse runs of whitespace (spaces, tabs, newlines) to a single space
 * and trim leading/trailing whitespace.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Truncate `text` to at most `max` characters, preferring a word boundary.
 * No ellipsis is appended — the result is a clean substring.
 *
 * Word-boundary truncation kicks in only when the nearest space falls in
 * the second half of the allowed range, preventing pathologically short
 * results when the first word is very long.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const candidate = text.slice(0, max)
  const lastSpace = candidate.lastIndexOf(' ')
  return lastSpace >= Math.floor(max / 2)
    ? candidate.slice(0, lastSpace).trimEnd()
    : candidate.trimEnd()
}

/**
 * Normalize whitespace then truncate to `max` characters.
 * Primary utility for all short prose fields.
 */
export function safeShortText(text: string, max: number): string {
  return truncate(normalizeWhitespace(text), max)
}

// ── Internal helpers ────────────────────────────────────────────────────────

/** Apply safeShortText only when value is a non-empty string; return as-is otherwise. */
function sanitizeStr(value: unknown, max: number): unknown {
  return typeof value === 'string' && value.length > 0
    ? safeShortText(value, max)
    : value
}

/** Apply a sanitizer to each element of an array. Non-arrays pass through unchanged. */
function sanitizeArr(value: unknown, fn: (item: unknown) => unknown): unknown {
  return Array.isArray(value) ? value.map(fn) : value
}

// ── Field-level sanitizers ──────────────────────────────────────────────────
// One function per schema object type. Only prose fields are touched;
// every other key is spread through unmodified.

function sanitizeSignal(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const s = raw as Record<string, unknown>
  return { ...s, statement: sanitizeStr(s['statement'], 140) }
  // s.type is an enum — not touched
}

function sanitizeDimension(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const d = raw as Record<string, unknown>
  return {
    ...d,
    // d.id (kebab-case ID) and d.score (number) — not touched
    rationale: sanitizeStr(d['rationale'], 300),
    signals:   sanitizeArr(d['signals'], sanitizeSignal),
  }
}

function sanitizeScorecard(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const sc = raw as Record<string, unknown>
  return { ...sc, dimensions: sanitizeArr(sc['dimensions'], sanitizeDimension) }
}

function sanitizeRisk(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const r = raw as Record<string, unknown>
  return { ...r, statement: sanitizeStr(r['statement'], 140) }
  // r.id, r.severity, r.linkedDimension — not touched
}

function sanitizeMissingValidationItem(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const mv = raw as Record<string, unknown>
  return {
    ...mv,
    // mv.linkedDimension — not touched
    question:     sanitizeStr(mv['question'],     160),
    whyItMatters: sanitizeStr(mv['whyItMatters'], 200),
    howToCheck:   sanitizeStr(mv['howToCheck'],   180),
  }
}

function sanitizeImprovement(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const imp = raw as Record<string, unknown>
  return { ...imp, action: sanitizeStr(imp['action'], 180) }
  // imp.targetDimension, imp.expectedLift (enum) — not touched
}

function sanitizeRefineRecommendation(raw: unknown): unknown {
  // null is valid (Ship/Skip verdict) — pass through
  if (raw === null || raw === undefined) return raw
  if (typeof raw !== 'object') return raw
  const rr = raw as Record<string, unknown>
  return {
    ...rr,
    // Each whatsWrong item is a prose string with a 140-char limit
    whatsWrong: sanitizeArr(rr['whatsWrong'], (item) => sanitizeStr(item, 140)),
    improvements: sanitizeArr(rr['improvements'], sanitizeImprovement),
    // smallerExperiment is nullable — sanitizeStr returns null unchanged
    smallerExperiment: sanitizeStr(rr['smallerExperiment'], 220),
    reEvaluateWhen:    sanitizeStr(rr['reEvaluateWhen'],    240),
  }
}

// ── Main export ─────────────────────────────────────────────────────────────

/**
 * Normalize raw LLM JSON output before Zod validation.
 *
 * Prose strings are whitespace-collapsed and length-capped to their schema
 * maximums. All other values (enums, IDs, numbers, arrays) pass through
 * unchanged so Zod validation can still catch structural violations.
 *
 * Safe to call on any value — returns the input unchanged if it is not
 * a plain object.
 */
export function sanitizeToolOutput(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw
  const obj = raw as Record<string, unknown>

  return {
    ...obj,
    // mode is an enum — not touched
    summary:              sanitizeStr(obj['summary'], 240),
    scorecard:            sanitizeScorecard(obj['scorecard']),
    risks:                sanitizeArr(obj['risks'], sanitizeRisk),
    missingValidation:    sanitizeArr(obj['missingValidation'], sanitizeMissingValidationItem),
    refineRecommendation: sanitizeRefineRecommendation(obj['refineRecommendation']),
  }
}
