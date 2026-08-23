/**
 * Seed. Deterministic: same RNG seed in, same database out, so the numbers on /numbers do not
 * move between runs and a screenshot taken today still matches the site tomorrow.
 *
 *   pnpm seed
 *
 * Everything here is synthetic. No real identifier appears anywhere, phones are in the
 * reserved +91 90000 0xxxx range and are stored only as a hash, references carry a DEMO/
 * prefix, and no official is named.
 *
 * The three demo cases get full ledger histories, because a reviewer will open their receipts.
 * The ~2,800-case background corpus does not: it exists to make /numbers real, it is only ever
 * read as counts, and 22,000 serialised ledger appends would cost minutes for nothing anyone
 * can see. That distinction is disclosed on /how-this-works.
 */

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { pool, transaction, appendEvent } from '../../src/lib/db';
import { DEMO_CASES } from './demo-cases';

// ---------------------------------------------------------------- deterministic randomness

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260828);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
const chance = (p: number) => rand() < p;

const phoneHash = (phone: string) =>
  createHash('sha256').update(phone + (process.env.LEDGER_PEPPER ?? 'demo-pepper')).digest('hex');

// ---------------------------------------------------------------- reference data

const DEPARTMENTS = [
  { short: 'DoPPW', name: 'Department of Pension & Pensioners’ Welfare', path: ['Pension'] },
  { short: 'EPFO', name: 'Employees’ Provident Fund Organisation', path: ['Labour', 'Provident Fund'] },
  { short: 'MoRTH', name: 'Ministry of Road Transport & Highways', path: ['Infrastructure', 'Roads'] },
  { short: 'DoFS', name: 'Department of Financial Services', path: ['Finance', 'Banking'] },
  { short: 'MoHFW', name: 'Ministry of Health & Family Welfare', path: ['Health'] },
  { short: 'DoCA', name: 'Department of Consumer Affairs', path: ['Consumer'] },
  { short: 'MoRD', name: 'Ministry of Rural Development', path: ['Rural', 'Employment'] },
  { short: 'CBDT', name: 'Central Board of Direct Taxes', path: ['Finance', 'Income Tax'] },
] as const;

