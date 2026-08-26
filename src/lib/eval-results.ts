/**
 * The one place a measured number about our own accuracy may come from.
 *
 * `evals/results.json` is written by `pnpm eval:auditor` — 74 hand-labelled closure replies,
 * labelled before the prompt was tuned against them, scored by real model calls. Every figure
 * the site publishes about how often the auditor is right is read from this file, so the page
 * and the eval can never drift apart and no one can retype a stale percentage from memory.
 *
 * If the file is absent, this returns null and the caller renders nothing. There is
 * deliberately no fallback: a placeholder number on a page about measurement integrity is the
 * exact failure this file exists to prevent.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type EvalResults = {
  generated_at: string;
  cases: number;
  adversarial: number;
  falseAccusation: number;
  negativeRecall: number;
  citationGuard: number;
  adversarialCatch: number;
  undeterminedUse: number;
  exactMatch: number;
  gatesFailed: number;
  lawfulMisjudged?: number;
  nearMissHeld?: number;
  nearMissLeaked?: number;
  plainLawfulHeld?: number;
};

let cache: EvalResults | null | undefined;

export function evalResults(): EvalResults | null {
  if (cache !== undefined) return cache;
  try {
    const raw = readFileSync(join(process.cwd(), 'evals', 'results.json'), 'utf8');
    const parsed = JSON.parse(raw) as EvalResults;
    // A file that exists but does not carry a case count is not a measurement either.
    cache = typeof parsed?.cases === 'number' && parsed.cases > 0 ? parsed : null;
  } catch {
    cache = null;
  }
  return cache;
}

/** Percentages are formatted in exactly one place, so the site is consistent to the decimal. */
export const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
