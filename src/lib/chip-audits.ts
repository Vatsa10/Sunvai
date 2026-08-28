/**
 * The committed audits for the six example chips.
 *
 * `evals/fixtures/chip-audits.json` is written by `scripts/precompute-chip-audits.ts`, which
 * runs the real auditor over the six fixed chip pairs. This module reads it and hands back a
 * result only when the submitted text is one of those pairs exactly — see `matchExample`.
 *
 * Imported rather than read off disk, unlike `fixture-cases.ts`, so the bundler carries it into
 * the deployed output. A chip that fell back to the live path because a JSON file did not get
 * copied would be a ten-second wait nobody could reproduce locally.
 *
 * If a chip has no entry — the fixture was never built, or a chip was added without re-running
 * the script — this returns null and the caller runs the model. Silence is never a verdict.
 */

import fixture from '../../evals/fixtures/chip-audits.json';
import type { AuditResult } from './agents/schemas';

type ChipAudit = {
  complaint: string;
  reply: string;
  computedAt: string;
  result: AuditResult;
  spans: { quote: string; start: number; end: number }[];
  citationsVerified: boolean;
  guardFailures: number;
  model: string;
  promptVersion: string;
};

const audits = fixture as unknown as Record<string, ChipAudit | undefined>;

export function chipAudit(id: string): ChipAudit | null {
  return audits[id] ?? null;
}

/** For `scripts/check-journey.ts`: which chips actually have a committed audit. */
export function chipAuditIds(): string[] {
  return Object.keys(audits);
}
