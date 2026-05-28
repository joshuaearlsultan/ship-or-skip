import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  DecisionResult,
  EvaluationDimension,
  ScoreBand,
  Verdict,
} from "../src/types/decision";
import type { ApiResponse } from "../src/types/api";
import type { IdeaMode } from "../src/types/request";
import {
  EvaluationRequestSchema,
  ToolOutputSchema,
  type ToolOutput,
} from "./schema.js";
import { RUBRICS } from "./rubrics.js";
import { loadPrompt } from "./prompts.js";
import { resolveMockResult } from "../src/data/examples.js";
import { sanitizeToolOutput } from "./sanitize.js";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (10 req / 5 min per IP)
// ---------------------------------------------------------------------------

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateBucket>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(ip: string): HandlerError | null {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);

  if (!bucket || now > bucket.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }

  if (bucket.count >= RATE_LIMIT) {
    return new HandlerError(
      "rate_limited",
      "Too many requests. Try again in a few minutes.",
      {
        retryAfterMs: bucket.resetAt - now,
      },
    );
  }

  bucket.count++;
  return null;
}

// ---------------------------------------------------------------------------
// Simple in-memory result cache (24 h TTL)
// ---------------------------------------------------------------------------

interface CacheEntry {
  result: DecisionResult;
  expiresAt: number;
}

const resultCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function cacheKey(mode: IdeaMode, idea: string): string {
  return `${mode}:${idea.trim().toLowerCase()}`;
}

function getCached(mode: IdeaMode, idea: string): DecisionResult | null {
  const entry = resultCache.get(cacheKey(mode, idea));
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.result;
}

