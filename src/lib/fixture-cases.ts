/**
 * The committed copy of the three demo cases, for when the database is not there.
 *
 * The database this runs on pauses when it is idle, and the first click a reviewer makes is
 * exactly the click that wakes it. Rather than hand them a stack trace, the pages fall back to
 * this: the same three cases, built from files that are checked into the repository —
 * `supabase/seed/demo-cases.ts` for the citizen's words and the department's reply, and
 * `evals/fixtures/precomputed-audits.json` for the verdict that a real model run produced
 * against that exact text.
 *
 * Two rules hold this honest:
 *   1. Every page that renders from here says so, in a banner, before anything else.
 *   2. Nothing here is invented. There is no fixture for a case that is not one of the three,
 *      and no fixture verdict that did not come out of a recorded model run.
 *
 * What is genuinely lost is the ledger: the timeline below is derived from the seed's own
 * dates, and it is labelled as such rather than presented as recorded events. Writes — the
 * "did it work?" answer, the appeal — are refused while we are in this state, because there is
 * nowhere to write them.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEMO_CASES, type DemoCase } from '../../supabase/seed/demo-cases';
import type { CaseView, TimelineEntry } from './cases';
import type { Lang } from './adapters/types';

type PrecomputedAudit = {
  result: {
    verdict: string;
    confidence: number;
    reasoning: string;
    citations: { quote: string }[];
    unaddressed: string[];
  };
  citationsVerified: boolean;
  model: string;
  promptVersion: string;
};

let auditCache: Record<string, PrecomputedAudit> | null | undefined;

function precomputed(): Record<string, PrecomputedAudit> | null {
  if (auditCache !== undefined) return auditCache;
  try {
    const raw = readFileSync(join(process.cwd(), 'evals', 'fixtures', 'precomputed-audits.json'), 'utf8');
    auditCache = JSON.parse(raw) as Record<string, PrecomputedAudit>;
  } catch {
    // No fixture file, no fixture verdict. The page shows the reply and no audit rather than
    // a verdict we made up on the spot.
    auditCache = null;
  }
  return auditCache;
}

const RAW_TO_STATUS: Record<string, string> = {
  Disposed: 'closed',
  'Closed with remarks': 'replied',
};

function toView(d: DemoCase): CaseView {
  const a = precomputed()?.[d.ref] ?? null;
  return {
    // No database, so no row id. The ref is the stable identity here, and nothing in the
    // fallback path looks a case up by uuid.
    id: d.ref,
    ref: d.ref,
    subject: d.subject,
    narrative: d.narrative,
    narrativeLang: d.narrativeLang,
    status: RAW_TO_STATUS[d.rawStatus] ?? 'closed',
    rawStatus: d.rawStatus,
    department: d.department,
    office: d.office,
    officeId: null,
    filedAt: d.filedAt,
    slaDueAt: null,
    closedAt: d.closedAt,
    filedByRelation: d.filedBy?.relation ?? null,
    nextStep: d.nextStep ?? null,
    // Same reason as the audit translations above: the store is in the database, and the
    // database is what is missing on this path.
    nextStepTranslations: {},
    appealNotAdvisedBefore: d.appealNotAdvisedBefore ?? null,
    citizen: { id: d.ref, name: d.citizen.name, lang: d.citizen.lang as Lang },
    reply: { id: `${d.ref}#reply`, body: d.reply.body, lang: d.reply.lang, receivedAt: d.closedAt },
    audit: a
      ? {
          id: `${d.ref}#audit`,
          verdict: a.result.verdict,
          confidence: a.result.confidence,
          reasoning: a.result.reasoning,
          // No stored translations in the fixture copy: the translations table is in the
          // database, and the database is what is missing when this path runs. The case page
          // falls back to translating at render, which is what it did before that table
          // existed.
          reasoningTranslations: {},
          unaddressedTranslations: {},
          citations: a.result.citations ?? [],
          unaddressed: a.result.unaddressed ?? [],
          citationsVerified: a.citationsVerified,
          model: a.model,
          promptVersion: a.promptVersion,
        }
      : null,
    // Whether the citizen said it was fixed lives in `confirmations`, which is a live table.
    // Without it we say nothing: the resolution figure is never guessed from a verdict.
    confirmation: null,
    appeal: null,
    // Cluster counts are counts of live rows. We do not approximate them.
    cluster: null,
  };
}

export function fixtureCase(idOrRef: string): CaseView | null {
  const needle = idOrRef.trim().toUpperCase();
  const d = DEMO_CASES.find((c) => c.ref.toUpperCase() === needle);
  return d ? toView(d) : null;
}

/**
 * The dates in the seed, shown as a sequence. These are not ledger entries — the ledger is in
 * the database — and the page labels them as the fixture copy along with everything else.
 */
export function fixtureTimeline(ref: string): TimelineEntry[] {
  const d = DEMO_CASES.find((c) => c.ref.toUpperCase() === ref.trim().toUpperCase());
  if (!d) return [];
  const entries: { type: string; at: string }[] = [
    { type: 'grievance_filed', at: d.filedAt },
    ...(d.filedBy ? [{ type: 'assisted_filing_declared', at: d.filedAt }] : []),
    { type: 'reply_received', at: d.closedAt },
    { type: 'closed', at: d.closedAt },
    ...(precomputed()?.[d.ref] ? [{ type: 'audit_completed', at: d.closedAt }] : []),
  ];
  return entries.map((e, i) => ({
    seq: i + 1,
    type: e.type,
    occurredAt: e.at,
    recordedAt: e.at,
    payload: {},
  }));
}
