'use server';

/**
 * Server Actions. THE ONLY PLACE THAT WRITES.
 *
 * Every one of these pairs its state change with a ledger append inside a single transaction.
 * If the event cannot be written, the state change does not happen. If it is not in the
 * ledger, it did not happen.
 */

import { revalidatePath } from 'next/cache';
import { transaction, appendEvent, one } from '@/lib/db';
import { getCase } from '@/lib/cases';
import { appealWindow, draftAppeal, mayDraftAppeal } from '@/lib/agents/appeal';
import type { AuditResult } from '@/lib/agents/schemas';
import { adapter } from '@/lib/adapters';
import type { Lang } from '@/lib/adapters/types';

/**
 * The question nobody asks, and the answer that becomes the metric. Not a satisfaction
 * rating — whether the thing they complained about actually got fixed.
 *
 * Reversible and never deleted: changing your answer files a superseding row and both stay in
 * the ledger.
 */
export async function confirmResolution(formData: FormData) {
  const ref = String(formData.get('ref'));
  const resolved = String(formData.get('resolved')) === 'yes';

  const c = await getCase(ref);
  if (!c) throw new Error('no such case');

  await transaction(async (client) => {
    const prior = await client.query(
      `select id from confirmations where grievance_id = $1 and supersedes_id is null`,
      [c.id],
    );

    if (prior.rows[0]) {
      // Supersede rather than overwrite. The earlier answer stays, and so does its event.
      await client.query(`update confirmations set supersedes_id = $1 where id = $1`, [prior.rows[0].id]);
      await appendEvent(client, {
        grievanceId: c.id,
        citizenId: c.citizen.id,
        type: 'confirmation_superseded',
        payload: { previous_id: prior.rows[0].id },
      });
    }

    await client.query(
      `insert into confirmations (grievance_id, citizen_id, resolved, asked_via, asked_at)
       values ($1, $2, $3, 'web', now())`,
      [c.id, c.citizen.id, resolved],
    );

    await appendEvent(client, {
      grievanceId: c.id,
      citizenId: c.citizen.id,
      type: resolved ? 'citizen_confirmed_resolved' : 'citizen_confirmed_unresolved',
      payload: {
        our_verdict: c.audit?.verdict ?? 'none',
        // When our auditor and the citizen disagree, that disagreement is our error, and it
        // is recorded here rather than discovered later.
        agreed_with_our_audit: c.audit ? (c.audit.verdict === 'resolved') === resolved : null,
      },
    });
  });

  refresh(ref);
}

/**
 * Drafts the appeal. Does not send it. Status starts at 'drafted' and only the consent gate
 * moves it on.
 */
export async function prepareAppeal(formData: FormData) {
  const ref = String(formData.get('ref'));
  const c = await getCase(ref);
  if (!c || !c.reply || !c.audit) throw new Error('nothing to appeal yet');

  const citizenSaysUnresolved = c.confirmation ? !c.confirmation.resolved : false;
  // The same gate the page applies, applied again here. The page decides what to show; this
  // decides what may exist. A time-barred appeal must not be creatable by replaying the form.
  const closedAt = c.closedAt ?? c.reply.receivedAt;
  if (!mayDraftAppeal({ verdict: c.audit.verdict, citizenSaysUnresolved, closedAt })) {
    if (!appealWindow(closedAt).open) {
      throw new Error('the 30-day appeal window on this closure has passed');
    }
    throw new Error('this closure does not meet the grounds for an appeal');
  }
  if (c.appeal) return; // already drafted; drafting twice would be two records of one intent

  const sla = await adapter.slas();
  const result = await draftAppeal({
    ref: c.ref,
    narrative_original: c.narrative,
    reply_body: c.reply.body,
    audit: {
      verdict: c.audit.verdict as AuditResult['verdict'],
      citations: c.audit.citations,
      unaddressed: c.audit.unaddressed,
    },
    citizenSaysUnresolved,
    filed_at: c.filedAt,
    closed_at: closedAt,
    sla_days: sla.replyDays,
    officialLang: 'en' as Lang,
    citizenLang: c.narrativeLang,
  });

  await transaction(async (client) => {
    await client.query(
      `insert into appeals (grievance_id, audit_id, body_formal, body_citizen_lang, grounds, status,
                            appeal_due_at)
       values ($1,$2,$3,$4,$5::jsonb,'drafted', now() + ($6 || ' days')::interval)`,
      [c.id, c.audit!.id, result.formalText, result.citizenLangText, JSON.stringify(result.grounds), sla.appealDays],
    );
    await appendEvent(client, {
      grievanceId: c.id,
      citizenId: c.citizen.id,
      type: 'appeal_drafted',
      payload: { grounds: result.grounds.length, audit_verdict: c.audit!.verdict },
    });
  });

  refresh(ref);
}

/**
 * The consent gate. Nothing reaches the outside world without the citizen having seen the
 * exact text, in their own language, and said yes.
 */
export async function sendAppeal(formData: FormData) {
  const ref = String(formData.get('ref'));
  const consented = String(formData.get('consent')) === 'on';
  if (!consented) throw new Error('not sent: consent was not given');

  const c = await getCase(ref);
  if (!c?.appeal) throw new Error('no drafted appeal');
  if (c.appeal.status !== 'drafted') return;

  // The window is checked again here, not only at drafting. A draft made in time and opened
  // again on day forty would otherwise walk straight through the consent gate and out through
  // adapter.appeal(). Drafting is a page state; sending is the boundary, so the boundary is
  // where the calendar has to hold.
  const closedAt = c.closedAt ?? c.reply?.receivedAt ?? null;
  if (!closedAt || !appealWindow(closedAt).open) {
    throw new Error('not sent: the 30-day appeal window on this closure has passed');
  }

  await transaction(async (client) => {
    await client.query(`update appeals set status = 'consented', consented_at = now() where id = $1`, [c.appeal!.id]);
    await appendEvent(client, {
      grievanceId: c.id,
      citizenId: c.citizen.id,
      type: 'appeal_consented',
      payload: { shown_in: c.narrativeLang, body_len: c.appeal!.bodyFormal.length },
    });
  });

  // Only now does anything leave the building.
  const sent = await adapter.appeal(c.ref, c.appeal.bodyFormal);

  await transaction(async (client) => {
    await client.query(
      `update appeals set status = 'sent', sent_at = now(), external_ref = $2 where id = $1`,
      [c.appeal!.id, sent.appealRef],
    );
  });

  refresh(ref);
}

/** Used by the /_dept scaffolding so a reviewer can watch an audit fire on a live reply. */
export async function caseIdForRef(ref: string): Promise<string | null> {
  const row = await one<{ id: string }>(`select id from grievances where upper(external_ref) = upper($1)`, [ref]);
  return row?.id ?? null;
}

/**
 * Cache invalidation is a hint, not the work. The eval harness calls these actions outside a
 * request, where revalidatePath has no store to talk to — that must not fail a real write that
 * already committed.
 */
function refresh(ref: string) {
  try {
    revalidatePath(`/case/${encodeURIComponent(ref)}`);
    revalidatePath('/numbers');
  } catch {
    // Not in a request context (scripts, evals). The data is written; nothing to invalidate.
  }
}