function setCached(mode: IdeaMode, idea: string, result: DecisionResult): void {
  resultCache.set(cacheKey(mode, idea), {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ---------------------------------------------------------------------------
// Tone linter
// ---------------------------------------------------------------------------

const BANNED_PHRASES = [
  "great idea",
  "love this",
  "this is exciting",
  "amazing",
  "wonderful",
  "fantastic",
  "world-class",
  "best-in-class",
  "seamless",
  "it could be argued",
  "in many ways",
  "to some extent",
];

function passesToneLint(output: ToolOutput): boolean {
  const text = JSON.stringify(output).toLowerCase();
  return !BANNED_PHRASES.some((phrase) => text.includes(phrase));
}

// ---------------------------------------------------------------------------
// Server-side scoring
// ---------------------------------------------------------------------------

function scoreToBand(score: number): ScoreBand {
  if (score >= 80) return "strong";
  if (score >= 60) return "reasonable";
  if (score >= 40) return "mixed";
  if (score >= 20) return "weak";
  return "counter";
}

function computeOverallScore(output: ToolOutput, mode: IdeaMode): number {
  const rubric = RUBRICS[mode];
  const total = output.scorecard.dimensions.reduce((sum, dim) => {
    const def = rubric.find((r) => r.id === dim.id);
    return sum + dim.score * (def?.weight ?? 0);
  }, 0);
  return Math.round(total);
}

function computeSpread(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

function computeEvidenceQuality(output: ToolOutput): number {
  const allSignals = output.scorecard.dimensions.flatMap((d) => d.signals);
  if (allSignals.length === 0) return 0;
  const known = allSignals.filter((s) => s.type !== "unknown").length;
  return Math.round((known / allSignals.length) * 100);
}

function deriveVerdict(
  overallScore: number,
  dimensions: EvaluationDimension[],
): Verdict {
  const minScore = Math.min(...dimensions.map((d) => d.score));
  const counterCount = dimensions.filter((d) => d.band === "counter").length;
  if (overallScore >= 72 && minScore >= 45) return "ship";
  if (overallScore < 45 || counterCount >= 2) return "skip";
  return "refine";
}

function computeConfidence(
  overallScore: number,
  spread: number,
  evidenceQuality: number,
): number {
  const raw =
    overallScore * 0.6 + (100 - spread * 2) * 0.25 + evidenceQuality * 0.15;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

function assembleResult(
  output: ToolOutput,
  latencyMs: number,
  promptVersion: string,
): DecisionResult {
  const rubric = RUBRICS[output.mode];
  const scores = output.scorecard.dimensions.map((d) => d.score);

  const dimensions: EvaluationDimension[] = output.scorecard.dimensions.map(
    (raw) => {
      const def = rubric.find((r) => r.id === raw.id);
      return {
        id: raw.id,
        label: def?.label ?? raw.id,
        weight: def?.weight ?? 0,
        score: raw.score,
        band: scoreToBand(raw.score),
        rationale: raw.rationale,
        signals: raw.signals,
      };
    },
  );

  const overallScore = computeOverallScore(output, output.mode);
  const spread = computeSpread(scores);
  const evidenceQuality = computeEvidenceQuality(output);

  const strongest = dimensions.reduce((a, b) => (a.score > b.score ? a : b)).id;
  const weakest = dimensions.reduce((a, b) => (a.score < b.score ? a : b)).id;

  const verdict = deriveVerdict(overallScore, dimensions);
  const confidence = computeConfidence(overallScore, spread, evidenceQuality);

  const refineRecommendation =
    verdict === "refine" ? (output.refineRecommendation ?? null) : null;

  return {
    verdict,
    confidence,
    mode: output.mode,
    summary: output.summary,
    scorecard: {
      overallScore,
      spread,
      evidenceQuality,
      dimensions,
      strongest,
      weakest,
    },
    risks: output.risks,
    missingValidation: output.missingValidation,
    refineRecommendation,
    meta: {
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-5",
      latencyMs,
      promptVersion,
    },
  };
}

// ---------------------------------------------------------------------------
// HandlerError — internal exception type, not exposed in API responses
// ---------------------------------------------------------------------------

class HandlerError extends Error {
  code: string;
  retryAfterMs?: number;

  constructor(code: string, message: string, opts?: { retryAfterMs?: number }) {
    super(message);
    this.code = code;
    this.retryAfterMs = opts?.retryAfterMs;
  }
}

// ---------------------------------------------------------------------------
// JSON extraction — handles code fences, preamble text, and suffix prose
// ---------------------------------------------------------------------------

function extractJSON(text: string): unknown {
  const attempts: string[] = [];

  // 1. Whole text as-is (model returned raw JSON with no wrapper)
  attempts.push(text.trim());

  // 2. Contents of a ```json … ``` or ``` … ``` fence
  const fenceMatch = text.match(/```(?:json)?[ \t]*\r?\n?([\s\S]*?)```/);
  if (fenceMatch?.[1]) attempts.push(fenceMatch[1].trim());

  // 3. First '{' to last '}' — strips leading prose and trailing text
  const first = text.indexOf('{');
  const last  = text.lastIndexOf('}');
  if (first !== -1 && last > first) attempts.push(text.slice(first, last + 1));

  for (const candidate of attempts) {
    try { return JSON.parse(candidate); } catch { /* try next strategy */ }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core evaluation logic
// ---------------------------------------------------------------------------

export async function handleEvaluate(
  rawBody: unknown,
  ip = "unknown",
): Promise<ApiResponse<DecisionResult>> {
  // 1. Validate request
  const parsed = EvaluationRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "invalid_input",
        message: parsed.error.issues[0]?.message ?? "Invalid request.",
      },
    };
  }
  const req = parsed.data;

  // Mock mode — bypasses Anthropic entirely when USE_MOCK_EVALUATIONS != "false"
  const isMockMode = process.env.USE_MOCK_EVALUATIONS !== "false"
  if (isMockMode) {
    return { ok: true, data: resolveMockResult(req.mode, req.idea) };
  }

  // 2. Rate limit
  const rateLimitError = checkRateLimit(ip);
  if (rateLimitError) {
    return {
      ok: false,
      error: {
        code: "rate_limited",
        message: rateLimitError.message,
        retryAfterMs: rateLimitError.retryAfterMs,
      },
    };
  }

  // 3. Cache lookup
  const cached = getCached(req.mode, req.idea);
  if (cached) return { ok: true, data: cached };

  // 4. Load prompt
  const { systemPrompt, promptVersion } = loadPrompt(req.mode);

  // 5. Call AI provider
  // ─────────────────────────────────────────────────────────────────────────
  // USE_COMPANY_GATEWAY=true  → company gateway  /v1/chat/completions
  //                             (OpenAI-compatible format, system in messages)
  // USE_COMPANY_GATEWAY=false → direct Anthropic  /v1/messages
  //                             (native format, system as top-level field)
  // No SDK: plain fetch so the request shape is explicit and auditable.
  // ─────────────────────────────────────────────────────────────────────────
  const startMs = Date.now();
  const useGateway = process.env.USE_COMPANY_GATEWAY === "true";
  const modelId = process.env.ANTHROPIC_MODEL ??
    (useGateway ? "claude-quality" : "claude-3-haiku-20240307");

  // Mode label used in the user turn so the model never has to infer it.
  const modeLabel: Record<IdeaMode, string> = {
    feature: "feature idea",
    change: "product change",
    concept: "concept",
  };

  const userMessage =
    `Mode: ${req.mode}\n\n` +
    `Evaluate this ${modeLabel[req.mode]} using the Ship or Skip framework. ` +
    `Score it against every dimension in the rubric. ` +
    `Output only valid JSON matching the schema.\n\n` +
    `Idea:\n${req.idea}`;

  // ── Provider-specific endpoint, headers, and body ────────────────────────
  //
  // Anthropic path: endpoint is ALWAYS https://api.anthropic.com/v1/messages.
  // ANTHROPIC_BASE_URL is intentionally NOT used here — stale env vars from
  // a previous gateway setup would silently redirect to the wrong host.
  //
  const apiEndpoint = useGateway
    ? `${process.env.COMPANY_GATEWAY_URL ?? ""}/v1/chat/completions`
    : "https://api.anthropic.com/v1/messages";

  const requestHeaders: Record<string, string> = useGateway
    ? {
        "content-type": "application/json",
        "x-api-key": process.env.COMPANY_GATEWAY_KEY ?? "",
      }
    : {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      };

  // Gateway: system as role:"system" message (OpenAI format)
  // Anthropic: system is a top-level field; messages array is user-only
  const requestPayload = useGateway
    ? {
        model: modelId,
        max_tokens: 4096,
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user"   as const, content: userMessage  },
        ],
      }
    : {
        model: modelId,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user" as const, content: userMessage }],
      };

  // ── Diagnostic: full request details ─────────────────────────────────────
  console.log("[evaluate] ── REQUEST ──────────────────────────────────────");
  console.log("[evaluate] provider        :", useGateway ? "company-gateway" : "anthropic-direct");
  console.log("[evaluate] endpoint        :", apiEndpoint);
  console.log("[evaluate] model           :", modelId);
  console.log("[evaluate] max_tokens      :", 4096);
  console.log("[evaluate] prompt version  :", promptVersion);

  // Log headers — show keys and redacted values so secrets are never logged
  console.log("[evaluate] ── REQUEST HEADERS ─────────────────────────────");
  for (const [k, v] of Object.entries(requestHeaders)) {
    const display = k === "x-api-key"
      ? (v.length > 8 ? `${v.slice(0, 6)}…${v.slice(-4)} (len=${v.length})` : v.length > 0 ? "SET" : "MISSING")
      : v;
    console.log(`[evaluate]   ${k.padEnd(20)} : ${display}`);
  }
  console.log("[evaluate] ── OUTBOUND PAYLOAD ────────────────────────────");
  // Log structure without system/user prompt content (can be very long)
  const payloadSummary = {
    ...requestPayload,
    ...(("system" in requestPayload) ? { system: `[${(requestPayload as { system: string }).system.length} chars]` } : {}),
    messages: requestPayload.messages.map((m) => ({
      role: m.role,
      content: typeof m.content === "string"
        ? `[${m.content.length} chars]`
        : m.content,
    })),
  };
  console.log(JSON.stringify(payloadSummary, null, 2));
  console.log("[evaluate] ── END OUTBOUND PAYLOAD ────────────────────────");

  let toolInput: unknown;
  try {
    const httpResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestPayload),
    });

    const rawBody = await httpResponse.text();

    // ── Diagnostic: raw response payload ─────────────────────────────────
    console.log("[evaluate] ── RAW RESPONSE PAYLOAD ────────────────────────");
    console.log(rawBody);
    console.log("[evaluate] ── END RAW RESPONSE PAYLOAD ────────────────────");
    console.log("[evaluate] HTTP status   :", httpResponse.status, httpResponse.statusText);

    if (!httpResponse.ok) {
      process.stderr.write("[evaluate] ✗ API HTTP error\n");
      process.stderr.write("[evaluate]   status : " + httpResponse.status + "\n");
      process.stderr.write("[evaluate]   body   : " + rawBody.slice(0, 400) + "\n");
      return {
        ok: false,
        error: {
          code: "upstream_error",
          message: `API returned ${httpResponse.status}: ${rawBody.slice(0, 200)}`,
        },
      };
    }

    // ── Parse response — OpenAI-compatible (gateway) vs Anthropic native ──
    type GatewayResp  = { choices?: Array<{ message?: { content?: string }; finish_reason?: string }> };
    type AnthropicResp = { content?: Array<{ type: string; text?: string }>; stop_reason?: string };
    let responseData: GatewayResp | AnthropicResp;
    try {
      responseData = JSON.parse(rawBody) as GatewayResp | AnthropicResp;
    } catch {
      process.stderr.write("[evaluate] ✗ API response is not valid JSON\n");
      return {
        ok: false,
        error: { code: "upstream_error", message: "API returned non-JSON response." },
      };
    }

    const rawText = useGateway
      ? ((responseData as GatewayResp).choices?.[0]?.message?.content ?? "")
      : ((responseData as AnthropicResp).content?.[0]?.text ?? "");
    const finishReason = useGateway
      ? ((responseData as GatewayResp).choices?.[0]?.finish_reason ?? "unknown")
      : ((responseData as AnthropicResp).stop_reason ?? "unknown");

    console.log("[evaluate] finish_reason  :", finishReason);
    console.log("[evaluate] raw text length:", rawText.length);

    if (!rawText) {
      process.stderr.write("[evaluate] ✗ No text content in API response\n");
      process.stderr.write("[evaluate]   responseData: " + JSON.stringify(responseData) + "\n");
      return {
        ok: false,
        error: { code: "schema_violation", message: "Model returned no text content." },
      };
    }

    console.log("[evaluate] ── RAW MODEL OUTPUT (FULL) ──────────────────────────");
    console.log(rawText);
    console.log("[evaluate] ── END RAW MODEL OUTPUT ────────────────────────────");

    // ── JSON extraction ────────────────────────────────────────────────────
    toolInput = extractJSON(rawText);
    if (toolInput === null) {
      process.stderr.write("[evaluate] ✗ JSON extraction failed\n");
      process.stderr.write("[evaluate]   raw (full): " + rawText + "\n");
      return {
        ok: false,
        error: { code: "schema_violation", message: "Model did not return parseable JSON." },
      };
    }
    console.log("[evaluate] ✓ JSON extracted, keys:", Object.keys(toolInput as Record<string, unknown>).join(", "));
  } catch (err) {
    console.error("[evaluate] Fetch error:", err);
    const msg = err instanceof Error ? err.message : "Unknown network error.";
    return { ok: false, error: { code: "network_error", message: msg } };
  }

  // 5b. Sanitize prose fields before validation
  // ─────────────────────────────────────────────────────────────────────────
  // Collapses whitespace and truncates any prose string that exceeds its
  // schema max. Enums, IDs, scores, and structural fields pass through
  // unchanged so Zod can still catch structural violations.
  // ─────────────────────────────────────────────────────────────────────────
  console.log("[evaluate] ── SANITIZING OUTPUT ─────────────────────────────");
  toolInput = sanitizeToolOutput(toolInput);
  console.log("[evaluate] ✓ Sanitization complete");

  const latencyMs = Date.now() - startMs;

  // 6. Validate tool output
  console.log("[evaluate] ── ZOD VALIDATION ──────────────────────────────────");
  // ── PRE-VALIDATION FIELD AUDIT ─────────────────────────────────────────────
  // Logs the exact values the model returned for every top-level field so the
  // root cause of any Zod failure is visible without reading a dense JSON dump.
  {
    const t = toolInput as Record<string, unknown>;
    const sc = t["scorecard"] as Record<string, unknown> | null | undefined;
    const dims = Array.isArray(sc?.["dimensions"]) ? (sc!["dimensions"] as unknown[]) : null;
    const dimIds = dims?.map((d) => (d as Record<string, unknown>)["id"]).join(", ") ?? "MISSING";
    process.stderr.write("\n[evaluate] ── PRE-VALIDATION FIELD AUDIT ───────────────────\n");
    process.stderr.write("[evaluate]   top-level keys     : " + JSON.stringify(Object.keys(t)) + "\n");
    process.stderr.write("[evaluate]   mode               : " + JSON.stringify(t["mode"]) + "\n");
    process.stderr.write("[evaluate]   typeof mode        : " + typeof t["mode"] + "\n");
    process.stderr.write("[evaluate]   summary (80)       : " + JSON.stringify(String(t["summary"] ?? "").slice(0, 80)) + "\n");
    process.stderr.write("[evaluate]   scorecard keys     : " + JSON.stringify(Object.keys(sc ?? {})) + "\n");
    process.stderr.write("[evaluate]   dimension count    : " + (dims?.length ?? "MISSING") + "\n");
    process.stderr.write("[evaluate]   dimension ids      : " + dimIds + "\n");
    process.stderr.write("[evaluate]   risks count        : " + (Array.isArray(t["risks"]) ? (t["risks"] as unknown[]).length : "MISSING/wrong-type") + "\n");
    process.stderr.write("[evaluate]   missingValidation  : " + (Array.isArray(t["missingValidation"]) ? (t["missingValidation"] as unknown[]).length : "MISSING/wrong-type") + "\n");
    process.stderr.write("[evaluate]   refineRec type     : " + (t["refineRecommendation"] === null ? "null" : typeof t["refineRecommendation"]) + "\n");
    process.stderr.write("[evaluate] ─────────────────────────────────────────────────────\n\n");
  }
  const validated = ToolOutputSchema.safeParse(toolInput);
  if (!validated.success) {
    // schema_violation #2 — tool input present but Zod rejects its shape
    process.stderr.write("[evaluate] ✗ SCHEMA_VIOLATION #2 — Zod validation failed\n");
    // Log each Zod issue with its path AND the actual value at that path
    const getValueAtPath = (obj: unknown, path: (string | number)[]): unknown => {
      let cur: unknown = obj;
      for (const key of path) {
        if (cur == null || typeof cur !== "object") return undefined;
        cur = (cur as Record<string | number, unknown>)[key];
      }
      return cur;
    };
    validated.error.issues.forEach((issue, i) => {
      const val = getValueAtPath(toolInput, issue.path as (string | number)[]);
      const valStr = typeof val === "string"
        ? `"${val.slice(0, 300)}"${val.length > 300 ? `… (+${val.length - 300} chars, total=${val.length})` : ` (length=${val.length})`}`
        : JSON.stringify(val)?.slice(0, 200);
      // For parent-context: one level up
      const parentPath = (issue.path as (string | number)[]).slice(0, -1);
      const parentVal = getValueAtPath(toolInput, parentPath);
      process.stderr.write(`\n[evaluate]   ── issue[${i}] ─────────────────────────────────────\n`);
      process.stderr.write(`[evaluate]     path    : ${JSON.stringify(issue.path)}\n`);
      process.stderr.write(`[evaluate]     code    : ${issue.code}\n`);
      process.stderr.write(`[evaluate]     message : ${issue.message}\n`);
      process.stderr.write(`[evaluate]     value   : ${valStr}\n`);
      if (parentPath.length > 0) {
        process.stderr.write(`[evaluate]     parent  : ${JSON.stringify(parentVal)?.slice(0, 400)}\n`);
      }
    });
    process.stderr.write("\n[evaluate]   toolInput (full):\n" + JSON.stringify(toolInput, null, 2) + "\n");
    return {
      ok: false,
      error: {
        code: "schema_violation",
        message: `Model output failed validation: ${validated.error.issues[0]?.message ?? "unknown"}`,
      },
    };
  }
  console.log("[evaluate] ✓ Zod validation passed");

  // 7. Tone lint
  console.log("[evaluate] ── TONE LINT ─────────────────────────────────────────");
  if (!passesToneLint(validated.data)) {
    // schema_violation #3 — banned phrase in output
    process.stderr.write("[evaluate] ✗ SCHEMA_VIOLATION #3 — tone lint failed\n");
    process.stderr.write("[evaluate]   summary: " + validated.data.summary + "\n");
    return {
      ok: false,
      error: {
        code: "schema_violation",
        message: "Model output contained disallowed language.",
      },
    };
  }
  console.log("[evaluate] ✓ Tone lint passed");

  // 8. Assemble DecisionResult with all server-computed fields
  const result = assembleResult(validated.data, latencyMs, promptVersion);

  // 9. Cache and return
  setCached(req.mode, req.idea, result);
  return { ok: true, data: result };
}

// ---------------------------------------------------------------------------
// Vercel serverless handler (Node.js runtime)
// ---------------------------------------------------------------------------

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string")
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.socket?.remoteAddress ?? "unknown";
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405);
    res.end(
      JSON.stringify({
        error: { code: "internal", message: "Method not allowed." },
      }),
    );
    return;
  }

  let body: unknown;
  try {
    body = await readBody(req);
  } catch {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        error: { code: "invalid_input", message: "Invalid request body." },
      }),
    );
    return;
  }

  const ip = getClientIp(req);
  const result = await handleEvaluate(body, ip);

  if (result.ok) {
    res.writeHead(200);
    res.end(JSON.stringify(result.data));
  } else {
    const err = result.error;
    const status =
      err.code === "invalid_input"
        ? 400
        : err.code === "rate_limited"
          ? 429
          : err.code === "upstream_error"
            ? 502
            : 500;
    res.writeHead(status);
    res.end(JSON.stringify({ error: err }));
  }
}
