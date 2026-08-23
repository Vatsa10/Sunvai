/**
 * The one place that talks to OpenAI. Model tiers named here so no call site picks a model.
 */

import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ZodSchema } from 'zod';

// Overridable by env so a model swap never needs a code change (and so the eval harness can
// pin a cheaper tier without editing agents).
export const MODELS = {
  reasoning: process.env.MODEL_REASONING ?? 'gpt-5',        // closure audit, appeals
  fast: process.env.MODEL_FAST ?? 'gpt-5-mini',             // routing, drafting, clustering
  conversational: process.env.MODEL_CONVERSATIONAL ?? 'gpt-5-mini',
  vision: process.env.MODEL_VISION ?? 'gpt-5-mini',
  embedding: process.env.MODEL_EMBEDDING ?? 'text-embedding-3-small',
  transcribe: process.env.MODEL_TRANSCRIBE ?? 'gpt-4o-transcribe',
  tts: process.env.MODEL_TTS ?? 'gpt-4o-mini-tts',
} as const;

let client: OpenAI | null = null;

export function openai(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new MissingKeyError();
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export class MissingKeyError extends Error {
  constructor() {
    super('OPENAI_API_KEY is not set');
    this.name = 'MissingKeyError';
  }
}

export function hasKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

const promptCache = new Map<string, string>();

/** Prompts are versioned files, and the version is written to every row they produce. */
export function loadPrompt(name: string): string {
  const cached = promptCache.get(name);
  if (cached) return cached;
  const text = readFileSync(join(process.cwd(), 'src/lib/agents/prompts', `${name}.md`), 'utf8');
  promptCache.set(name, text);
  return text;
}

/**
 * One call, JSON out, schema-validated. On a schema violation we retry exactly once with the
 * error fed back, then fail loudly — a malformed agent result is never silently repaired.
 */
export async function structuredCall<T>({
  model,
  system,
  user,
  schema,
  temperature = 0,
}: {
  model: string;
  system: string;
  user: string;
  schema: ZodSchema<T>;
  temperature?: number;
}): Promise<T> {
  let lastError = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages = [
      { role: 'system' as const, content: system },
      { role: 'user' as const, content: attempt === 0 ? user : `${user}\n\nYour previous reply was rejected: ${lastError}\nReturn valid JSON matching the contract.` },
    ];

    const completion = await openai().chat.completions.create({
      model,
      // Reasoning models reject any temperature but the default; every other agent here
      // wants 0. Sending it conditionally keeps both true without a per-agent special case.
      ...(supportsTemperature(model) ? { temperature } : {}),
      response_format: { type: 'json_object' },
      messages,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = schema.safeParse(safeJson(raw));
    if (parsed.success) return parsed.data;
    lastError = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  }

  throw new Error(`agent output failed its contract twice: ${lastError}`);
}

function supportsTemperature(model: string): boolean {
  return !/^(gpt-5|o[134])/.test(model);
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
