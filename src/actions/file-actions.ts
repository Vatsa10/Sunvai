'use server';

/**
 * Door B: filing a new grievance. Writes happen here and nowhere else.
 */

import { createHash } from 'node:crypto';
import { transaction, appendEvent, one } from '@/lib/db';
import { intake, type Turn } from '@/lib/agents/intake';
import { route, needsCitizenChoice } from '@/lib/agents/router';
import { draft, checkNumbersInSource } from '@/lib/agents/drafter';
import { adapter } from '@/lib/adapters';
import type { IntakeFacts } from '@/lib/agents/schemas';
import type { Lang } from '@/lib/adapters/types';

export type IntakeStep = {
  narrative: string;
  facts: IntakeFacts;
  nextQuestion: string | null;
  readyToRoute: boolean;
};

export async function advanceIntake(args: {
  transcript: string;
  lang: Lang;
  turns: Turn[];
}): Promise<IntakeStep> {
  const r = await intake(args);
  return {
    narrative: r.narrative,
    facts: r.facts,
    nextQuestion: r.nextQuestion,
    readyToRoute: r.readyToRoute,
  };
}

export type RoutedDraft = {
  departmentId: string;
  departmentName: string;
  officeId: string | null;
  officeName: string | null;
  reasoning: string;
  confidence: number;
  jurisdictionNote?: string;
  alternatives: { departmentId: string; departmentName: string; officeId: string | null; officeName: string | null; why: string }[];
  needsChoice: boolean;
  formalText: string;
  citizenLangText: string;
  subject: string;
};

/** Route, then draft. The citizen sees both the reasoning and the exact text before anything moves. */
export async function routeAndDraft(args: {
  narrative: string;
  facts: IntakeFacts;
  lang: Lang;
  forceDepartmentId?: string;
  forceOfficeId?: string | null;
}): Promise<RoutedDraft> {
  const taxonomy = await adapter.taxonomy();

  const routed = await route({
    narrative: args.narrative,
    facts: args.facts,
    taxonomy,
    lang: args.lang,
  });

  // "That's not right" — the citizen's choice overrides the model's, always.
  const departmentId = args.forceDepartmentId ?? routed.departmentId;
  const officeId = args.forceDepartmentId ? (args.forceOfficeId ?? null) : routed.officeId;

  const dept = taxonomy.find((d) => d.id === departmentId)!;
  const office = dept.offices.find((o) => o.id === officeId) ?? null;

  const drafted = await draft({
    narrative: args.narrative,
    facts: args.facts,
    departmentName: dept.name,
    officeName: office?.name ?? null,
    officialLang: 'en',
    citizenLang: args.lang,
  });

  // Blocks the gate. Does not warn.
  // Subject as well as body: the subject line is the first thing an officer reads, and an
  // invented claim number is no less invented for being in the heading.
  const numbers = checkNumbersInSource([drafted.subject, drafted.formalText].join(' '), {
    narrative: args.narrative,
    facts: args.facts,
  });
  if (!numbers.ok) {
    throw new Error(
      `We will not send this: the draft contains ${numbers.invented.join(', ')}, which you did not tell us. ` +
        `Say it again and we will rewrite it.`,
    );
  }

  return {
    departmentId,
    departmentName: dept.name,
    officeId: office?.id ?? null,
    officeName: office?.name ?? null,
    reasoning: routed.reasoning,
    confidence: routed.confidence,
    jurisdictionNote: routed.jurisdiction_note,
    alternatives: routed.alternatives.map((a) => {
      const d = taxonomy.find((x) => x.id === a.departmentId);
      const o = d?.offices.find((x) => x.id === a.officeId) ?? null;
      return {
        departmentId: a.departmentId,
        departmentName: d?.name ?? a.departmentId,
        officeId: o?.id ?? null,
        officeName: o?.name ?? null,
        why: a.why,
      };
    }),
    needsChoice: needsCitizenChoice(routed) && !args.forceDepartmentId,
    ...drafted,
  };
}

/**
 * The consent gate for Door B. Reached only after the citizen has seen the exact text, in both
 * languages, and ticked the box.
 */
export async function fileGrievance(args: {
  narrative: string;
  lang: Lang;
  name: string;
  departmentId: string;
  officeId: string | null;
  formalText: string;
  citizenLangText: string;
  subject: string;
  consented: boolean;
  routerReasoning: string;
  routerOverridden: boolean;
}): Promise<{ ref: string }> {
  if (!args.consented) throw new Error('not filed: consent was not given');

  const filed = await adapter.file({
    formalText: args.formalText,
    subject: args.subject,
    departmentId: args.departmentId,
    officeId: args.officeId,
    citizenName: args.name || 'Anonymous',
    citizenLang: args.lang,
  });

  const sla = await adapter.slas();

  await transaction(async (client) => {
    // No plaintext phone is stored anywhere, and Door B does not ask for one at all.
    const phoneHash = createHash('sha256')
      .update(`${filed.ref}${process.env.LEDGER_PEPPER ?? 'demo-pepper'}`)
      .digest('hex');

    const citizen = await client.query(
      `insert into citizens (phone_hash, display_name, preferred_lang, prefers_audio, is_demo)
       values ($1, $2, $3, true, true) returning id`,
      [phoneHash, args.name || 'Anonymous', args.lang],
    );
    const citizenId = citizen.rows[0].id as string;

    const g = await client.query(
      `insert into grievances (citizen_id, consent_recorded, external_ref, source_system, imported,
                               department_id, office_id, original_lang, narrative_original,
                               narrative_formal, subject, status, filed_at, sla_due_at)
       values ($1, true, $2, $3, false, $4, $5, $6, $7, $8, $9, 'filed', now(),
               now() + ($10 || ' days')::interval)
       returning id`,
      [citizenId, filed.ref, adapter.id, args.departmentId, args.officeId, args.lang, args.narrative,
       args.formalText, args.subject, sla.replyDays],
    );
    const gid = g.rows[0].id as string;

    await appendEvent(client, {
      grievanceId: gid,
      citizenId,
      type: 'grievance_drafted',
      payload: { subject: args.subject, lang: args.lang, router_reasoning: args.routerReasoning },
    });

    if (args.routerOverridden) {
      // The citizen disagreeing with our routing is a fact about our routing, and it is recorded.
      await appendEvent(client, {
        grievanceId: gid,
        citizenId,
        type: 'routing_overridden_by_citizen',
        payload: { chosen_department: args.departmentId, chosen_office: args.officeId },
      });
    }

    await appendEvent(client, {
      grievanceId: gid,
      citizenId,
      type: 'consent_recorded',
      payload: { shown_in: args.lang, shown_official_text: true, body_len: args.formalText.length },
    });

    await appendEvent(client, {
      grievanceId: gid,
      citizenId,
      type: 'grievance_filed',
      payload: { ref: filed.ref, system: adapter.id, sla_days: sla.replyDays },
    });
  });

  return { ref: filed.ref };
}

export async function departmentOptions() {
  const taxonomy = await adapter.taxonomy();
  return taxonomy.map((d) => ({
    id: d.id,
    name: d.name,
    shortName: d.shortName,
    offices: d.offices.map((o) => ({ id: o.id, name: o.name, state: o.state })),
  }));
}

export async function refExists(ref: string): Promise<boolean> {
  const row = await one(`select 1 as x from grievances where upper(external_ref) = upper($1)`, [ref]);
  return Boolean(row);
}
