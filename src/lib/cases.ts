/**
 * The read layer for a case. Pages call this; only Server Actions write.
 */

import { query, one } from './db';
import type { Lang } from './adapters/types';

export type CaseView = {
  id: string;
  ref: string;
  subject: string | null;
  narrative: string;
  narrativeLang: Lang;
  status: string;
  rawStatus: string;
  department: string | null;
  office: string | null;
  officeId: string | null;
  filedAt: string;
  slaDueAt: string | null;
  closedAt: string | null;
  filedByRelation: string | null;
  /**
   * The hand-written correct forum for this case, seeded per case, in the citizen's own
   * language. Null where we do not know it — and then the page shows nothing, because a
   * generic next step is the same harm as a wrong one.
   */
  nextStep: { heading: string; body: string } | null;
  /** Our translations of the next step, language code to [heading, body]. */
  nextStepTranslations: Record<string, string[]>;
  /**
   * Advisory only. A date the department stated, before which an appeal is likely to be
   * dismissed as premature. It never removes the citizen's ability to appeal.
   */
  appealNotAdvisedBefore: string | null;
  citizen: { id: string; name: string; lang: Lang };
  reply: { id: string; body: string; lang: Lang; receivedAt: string } | null;
  audit: {
    id: string;
    verdict: string;
    confidence: number;
    reasoning: string;
    /** Our translations of `reasoning`, language code to parts. A cache, never evidence. */
    reasoningTranslations: Record<string, string[]>;
    /** Our translations of `unaddressed`, language code to the same bullets in order. */
    unaddressedTranslations: Record<string, string[]>;
    citations: { quote: string }[];
    unaddressed: string[];
    citationsVerified: boolean;
    model: string;
    promptVersion: string;
  } | null;
  confirmation: { resolved: boolean; answeredAt: string } | null;
  appeal: { id: string; status: string; bodyFormal: string; bodyCitizenLang: string; grounds: string[] } | null;
  cluster: { id: string; label: string; members: number; saidNotFixed: number; neverAsked: number } | null;
};

const RAW_STATUS: Record<string, string> = {
  closed: 'Disposed',
  appeal_closed: 'Disposed',
  replied: 'Closed with remarks',
  appealed: 'Appeal under process',
  under_process: 'Under Process',
};

