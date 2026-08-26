'use server';

/**
 * Running the audit for real, on a reply that just arrived.
 *
 * The seeded demo cases carry pre-computed audits so the headline path survives an OpenAI
 * outage during the review window. This is the other path: a reply lands, the auditor reads it
 * live, and a reviewer can watch that happen on text they wrote themselves.
 */

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { transaction, appendEvent, one } from '@/lib/db';
import { audit, type AuditInput } from '@/lib/agents/closure-auditor';
import { adapter } from '@/lib/adapters';
import type { AuditResult, Lang } from '@/lib/agents/schemas';
import { checkRateLimit } from '@/lib/rate-limit';

export type AuditPreview = {
  result: AuditResult;
  spans: { quote: string; start: number; end: number }[];
  citationsVerified: boolean;
  guardFailures: number;
  model: string;
  promptVersion: string;
};

/**
 * Audit arbitrary text, save nothing. This is what makes the demo something other than three
 * cases we chose: paste in a closure reply of your own and watch it get judged, with the quotes
 * checked against your text rather than ours.
 */
export async function auditText(args: {
  complaint: string;
  reply: string;
  lang?: Lang;
  replyLang?: Lang;
}): Promise<AuditPreview> {
  // Who is asking, as well as we can tell behind a proxy. Not identity — a throttling key. It
  // is never stored, never logged, and never written to the ledger.
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    'unknown';
  const gate = checkRateLimit(ip);
  if (!gate.ok) throw new Error(gate.message);

  const complaint = args.complaint.trim();
  const reply = args.reply.trim();

  if (complaint.length < 20) throw new Error('Tell us what was asked for — a sentence or two is enough.');
  if (reply.length < 10) throw new Error('Paste the reply the department sent.');
  // A ceiling, so one paste cannot become an expensive prompt.
  if (complaint.length > 4000 || reply.length > 4000) {
    throw new Error('That is longer than we can read here. Trim it to the relevant part.');
  }

  const sla = await adapter.slas();
  const closedAt = new Date().toISOString();
  const filedAt = new Date(Date.now() - sla.replyDays * 86_400_000).toISOString();

  const input: AuditInput = {
    narrative_original: complaint,
    narrative_lang: args.lang ?? 'en',
    reply_body: reply,
    reply_lang: args.replyLang ?? 'en',
    filed_at: filedAt,
    closed_at: closedAt,
    sla_days: sla.replyDays,
  };

  const outcome = await audit(input);
  return {
    result: outcome.result,
    spans: outcome.spans,
    citationsVerified: outcome.citationsVerified,
    guardFailures: outcome.guardFailures,
    model: outcome.model,
    promptVersion: outcome.promptVersion,
  };
}

/**
 * A department replies and closes the case. Used by the /_dept scaffolding.
 *
 * The reply is stored verbatim, the closure and the audit are both ledger events, and the
 * citizen's case page shows the verdict the moment it lands.
 */
export async function replyAndClose(formData: FormData) {
  const ref = String(formData.get('ref'));
  const body = String(formData.get('body') ?? '').trim();
  if (!body) throw new Error('write a reply first');

  const g = await one<{
    id: string; citizen_id: string; narrative_original: string; original_lang: string;
    filed_at: string; sla_days: number;
  }>(
    `select g.id, g.citizen_id, g.narrative_original, g.original_lang, g.filed_at,
            coalesce(d.sla_days, 21) as sla_days
       from grievances g
       left join departments d on d.id = g.department_id
      where upper(g.external_ref) = upper($1)`,
    [ref],
  );
  if (!g) throw new Error(`no such case: ${ref}`);

  const closedAt = new Date().toISOString();

  const replyId = await transaction(async (client) => {
    const r = await client.query(
      `insert into replies (grievance_id, body, body_lang, is_final, received_at)
       values ($1, $2, 'en', true, now()) returning id`,
      [g.id, body],
    );
    await client.query(`update grievances set status = 'closed', closed_at = now() where id = $1`, [g.id]);

    await appendEvent(client, {
      grievanceId: g.id,
      citizenId: g.citizen_id,
      type: 'reply_received',
      payload: { at: closedAt, reply_len: body.length, lang: 'en' },
    });
    await appendEvent(client, {
      grievanceId: g.id,
      citizenId: g.citizen_id,
      type: 'closed',
      payload: { at: closedAt, raw_status: 'Disposed', closed_at: closedAt },
    });
    return r.rows[0].id as string;
  });

  // The audit runs outside that transaction: a slow or failing model call must not roll back a
  // reply the department has already sent. If it fails, the citizen sees the raw reply and a
  // note that we are still reading it — never a fabricated verdict.
  const outcome = await audit({
    narrative_original: g.narrative_original,
    narrative_lang: g.original_lang as Lang,
    reply_body: body,
    reply_lang: 'en',
    filed_at: g.filed_at,
    closed_at: closedAt,
    sla_days: Number(g.sla_days),
  });

  await transaction(async (client) => {
    await client.query(
      `insert into audits (grievance_id, reply_id, verdict, confidence, reasoning, citations,
                           unaddressed, citations_verified, injection_suspected, model, prompt_version)
       values ($1,$2,$3::audit_verdict,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10,$11)`,
      [g.id, replyId, outcome.result.verdict, outcome.result.confidence, outcome.result.reasoning,
       JSON.stringify(outcome.result.citations), JSON.stringify(outcome.result.unaddressed),
       outcome.citationsVerified, outcome.result.injection_suspected, outcome.model, outcome.promptVersion],
    );

    await appendEvent(client, {
      grievanceId: g.id,
      citizenId: g.citizen_id,
      type: outcome.citationsVerified ? 'audit_completed' : 'audit_withheld',
      payload: {
        at: new Date().toISOString(),
        verdict: outcome.result.verdict,
        citations: outcome.result.citations.length,
        guard_retries: outcome.guardFailures,
        injection_suspected: outcome.result.injection_suspected,
        model: outcome.model,
        prompt_version: outcome.promptVersion,
      },
    });

    if (outcome.guardFailures > 0) {
      // A guard failure is a fact about us, and it belongs in the record whether or not the
      // retry succeeded. It is what the published error rate is built from.
      await appendEvent(client, {
        grievanceId: g.id,
        citizenId: g.citizen_id,
        type: 'citation_guard_failed',
        payload: { at: new Date().toISOString(), retries: outcome.guardFailures },
      });
    }
  });

  try {
    revalidatePath(`/case/${encodeURIComponent(ref)}`);
    revalidatePath('/dept');
  } catch {
    // Called outside a request (scripts). The write is done.
  }
}