const OFFICES = [
  { dept: 'DoPPW', name: 'Treasury Office, Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', lat: 26.1209, lon: 85.3647 },
  { dept: 'DoPPW', name: 'Treasury Office, Patna', state: 'Bihar', district: 'Patna', lat: 25.5941, lon: 85.1376 },
  { dept: 'DoPPW', name: 'CPAO, New Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.6139, lon: 77.209 },
  { dept: 'EPFO', name: 'EPFO Regional Office, Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.385, lon: 78.4867 },
  { dept: 'EPFO', name: 'EPFO Regional Office, Bandra', state: 'Maharashtra', district: 'Mumbai', lat: 19.0596, lon: 72.8295 },
  { dept: 'EPFO', name: 'EPFO Sub-Regional Office, Kolkata', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { dept: 'MoRTH', name: 'PWD Sub-Division, Pune (Rural)', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lon: 73.8567 },
  { dept: 'MoRTH', name: 'NHAI Project Office, Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { dept: 'DoFS', name: 'Lead Bank Office, Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { dept: 'DoFS', name: 'Lead Bank Office, Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { dept: 'MoHFW', name: 'District Hospital, Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { dept: 'MoHFW', name: 'CMO Office, Guwahati', state: 'Assam', district: 'Kamrup', lat: 26.1445, lon: 91.7362 },
  { dept: 'DoCA', name: 'Consumer Helpline Cell, Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { dept: 'DoCA', name: 'Consumer Helpline Cell, Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { dept: 'MoRD', name: 'Block Development Office, Ranchi', state: 'Jharkhand', district: 'Ranchi', lat: 23.3441, lon: 85.3096 },
  { dept: 'MoRD', name: 'Block Development Office, Balasore', state: 'Odisha', district: 'Balasore', lat: 21.4934, lon: 86.9335 },
  { dept: 'CBDT', name: 'CPC Bengaluru', state: 'Karnataka', district: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { dept: 'CBDT', name: 'Assessing Officer Ward 3, Indore', state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lon: 75.8577 },
  { dept: 'EPFO', name: 'EPFO Regional Office, Chandigarh', state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { dept: 'DoPPW', name: 'Treasury Office, Dehradun', state: 'Uttarakhand', district: 'Dehradun', lat: 30.3165, lon: 78.0322 },
] as const;

/** Background-corpus replies, drawn from the documented closure patterns. Counts only. */
const BULK_REPLIES = {
  deflected: [
    'The matter has been forwarded to the concerned department. The grievance is closed at this level.',
    'The subject matter does not pertain to this office. You may approach the State Government.',
    'Transferred to the concerned subordinate organisation. Case disposed.',
  ],
  boilerplate: [
    'Noted for future action. The grievance is disposed.',
    'Appropriate action is being taken in the matter. Grievance closed.',
    'Your grievance has been examined and closed.',
  ],
  non_responsive: [
    'It is informed that the applicable rules in this regard are available on the departmental website. The grievance is closed.',
    'The claim was processed as per the extant provisions. Grievance disposed.',
  ],
  partial: [
    'The delay is regretted. The matter regarding the remaining amount is under examination. Grievance closed.',
  ],
  resolved: [
    'The pending amount was credited on 12.07.2026 through the treasury. Arrears for two months are included.',
    'The defect was rectified on 03.08.2026 and the connection restored the same day.',
  ],
} as const;

const NARRATIVES = [
  'Payment has not been received for several months and no reason was given.',
  'My claim was rejected and I was not told why.',
  'The work promised in my locality has not started.',
  'I have submitted documents twice and there is still no response.',
  'The amount credited is less than what was sanctioned.',
] as const;

const LANGS = ['hi', 'en', 'mr', 'bn', 'ta', 'te'] as const;

// ---------------------------------------------------------------- seed

async function main() {
  const precomputed = JSON.parse(readFileSync('evals/fixtures/precomputed-audits.json', 'utf8')) as Record<
    string,
    { result: { verdict: string; confidence: number; reasoning: string; citations: { quote: string }[]; unaddressed: string[]; injection_suspected: boolean }; citationsVerified: boolean; model: string; promptVersion: string }
  >;

  await wipe();
  const deptIds = await seedDepartments();
  const officeIds = await seedOffices(deptIds);
  await seedDemoCases(deptIds, officeIds, precomputed);
  await seedBackgroundCorpus(officeIds);
  await seedClusters(officeIds);
  await report();
  await pool().end();
}

async function wipe() {
  // The ledger is append-only by rule, so a reseed truncates it explicitly rather than
  // pretending a delete would work. Only ever run against the demo database.
  const c = await pool().connect();
  try {
    await c.query(`truncate cluster_members, clusters, attachments, appeals, confirmations,
                            audits, replies, grievances, citizens, offices, departments restart identity cascade`);
    await c.query('truncate events restart identity');
    console.log('wiped');
  } finally {
    c.release();
  }
}

async function seedDepartments(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const d of DEPARTMENTS) {
    const { rows } = await pool().query(
      `insert into departments (name, short_name, category_path, sla_days, appeal_sla_days)
       values ($1,$2,$3,21,30) returning id`,
      [d.name, d.short, d.path],
    );
    ids.set(d.short, rows[0].id);
  }
  console.log(`departments: ${ids.size}`);
  return ids;
}

async function seedOffices(deptIds: Map<string, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const o of OFFICES) {
    const { rows } = await pool().query(
      `insert into offices (department_id, name, state, district, lat, lon)
       values ($1,$2,$3,$4,$5,$6) returning id`,
      [deptIds.get(o.dept), o.name, o.state, o.district, o.lat, o.lon],
    );
    ids.set(o.name, rows[0].id);
  }
  console.log(`offices: ${ids.size}`);
  return ids;
}

async function seedDemoCases(
  deptIds: Map<string, string>,
  officeIds: Map<string, string>,
  precomputed: Awaited<ReturnType<typeof JSON.parse>>,
) {
  for (const c of DEMO_CASES) {
    await transaction(async (client) => {
      const citizen = await client.query(
        `insert into citizens (phone_hash, display_name, preferred_lang, prefers_audio, is_demo)
         values ($1,$2,$3,$4,true) returning id`,
        [phoneHash(c.citizen.phone), c.citizen.name, c.citizen.lang, c.citizen.prefersAudio],
      );
      const citizenId = citizen.rows[0].id as string;

      let filedById: string | null = null;
      if (c.filedBy) {
        const helper = await client.query(
          `insert into citizens (phone_hash, display_name, preferred_lang, prefers_audio, is_demo)
           values ($1,$2,$3,true,true) returning id`,
          [phoneHash(c.filedBy.phone), c.filedBy.name, c.filedBy.lang],
        );
        filedById = helper.rows[0].id as string;
      }

      const officeId = officeIds.get(c.office)!;
      const deptId = deptIds.get(c.department)!;
      const slaDue = new Date(Date.parse(c.filedAt) + 21 * 86400_000).toISOString();

      const g = await client.query(
        `insert into grievances (citizen_id, filed_by_citizen_id, filed_by_relation, consent_recorded,
                                 external_ref, source_system, imported, department_id, office_id,
                                 original_lang, narrative_original, subject, status,
                                 filed_at, sla_due_at, closed_at)
         values ($1,$2,$3,true,$4,'mock_cpgrams',true,$5,$6,$7,$8,$9,'closed',$10,$11,$12)
         returning id`,
        [citizenId, filedById, c.filedBy?.relation ?? null, c.ref, deptId, officeId,
         c.narrativeLang, c.narrative, c.subject, c.filedAt, slaDue, c.closedAt],
      );
      const gid = g.rows[0].id as string;

      // The ledger history a reviewer will download as a receipt.
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'grievance_filed',
        payload: { ref: c.ref, subject: c.subject, office: c.office, lang: c.narrativeLang } });
      if (c.filedBy) {
        await appendEvent(client, { grievanceId: gid, citizenId, type: 'assisted_filing_declared',
          payload: { relation: c.filedBy.relation, consent_obtained: 'in_person' } });
      }
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'acknowledged',
        payload: { office: c.office } });
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'assigned',
        payload: { office: c.office } });

      const r = await client.query(
        `insert into replies (grievance_id, body, body_lang, is_final, received_at)
         values ($1,$2,$3,true,$4) returning id`,
        [gid, c.reply.body, c.reply.lang, c.closedAt],
      );
      const replyId = r.rows[0].id as string;

      await appendEvent(client, { grievanceId: gid, citizenId, type: 'reply_received',
        payload: { reply_len: c.reply.body.length, lang: c.reply.lang } });
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'closed',
        payload: { raw_status: c.rawStatus, closed_at: c.closedAt } });

      const pre = precomputed[c.ref];
      if (pre) {
        await client.query(
          `insert into audits (grievance_id, reply_id, verdict, confidence, reasoning, citations,
                               unaddressed, citations_verified, injection_suspected, model, prompt_version)
           values ($1,$2,$3::audit_verdict,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10,$11)`,
          [gid, replyId, pre.result.verdict, pre.result.confidence, pre.result.reasoning,
           JSON.stringify(pre.result.citations), JSON.stringify(pre.result.unaddressed),
           pre.citationsVerified, pre.result.injection_suspected, pre.model, pre.promptVersion],
        );
        await appendEvent(client, { grievanceId: gid, citizenId, type: 'audit_completed',
          payload: { verdict: pre.result.verdict, citations: pre.result.citations.length,
                     model: pre.model, prompt_version: pre.promptVersion } });
      }

      console.log(`demo case: ${c.ref} (${c.citizen.name})`);
    });
  }
}

