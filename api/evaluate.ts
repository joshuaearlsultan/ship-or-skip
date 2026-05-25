import Anthropic from "@anthropic-ai/sdk";
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
  SUBMIT_DECISION_TOOL,
  ToolOutputSchema,
  type ToolOutput,
} from "./schema";
import { RUBRICS } from "./rubrics";
import { loadPrompt } from "./prompts";
import { resolveMockResult } from "../src/data/examples";

// ---------------------------------------------------------------------------
// Anthropic client (lazy — fails at request time if key is missing, not import)
// ---------------------------------------------------------------------------

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    console.log("ANTHROPIC_API_KEY exists:", !!process.env.ANTHROPIC_API_KEY);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new HandlerError(
        "internal",
        "ANTHROPIC_API_KEY is not configured.",
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

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
      model: "claude-opus-4-7",
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
  if (process.env.USE_MOCK_EVALUATIONS !== "false") {
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

  // 5. Call Claude
  const client = getClient();
  const startMs = Date.now();

  let toolInput: unknown;
  try {
    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: req.idea,
        },
      ],
      tools: [SUBMIT_DECISION_TOOL],
      tool_choice: { type: "tool", name: "submit_decision" },
    });

    const toolUseBlock = message.content.find((b) => b.type === "tool_use");
    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      return {
        ok: false,
        error: {
          code: "schema_violation",
          message: "Model did not call the required tool.",
        },
      };
    }
    toolInput = toolUseBlock.input;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream API error.";
    return { ok: false, error: { code: "upstream_error", message } };
  }

  const latencyMs = Date.now() - startMs;

  // 6. Validate tool output
  const validated = ToolOutputSchema.safeParse(toolInput);
  if (!validated.success) {
    return {
      ok: false,
      error: {
        code: "schema_violation",
        message: `Model output failed validation: ${validated.error.issues[0]?.message ?? "unknown"}`,
      },
    };
  }

  // 7. Tone lint
  if (!passesToneLint(validated.data)) {
    return {
      ok: false,
      error: {
        code: "schema_violation",
        message: "Model output contained disallowed language.",
      },
    };
  }

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
