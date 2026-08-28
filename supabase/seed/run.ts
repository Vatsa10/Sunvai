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
import { warmTranslated } from '../../src/lib/translated-text';

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

const plusDays = (iso: string, n: number) =>
  new Date(Date.parse(iso) + n * 86400_000).toISOString();

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
  // Mandated transfers. CPGRAMS is *required* to move State subjects, sub judice matters, RTI
  // matters and service matters to the competent authority; doing so is correct procedure, not
  // evasion, and the corpus has to contain some or /numbers under-represents a verdict the
  // auditor can now return. These name the receiving authority and carry a transfer reference —
  // that is what separates them from the `deflected` texts above.
  transferred_lawfully: [
    'This matter falls within the jurisdiction of the State Government. It has been transferred to the Office of the Collector, DEMO District, under transfer reference DEMO/TR/2026/0041, and that office will reply to you directly.',
    'The subject relates to a service matter of a government servant, which this forum does not adjudicate. The papers have been sent to the Administrative Section of the concerned cadre-controlling authority vide DEMO/TR/2026/0088.',
    'As the request is for information, it has been transferred to the Central Public Information Officer of this Ministry under section 6(3) of the Right to Information Act, 2005, vide DEMO/TR/2026/0113.',
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
  await warmDemoTranslations();
  await report();
  await pool().end();
}

/**
 * Text of ours that a demo case renders in a language it was not written in, translated once,
 * here, and stored beside the row it belongs to.
 *
 * Doing this during a render cost fourteen seconds of blank screen on a cold instance, on the
 * headline case, on a reviewer's first click. Doing it here costs a handful of calls at seed
 * time and the first click is served from the database.
 *
 * Three kinds, and every one of them is text a citizen would carry to a counter: the auditor's
 * reasoning and its "what they did not answer" list, both written in English; and the next
 * step, written in the case's own language, which is the wrong language for anyone reading
 * that case in one of the other two.
 *
 * A demo case is warmed for every shipped language it can actually be read in, not only its
 * own, because the language picker is on every page and a Hindi speaker opening Meera's case
 * is an ordinary thing to do. A failure here is not fatal: the page falls back to the original
 * with an honest label, and fills the gap behind the next render.
 */
async function warmDemoTranslations() {
  const langs = ['hi', 'en', 'mr'] as const;

  for (const c of DEMO_CASES) {
    const row = await pool().query<{
      gid: string;
      aid: string | null;
      reasoning: string | null;
      unaddressed: string[] | null;
    }>(
      `select g.id as gid, a.id as aid, a.reasoning, a.unaddressed
         from grievances g
         left join lateral (
           select id, reasoning, unaddressed from audits
            where grievance_id = g.id order by created_at desc limit 1
         ) a on true
        where g.external_ref = $1`,
      [c.ref],
    );
    const r = row.rows[0];
    if (!r) continue;

    const jobs: { label: string; req: Parameters<typeof warmTranslated>[0] }[] = [];
    for (const to of langs) {
      if (r.aid && r.reasoning) {
        jobs.push({
          label: `${c.ref} reasoning -> ${to}`,
          req: { store: 'auditReasoning', rowId: r.aid, parts: [r.reasoning], stored: {}, from: 'en', to },
        });
        if (r.unaddressed && r.unaddressed.length > 0) {
          jobs.push({
            label: `${c.ref} unaddressed -> ${to}`,
            req: { store: 'auditUnaddressed', rowId: r.aid, parts: r.unaddressed, stored: {}, from: 'en', to },
          });
        }
      }
      if (c.nextStep) {
        jobs.push({
          label: `${c.ref} next step -> ${to}`,
          req: {
            store: 'nextStep',
            rowId: r.gid,
            parts: [c.nextStep.heading, c.nextStep.body],
            stored: {},
            from: c.narrativeLang,
            to,
          },
        });
      }
    }

    // In parallel: these are twenty-odd independent calls and doing them one after another
    // turned a seed into a coffee break. Each one writes to its own key on its own row.
    await Promise.all(
      jobs
        .filter((job) => job.req.to !== job.req.from)
        .map(async (job) => {
          try {
            const done = await warmTranslated(job.req);
            console.log(`warmed: ${job.label} ${done ? 'ok' : '(unchanged, skipped)'}`);
          } catch (e) {
            console.log(`warmed: ${job.label} FAILED (${(e as Error).message})`);
          }
        }),
    );
  }
}

