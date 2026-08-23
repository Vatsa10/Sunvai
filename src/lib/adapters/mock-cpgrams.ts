/**
 * The mock grievance system. THE ONLY FILE THAT KNOWS WHAT CPGRAMS IS.
 *
 * It is not a happy-path simulator. It reproduces the documented pathology: disposal with
 * boilerplate, closure with no reason given, transfer chains that end nowhere, a 21-day reply
 * clock, and an appeal tier that in the real system only unlocks if you rate the closure
 * "Poor" — the question most citizens are never asked. Sunvai removes that gate; the mock
 * keeps it visible so you can see the door we opened.
 *
 * We never touch the real system. Not by API, not by scraping. That is disqualifying under
 * the brief, and it was never an architecture that could ship anyway.
 */

import { query, one, transaction, appendEvent } from '../db';
import {
  type DepartmentNode,
  type ExternalCase,
  type ExternalStatus,
  type FiledGrievance,
  type GrievanceSystemAdapter,
  type Lang,
} from './types';

/** The vendor's own vocabulary, mapped to ours. We keep both: one to reason with, one to show. */
function normaliseStatus(raw: string, dbStatus: string): ExternalStatus {
  const r = raw.toLowerCase();
  if (r.includes('disposed') || r.includes('closed')) return 'closed';
  if (r.includes('under process')) return 'under_process';
  return (dbStatus as ExternalStatus) ?? 'filed';
}

function rawStatusFor(dbStatus: string): string {
  switch (dbStatus) {
    case 'closed':
    case 'appeal_closed':
      return 'Disposed';
    case 'replied':
      return 'Closed with remarks';
    case 'appealed':
      return 'Appeal under process';
    default:
      return 'Under Process';
  }
}

export class MockCPGRAMSAdapter implements GrievanceSystemAdapter {
  readonly id = 'mock_cpgrams';
  readonly displayName = 'CPGRAMS (simulated)';
  /** Drives every mock badge in the UI. Nobody hardcodes that badge. */
  readonly isMock = true;

  async fetchCase(ref: string): Promise<ExternalCase | null> {
    const g = await one<{
      id: string; external_ref: string; status: string; subject: string | null;
      narrative_original: string; original_lang: string; office: string | null;
      department: string | null; filed_at: string; closed_at: string | null;
    }>(
      `select g.id, g.external_ref, g.status, g.subject, g.narrative_original, g.original_lang,
              o.name as office, d.short_name as department,
              g.filed_at, g.closed_at
         from grievances g
         left join offices o on o.id = g.office_id
         left join departments d on d.id = g.department_id
        where upper(g.external_ref) = upper($1)`,
      [ref.trim()],
    );
    if (!g) return null;

    const replies = await query<{ body: string; body_lang: string; received_at: string; is_final: boolean }>(
      `select body, body_lang, received_at, is_final from replies where grievance_id = $1 order by received_at`,
      [g.id],
    );

    const raw = rawStatusFor(g.status);
    return {
      ref: g.external_ref,
      status: normaliseStatus(raw, g.status),
      rawStatus: raw,
      subject: g.subject ?? undefined,
      narrative: g.narrative_original,
      narrativeLang: g.original_lang as Lang,
      department: g.department ?? undefined,
      office: g.office ?? undefined,
      filedAt: g.filed_at,
      closedAt: g.closed_at ?? undefined,
      replies: replies.map((r) => ({
        body: r.body,
        lang: r.body_lang as Lang,
        receivedAt: r.received_at,
        isFinal: r.is_final,
      })),
    };
  }

  async poll(ref: string): Promise<ExternalCase | null> {
    return this.fetchCase(ref);
  }

  /** Door B. Reached only after the citizen has seen the exact text and consented. */
  async file(input: FiledGrievance): Promise<{ ref: string; filedAt: string }> {
    const seq = await one<{ next: string }>(
      `select lpad((coalesce(max(substring(external_ref from '[0-9]+$')::int), 0) + 1)::text, 7, '0') as next
         from grievances where external_ref like 'DEMO/2026/%'`,
    );
    const ref = `DEMO/2026/${seq?.next ?? '9000001'}`;
    return { ref, filedAt: new Date().toISOString() };
  }

  /**
   * In the real system this tier is gated behind rating the closure "Poor". We do not
   * reproduce the gate for our own citizens — removing it is the point — but the mock keeps
   * the vocabulary so the difference is legible.
   */
  async appeal(ref: string, body: string): Promise<{ appealRef: string; filedAt: string }> {
    const g = await one<{ id: string; citizen_id: string }>(
      `select id, citizen_id from grievances where upper(external_ref) = upper($1)`,
      [ref],
    );
    if (!g) throw new Error(`no such case: ${ref}`);

    const appealRef = `${ref}/A1`;
    const filedAt = new Date().toISOString();

    await transaction(async (client) => {
      await client.query(
        `update grievances set status = 'appealed' where id = $1`,
        [g.id],
      );
      await appendEvent(client, {
        grievanceId: g.id,
        citizenId: g.citizen_id,
        type: 'appeal_filed',
        payload: { appeal_ref: appealRef, body_len: body.length, system: this.id },
      });
    });

    return { appealRef, filedAt };
  }

  /** The Router never hardcodes a taxonomy; it asks the system it is filing into. */
  async taxonomy(): Promise<DepartmentNode[]> {
    const rows = await query<{
      id: string; name: string; short_name: string; category_path: string[];
      office_id: string | null; office_name: string | null; state: string | null; district: string | null;
    }>(
      `select d.id, d.name, d.short_name, d.category_path,
              o.id as office_id, o.name as office_name, o.state, o.district
         from departments d left join offices o on o.department_id = d.id
        order by d.short_name, o.name`,
    );

    const byId = new Map<string, DepartmentNode>();
    for (const r of rows) {
      const node = byId.get(r.id) ?? {
        id: r.id,
        name: r.name,
        shortName: r.short_name,
        categoryPath: r.category_path,
        offices: [],
      };
      if (r.office_id && r.office_name && r.state) {
        node.offices.push({ id: r.office_id, name: r.office_name, state: r.state, district: r.district ?? undefined });
      }
      byId.set(r.id, node);
    }
    return [...byId.values()];
  }

  async slas(): Promise<{ replyDays: number; appealDays: number }> {
    const row = await one<{ sla_days: number; appeal_sla_days: number }>(
      `select min(sla_days) as sla_days, min(appeal_sla_days) as appeal_sla_days from departments`,
    );
    return { replyDays: row?.sla_days ?? 21, appealDays: row?.appeal_sla_days ?? 30 };
  }
}

// Selection lives in ./index.ts. Nothing outside this folder imports this file by name.