export async function getCase(idOrRef: string): Promise<CaseView | null> {
  const g = await one<Record<string, string | null>>(
    `select g.id, g.external_ref, g.subject, g.narrative_original, g.original_lang, g.status,
            g.filed_at, g.sla_due_at, g.closed_at, g.filed_by_relation, g.office_id,
            g.next_step_heading, g.next_step_body, g.next_step_translations,
            g.appeal_not_advised_before,
            c.id as citizen_id, c.display_name, c.preferred_lang,
            o.name as office, d.short_name as department
       from grievances g
       join citizens c on c.id = g.citizen_id
       left join offices o on o.id = g.office_id
       left join departments d on d.id = g.department_id
      where g.id::text = $1 or upper(g.external_ref) = upper($1)
      limit 1`,
    [idOrRef.trim()],
  );
  if (!g) return null;

  const reply = await one<Record<string, string>>(
    `select id, body, body_lang, received_at from replies
      where grievance_id = $1 order by received_at desc limit 1`,
    [g.id],
  );

  const audit = reply
    ? await one<Record<string, unknown>>(
        `select id, verdict, confidence, reasoning, reasoning_translations, citations, unaddressed,
                unaddressed_translations, citations_verified, model, prompt_version
           from audits where grievance_id = $1 order by created_at desc limit 1`,
        [g.id],
      )
    : null;

  const confirmation = await one<{ resolved: boolean; answered_at: string }>(
    `select resolved, answered_at from confirmations
      where grievance_id = $1 and supersedes_id is null limit 1`,
    [g.id],
  );

  const appeal = await one<Record<string, unknown>>(
    `select id, status, body_formal, body_citizen_lang, grounds
       from appeals where grievance_id = $1 order by created_at desc, id desc limit 1`,
    [g.id],
  );

  // Counts only. Never who.
  // Counted in three states, never two: a closure nobody answered about is not a closure the
  // citizen said was unfixed, and rolling one into the other would build an accusation out of
  // silence. See the same split on /cluster/[id].
  const cluster = await one<{ id: string; label: string; members: string; said_not_fixed: string; never_asked: string }>(
    `select cl.id, cl.label,
            (select count(*) from cluster_members m where m.cluster_id = cl.id) as members,
            (select count(*) from cluster_members m
               join grievances g2 on g2.id = m.grievance_id
               left join confirmations cf on cf.grievance_id = g2.id and cf.supersedes_id is null
              where m.cluster_id = cl.id
                and g2.status in ('closed','appeal_closed')
                and cf.resolved is false) as said_not_fixed,
            (select count(*) from cluster_members m
               join grievances g2 on g2.id = m.grievance_id
               left join confirmations cf on cf.grievance_id = g2.id and cf.supersedes_id is null
              where m.cluster_id = cl.id
                and g2.status in ('closed','appeal_closed')
                and cf.id is null) as never_asked
       from clusters cl
       join cluster_members m on m.cluster_id = cl.id
      where m.grievance_id = $1 and cl.is_public
      limit 1`,
    [g.id],
  );

  return {
    id: g.id!,
    ref: g.external_ref!,
    subject: g.subject,
    narrative: g.narrative_original!,
    narrativeLang: g.original_lang as Lang,
    status: g.status!,
    rawStatus: RAW_STATUS[g.status!] ?? 'Under Process',
    department: g.department,
    office: g.office,
    officeId: g.office_id,
    filedAt: g.filed_at!,
    slaDueAt: g.sla_due_at,
    closedAt: g.closed_at,
    filedByRelation: g.filed_by_relation,
    nextStep:
      g.next_step_heading && g.next_step_body
        ? { heading: g.next_step_heading, body: g.next_step_body }
        : null,
    nextStepTranslations: (g.next_step_translations as unknown as Record<string, string[]>) ?? {},
    appealNotAdvisedBefore: g.appeal_not_advised_before,
    citizen: { id: g.citizen_id!, name: g.display_name!, lang: g.preferred_lang as Lang },
    reply: reply
      ? { id: reply.id, body: reply.body, lang: reply.body_lang as Lang, receivedAt: reply.received_at }
      : null,
    audit: audit
      ? {
          id: audit.id as string,
          verdict: audit.verdict as string,
          confidence: Number(audit.confidence),
          reasoning: audit.reasoning as string,
          reasoningTranslations: (audit.reasoning_translations as Record<string, string[]>) ?? {},
          unaddressedTranslations: (audit.unaddressed_translations as Record<string, string[]>) ?? {},
          citations: (audit.citations as { quote: string }[]) ?? [],
          unaddressed: (audit.unaddressed as string[]) ?? [],
          citationsVerified: Boolean(audit.citations_verified),
          model: audit.model as string,
          promptVersion: audit.prompt_version as string,
        }
      : null,
    confirmation: confirmation
      ? { resolved: confirmation.resolved, answeredAt: confirmation.answered_at }
      : null,
    appeal: appeal
      ? {
          id: appeal.id as string,
          status: appeal.status as string,
          bodyFormal: appeal.body_formal as string,
          bodyCitizenLang: appeal.body_citizen_lang as string,
          grounds: (appeal.grounds as string[]) ?? [],
        }
      : null,
    cluster: cluster
      ? {
          id: cluster.id,
          label: cluster.label,
          members: Number(cluster.members),
          saidNotFixed: Number(cluster.said_not_fixed),
          neverAsked: Number(cluster.never_asked),
        }
      : null,
  };
}

export type TimelineEntry = {
  seq: number;
  type: string;
  occurredAt: string;
  recordedAt: string;
  payload: Record<string, unknown>;
};

export async function getTimeline(grievanceId: string): Promise<TimelineEntry[]> {
  const rows = await query<{ seq: string; type: string; occurred_at: string; payload: Record<string, unknown> }>(
    `select seq, type,
            to_char(occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as occurred_at,
            payload
       from events where grievance_id = $1 order by seq`,
    [grievanceId],
  );
  return rows.map((r) => ({
    seq: Number(r.seq),
    type: r.type,
    // `occurred_at` is when we wrote the entry down; a payload `at` is when the thing itself
    // happened. For seeded history those differ, and the citizen wants the second one.
    occurredAt: typeof r.payload?.at === 'string' ? (r.payload.at as string) : r.occurred_at,
    recordedAt: r.occurred_at,
    payload: r.payload,
  }));
}

/** Days remaining, in whole days. Plain numbers; the UI says them in words. */
export function daysUntil(iso: string | null, from = new Date()): number | null {
  if (!iso) return null;
  return Math.ceil((Date.parse(iso) - from.getTime()) / 86_400_000);
}