async function wipe() {
  // The ledger is append-only by rule, so a reseed truncates it explicitly rather than
  // pretending a delete would work. Only ever run against the demo database.
  const c = await pool().connect();
  try {
    // Bulk work against a remote database needs longer than the default ceiling.
    await c.query(`set statement_timeout = '300s'`);
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
                                 filed_at, sla_due_at, closed_at,
                                 next_step_heading, next_step_body, appeal_not_advised_before)
         values ($1,$2,$3,true,$4,'mock_cpgrams',true,$5,$6,$7,$8,$9,'closed',$10,$11,$12,$13,$14,$15)
         returning id`,
        [citizenId, filedById, c.filedBy?.relation ?? null, c.ref, deptId, officeId,
         c.narrativeLang, c.narrative, c.subject, c.filedAt, slaDue, c.closedAt,
         c.nextStep?.heading ?? null, c.nextStep?.body ?? null, c.appealNotAdvisedBefore ?? null],
      );
      const gid = g.rows[0].id as string;

      // The ledger history a reviewer will download as a receipt.
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'grievance_filed',
        payload: { at: c.filedAt, ref: c.ref, subject: c.subject, office: c.office, lang: c.narrativeLang } });
      if (c.filedBy) {
        await appendEvent(client, { grievanceId: gid, citizenId, type: 'assisted_filing_declared',
          payload: { at: c.filedAt, relation: c.filedBy.relation, consent_obtained: 'in_person' } });
      }
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'acknowledged',
        payload: { at: plusDays(c.filedAt, 1), office: c.office } });
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'assigned',
        payload: { at: plusDays(c.filedAt, 3), office: c.office } });

      const r = await client.query(
        `insert into replies (grievance_id, body, body_lang, is_final, received_at)
         values ($1,$2,$3,true,$4) returning id`,
        [gid, c.reply.body, c.reply.lang, c.closedAt],
      );
      const replyId = r.rows[0].id as string;

      await appendEvent(client, { grievanceId: gid, citizenId, type: 'reply_received',
        payload: { at: c.closedAt, reply_len: c.reply.body.length, lang: c.reply.lang } });
      await appendEvent(client, { grievanceId: gid, citizenId, type: 'closed',
        payload: { at: c.closedAt, raw_status: c.rawStatus, closed_at: c.closedAt } });

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
const CORPUS_CITIZENS = 420;
const corpusPhone = (i: number) => `+91 90000 0${String(i + 1).padStart(4, '0')}`;

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
      verdict =
        roll < 0.08 ? 'transferred_lawfully'
        : roll < 0.28 ? 'deflected'
        : roll < 0.44 ? 'boilerplate'
        : roll < 0.57 ? 'non_responsive'
        : roll < 0.71 ? 'partial'
        : 'resolved';
    }

    // Sunvai asks everyone; ~15% never answer. The gap is real and we show it.
    const asked = closed && chance(0.85);
    // The metric: whether the problem actually got fixed, by their answer, not our verdict.
    // Tuned so the corpus lands where the published figures do — disposal in the nineties,
    // true resolution just under forty (94.0% and 39.4% as this seed currently stands) — and
    // so the gap between our verdict and the citizen's answer stays in a range a real auditor
    // could plausibly have. That gap is NOT a measurement of us and is never published as one;
    // it lives in the `simulated_corpus_rate` view and only under the "What we simulated"
    // heading on /numbers. A negative
    // verdict is sometimes followed by the problem getting fixed anyway; that is our
    // "too harsh" column, and inventing a lot of it would be inventing our own incompetence.
    // A lawful transfer is correct procedure but not, by itself, a fix: the receiving office
    // still has to act, and often does not. It sits between `partial` and the negative verdicts,
    // and it is never counted as one of our errors — see supabase/migrations/11_real_error_rate.sql.
    const resolved =
      asked &&
      chance(
        verdict === 'resolved' ? 0.88
        : verdict === 'partial' ? 0.55
        : verdict === 'transferred_lawfully' ? 0.30
        : 0.13,
      );
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
    // One citizen row per synthetic complainant, not one row for the whole corpus. A single
    // shared row would make every "distinct people" count in this build a lie — including the
    // one the cluster visibility gate turns on, which is the count that decides whether an
    // accusation about an office gets published. Numbers, not names: these rows carry no
    // narrative and no identity beyond an index.
    const citizens = await client.query<{ id: string }>(
      `insert into citizens (phone_hash, display_name, preferred_lang, is_demo)
       select u.h, 'Synthetic complainant ' || u.i, u.lang, true
         from unnest($1::text[], $2::int[], $3::text[]) as u(h, i, lang)
      returning id`,
      [
        Array.from({ length: CORPUS_CITIZENS }, (_, i) => phoneHash(corpusPhone(i))),
        Array.from({ length: CORPUS_CITIZENS }, (_, i) => i + 1),
        Array.from({ length: CORPUS_CITIZENS }, (_, i) => LANGS[i % LANGS.length]),
      ],
    );
    const corpusCitizens = citizens.rows.map((r) => r.id);
    // Deterministic and stride-based rather than random, so the RNG stream — and with it the
    // headline figures — is untouched by this. 149 is coprime with CORPUS_CITIZENS, so the
    // first 420 cases land on 420 different people before anyone gets a second one.
    const citizenOf = (i: number) => corpusCitizens[(i * 149) % CORPUS_CITIZENS]!;

    await client.query(
      `insert into grievances (id, citizen_id, external_ref, source_system, imported, office_id,
                               department_id, original_lang, narrative_original, subject, status,
                               filed_at, sla_due_at, closed_at)
       select u.id, u.citizen_id, u.ref, 'mock_cpgrams', true, u.office_id,
              o.department_id, u.lang, u.narrative, 'Synthetic background case', u.status::grievance_status,
              u.filed_at, u.filed_at + interval '21 days', u.closed_at
         from unnest($1::uuid[], $2::text[], $3::uuid[], $4::text[], $5::text[], $6::text[],
                     $7::timestamptz[], $8::timestamptz[], $9::uuid[])
              as u(id, ref, office_id, lang, narrative, status, filed_at, closed_at, citizen_id)
         join offices o on o.id = u.office_id`,
      [
        drafts.map((d) => d.id),
        drafts.map(() => `DEMO/2026/${String(1000 + n++).padStart(7, '0')}`),
        drafts.map((d) => d.officeId),
        drafts.map(() => pick(LANGS)),
        drafts.map(() => pick(NARRATIVES)),
        drafts.map((d) => (d.closed ? 'closed' : 'replied')),
        drafts.map((d) => d.filedAt.toISOString()),
        drafts.map((d) => d.closedAt?.toISOString() ?? null),
        drafts.map((_, i) => citizenOf(i)),
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

    // The confirmation is answered by the person who filed, so it carries their citizen row.
    const asked = drafts.map((d, i) => ({ d, i })).filter(({ d }) => d.asked && d.closedAt);
    await client.query(
      `insert into confirmations (grievance_id, citizen_id, resolved, asked_via, asked_at, answered_at)
       select u.gid, u.citizen_id, u.resolved, 'web', u.asked_at, u.asked_at + interval '1 day'
         from unnest($1::uuid[], $2::boolean[], $3::timestamptz[], $4::uuid[])
              as u(gid, resolved, asked_at, citizen_id)`,
      [
        asked.map(({ d }) => d.id),
        asked.map(({ d }) => d.resolved),
        asked.map(({ d }) => d.closedAt!.toISOString()),
        asked.map(({ i }) => citizenOf(i)),
      ],
    );
  });

  console.log(`background corpus: ${drafts.length}`);
}

/**
 * Clusters. Publishing "46 people complained about this office" is an accusation, so the seed
 * does not get to decide which clusters are public. It writes membership, then asks the
 * database what the membership actually is, and the gate decides.
 *
 * The gate: at least MIN_MEMBERS cases, from at least MIN_CITIZENS distinct citizens, with more
 * than MIN_SPREAD_HOURS between the first and last filing. Without the distinct-citizen and
 * time-spread conditions, one motivated person could manufacture a public accusation in an
 * afternoon, and we would have built a machine for doing it.
 *
 * What this gate does NOT include is a same-device check. The design calls for one; this
 * corpus has no device or session signal to check against, so the code does not pretend to
 * apply it and neither does /cluster. In production that condition belongs here, computed from
 * the submission metadata, alongside these three.
 *
 * first_seen_at / last_seen_at are likewise read off the members rather than typed in, so the
 * dates on the page cannot drift from the cases behind them.
 */
const MIN_MEMBERS = 5;
const MIN_CITIZENS = 5;
const MIN_SPREAD_HOURS = 48;
async function seedClusters(officeIds: Map<string, string>) {
  const treasury = officeIds.get('Treasury Office, Muzaffarpur')!;

  // Month ranges in the labels match the filing dates the gate reads off the members below.
  const specs = [
    { label: 'Pension disbursement stoppage · Muzaffarpur · May–Aug 2026', office: treasury, size: 46, include: 'DEMO/2026/0000472' },
    { label: 'PF claim rejection without stated reason · Hyderabad · May–Aug 2026', office: officeIds.get('EPFO Regional Office, Hyderabad')!, size: 31, include: 'DEMO/2026/0000518' },
    { label: 'Monsoon road damage unrepaired · Pune Rural · May–Jul 2026', office: officeIds.get('PWD Sub-Division, Pune (Rural)')!, size: 18, include: 'DEMO/2026/0000631' },
    { label: 'Delayed scheme payments · Ranchi · May 2026', office: officeIds.get('Block Development Office, Ranchi')!, size: 4 },
    { label: 'Refund not credited · CPC Bengaluru · May 2026', office: officeIds.get('CPC Bengaluru')!, size: 3 },
    { label: 'Hospital billing dispute · Bhopal · May 2026', office: officeIds.get('District Hospital, Bhopal')!, size: 4 },
  ];

  let publicCount = 0;

  for (const s of specs) {
    const { rows } = await pool().query(
      `insert into clusters (label, office_id, first_seen_at, last_seen_at, is_public)
       values ($1,$2,now(),now(),false) returning id`,
      [s.label, s.office],
    );
    const clusterId = rows[0].id as string;

    // The demo case belongs in its own cluster, whatever its filing date — a citizen finding
    // "46 others" only lands if their case is one of the 46.
    const members = await pool().query(
      `select id from grievances
        where office_id = $1
        order by (external_ref = coalesce($3, '')) desc, filed_at
        limit $2`,
      [s.office, s.size, 'include' in s ? (s as { include: string }).include : null],
    );
    for (const m of members.rows) {
      await pool().query(
        `insert into cluster_members (cluster_id, grievance_id, similarity)
         values ($1,$2,$3) on conflict do nothing`,
        [clusterId, m.id, (0.82 + rand() * 0.15).toFixed(3)],
      );
    }

    // The gate, applied to what is actually in the table — not to what the spec above hoped for.
    const gated = await pool().query<{
      members: string; citizens: string; spread_hours: string | null;
      first_seen_at: string; last_seen_at: string; is_public: boolean;
    }>(
      `update clusters cl
          set first_seen_at = f.first_filed,
              last_seen_at  = f.last_filed,
              is_public     = f.members >= $2 and f.citizens >= $3
                              and f.last_filed > f.first_filed + make_interval(hours => $4)
         from (select count(*)                        as members,
                      count(distinct g.citizen_id)    as citizens,
                      min(g.filed_at)                 as first_filed,
                      max(g.filed_at)                 as last_filed
                 from cluster_members m
                 join grievances g on g.id = m.grievance_id
                where m.cluster_id = $1) f
        where cl.id = $1
    returning cl.is_public, cl.first_seen_at, cl.last_seen_at,
              (select count(*) from cluster_members m where m.cluster_id = cl.id) as members,
              (select count(distinct g.citizen_id) from cluster_members m
                 join grievances g on g.id = m.grievance_id
                where m.cluster_id = cl.id) as citizens,
              (select extract(epoch from (max(g.filed_at) - min(g.filed_at))) / 3600
                 from cluster_members m join grievances g on g.id = m.grievance_id
                where m.cluster_id = cl.id) as spread_hours`,
      [clusterId, MIN_MEMBERS, MIN_CITIZENS, MIN_SPREAD_HOURS],
    );
    const g = gated.rows[0]!;
    if (g.is_public) publicCount++;
    console.log(
      `  cluster ${g.is_public ? 'PUBLIC ' : 'private'} · members ${g.members} · distinct citizens ${g.citizens}` +
        ` · spread ${Number(g.spread_hours ?? 0).toFixed(1)}h · ${s.label}`,
    );
  }
  console.log(`clusters: ${specs.length} (${publicCount} public by gate, ${specs.length - publicCount} held back)`);
}

async function report() {
  const { rows } = await pool().query('select * from headline_numbers');
  const err = await pool().query('select * from our_error_rate');
  const sim = await pool().query('select * from simulated_corpus_rate');
  const verdicts = await pool().query(
    `select verdict, count(*)::int as n from audits where model = 'seed' group by verdict order by n desc`,
  );
  console.log('\nheadline:', rows[0]);
  console.log('our error rate (real model runs only):', err.rows[0]);
  console.log('simulated corpus rate (seeded rows, NOT a measurement):', sim.rows[0]);
  console.log('seeded verdict mix:', verdicts.rows);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