/**
 * The background corpus. Sized so the headline lands where the real published figures put it:
 * disposal in the nineties, true resolution in the forties, and a gap between how many
 * closures happen and how many citizens are ever asked about them.
 */
async function seedBackgroundCorpus(officeIds: Map<string, string>) {
  const offices = [...officeIds.values()];
  const TOTAL = 2800;
  let n = 0;

  type Draft = {
    id: string; officeId: string; closed: boolean;
    verdict: keyof typeof BULK_REPLIES | null; asked: boolean; resolved: boolean;
    filedAt: Date; closedAt: Date | null; replyId: string; body: string;
  };
  const drafts: Draft[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const closed = chance(0.94);
    const filedAt = new Date(Date.parse('2026-05-01T00:00:00Z') + Math.floor(rand() * 100) * 86400_000);

    // Verdict mix reflects the documented pathology: most closures are not answers.
    let verdict: keyof typeof BULK_REPLIES | null = null;
    if (closed) {
      const roll = rand();
      verdict = roll < 0.3 ? 'deflected' : roll < 0.56 ? 'boilerplate' : roll < 0.72 ? 'non_responsive' : roll < 0.82 ? 'partial' : 'resolved';
    }

    // Sunvai asks everyone; ~15% never answer. The gap is real and we show it.
    const asked = closed && chance(0.85);
    // The metric: whether the problem actually got fixed, by their answer, not our verdict.
    const resolved = asked && chance(verdict === 'resolved' ? 0.78 : verdict === 'partial' ? 0.42 : 0.28);
    const closedAt = closed ? new Date(filedAt.getTime() + (5 + Math.floor(rand() * 25)) * 86400_000) : null;

    drafts.push({
      id: randomUUID(),
      replyId: randomUUID(),
      officeId: pick(offices),
      body: verdict ? pick(BULK_REPLIES[verdict]) : '',
      closed, verdict, asked, resolved, filedAt, closedAt,
    });
  }

  // One round trip per table, not per row. The database is in Singapore and this machine is
  // not; 2,800 sequential inserts is half an hour of latency for rows nobody reads singly.
  await transaction(async (client) => {
    const citizen = await client.query(
      `insert into citizens (phone_hash, display_name, preferred_lang, is_demo)
       values ($1,'Synthetic corpus','hi',true) returning id`,
      [phoneHash('+91 90000 00000')],
    );
    const corpusCitizen = citizen.rows[0].id as string;

    await client.query(
      `insert into grievances (id, citizen_id, external_ref, source_system, imported, office_id,
                               department_id, original_lang, narrative_original, subject, status,
                               filed_at, sla_due_at, closed_at)
       select u.id, $1, u.ref, 'mock_cpgrams', true, u.office_id,
              o.department_id, u.lang, u.narrative, 'Synthetic background case', u.status,
              u.filed_at, u.filed_at + interval '21 days', u.closed_at
         from unnest($2::uuid[], $3::text[], $4::uuid[], $5::text[], $6::text[], $7::text[],
                     $8::timestamptz[], $9::timestamptz[])
              as u(id, ref, office_id, lang, narrative, status, filed_at, closed_at)
         join offices o on o.id = u.office_id`,
      [
        corpusCitizen,
        drafts.map((d) => d.id),
        drafts.map(() => `DEMO/2026/${String(1000 + n++).padStart(7, '0')}`),
        drafts.map((d) => d.officeId),
        drafts.map(() => pick(LANGS)),
        drafts.map(() => pick(NARRATIVES)),
        drafts.map((d) => (d.closed ? 'closed' : 'replied')),
        drafts.map((d) => d.filedAt.toISOString()),
        drafts.map((d) => d.closedAt?.toISOString() ?? null),
      ],
    );

    const closedDrafts = drafts.filter((d) => d.closed && d.verdict);
    await client.query(
      `insert into replies (id, grievance_id, body, body_lang, is_final, received_at)
       select * from unnest($1::uuid[], $2::uuid[], $3::text[], array_fill('en'::text, array[$4::int]),
                            array_fill(true, array[$4::int]), $5::timestamptz[])`,
      [
        closedDrafts.map((d) => d.replyId),
        closedDrafts.map((d) => d.id),
        closedDrafts.map((d) => d.body),
        closedDrafts.length,
        closedDrafts.map((d) => d.closedAt!.toISOString()),
      ],
    );

    await client.query(
      `insert into audits (grievance_id, reply_id, verdict, confidence, reasoning, citations,
                           unaddressed, citations_verified, model, prompt_version)
       select u.gid, u.rid, u.verdict::audit_verdict, u.confidence,
              'Background corpus case: verdict assigned by the seed, not by a model run.',
              u.citations::jsonb, '[]'::jsonb, true, 'seed', 'seed'
         from unnest($1::uuid[], $2::uuid[], $3::text[], $4::numeric[], $5::text[])
              as u(gid, rid, verdict, confidence, citations)`,
      [
        closedDrafts.map((d) => d.id),
        closedDrafts.map((d) => d.replyId),
        closedDrafts.map((d) => d.verdict),
        closedDrafts.map(() => (0.7 + rand() * 0.25).toFixed(2)),
        closedDrafts.map((d) => JSON.stringify([{ quote: d.body.slice(0, 40) }])),
      ],
    );

    const asked = drafts.filter((d) => d.asked && d.closedAt);
    await client.query(
      `insert into confirmations (grievance_id, citizen_id, resolved, asked_via, asked_at, answered_at)
       select u.gid, $1, u.resolved, 'web', u.asked_at, u.asked_at + interval '1 day'
         from unnest($2::uuid[], $3::boolean[], $4::timestamptz[]) as u(gid, resolved, asked_at)`,
      [
        corpusCitizen,
        asked.map((d) => d.id),
        asked.map((d) => d.resolved),
        asked.map((d) => d.closedAt!.toISOString()),
      ],
    );
  });

  console.log(`background corpus: ${drafts.length}`);
}

/**
 * Clusters. Membership is derived, so the seed writes members and then applies the same public
 * visibility gate the recompute job applies: >=5 members, >=5 distinct citizens, spread over
 * more than 48 hours. Three clusters pass it. Three do not, and stay private.
 */
async function seedClusters(officeIds: Map<string, string>) {
  const treasury = officeIds.get('Treasury Office, Muzaffarpur')!;

  const specs = [
    { label: 'Pension disbursement stoppage · Muzaffarpur · May–Aug 2026', office: treasury, size: 46, public: true },
    { label: 'PF claim rejection without stated reason · Hyderabad · Jun–Aug 2026', office: officeIds.get('EPFO Regional Office, Hyderabad')!, size: 31, public: true },
    { label: 'Monsoon road damage unrepaired · Pune Rural · Jul–Aug 2026', office: officeIds.get('PWD Sub-Division, Pune (Rural)')!, size: 18, public: true },
    { label: 'Delayed scheme payments · Ranchi · Aug 2026', office: officeIds.get('Block Development Office, Ranchi')!, size: 4, public: false },
    { label: 'Refund not credited · CPC Bengaluru · Aug 2026', office: officeIds.get('CPC Bengaluru')!, size: 3, public: false },
    { label: 'Hospital billing dispute · Bhopal · Aug 2026', office: officeIds.get('District Hospital, Bhopal')!, size: 4, public: false },
  ];

  for (const s of specs) {
    const { rows } = await pool().query(
      `insert into clusters (label, office_id, first_seen_at, last_seen_at, is_public)
       values ($1,$2,'2026-05-14T00:00:00Z','2026-08-20T00:00:00Z',$3) returning id`,
      [s.label, s.office, s.public],
    );
    const clusterId = rows[0].id as string;

    const members = await pool().query(
      `select id from grievances where office_id = $1 order by filed_at limit $2`,
      [s.office, s.size],
    );
    for (const m of members.rows) {
      await pool().query(
        `insert into cluster_members (cluster_id, grievance_id, similarity)
         values ($1,$2,$3) on conflict do nothing`,
        [clusterId, m.id, (0.82 + rand() * 0.15).toFixed(3)],
      );
    }
  }
  console.log(`clusters: ${specs.length} (${specs.filter((s) => s.public).length} public)`);
}

async function report() {
  const { rows } = await pool().query('select * from headline_numbers');
  const err = await pool().query('select * from our_error_rate');
  console.log('\nheadline:', rows[0]);
  console.log('our error rate:', err.rows[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
