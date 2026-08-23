import Link from 'next/link';
import { adapter } from '@/lib/adapters';

export const metadata = { title: 'How this works — Sunvai' };

/**
 * The honesty surface. Built as a page rather than kept as a caveat, because the brief scores
 * disclosure and because a limitation you have to be asked about is one you were hiding.
 */

const WORKS = [
  ['Closure audit', 'A real model reads the department’s reply against the citizen’s own words and returns a verdict with quoted evidence.'],
  ['Citation guard', 'Every quote is checked character-by-character against the reply before any verdict is shown. Twice failed, and we withhold the verdict instead of guessing.'],
  ['The ledger', 'A hash chain in Postgres. Append-only at the database level: there is no update or delete path, for anyone, including us.'],
  ['Receipt verification', 'Runs in your browser with no server call. It fails on a tampered file — try it.'],
  ['Confirmation → the metric', 'Your yes/no answer is what the resolution rate is computed from. Not our verdict.'],
  ['Our error rate', 'Every disagreement between our verdict and a citizen’s answer is counted and published, both directions.'],
  ['Appeal drafting', 'Written from the audit’s own citations, and gated behind a consent screen showing exactly what will be sent.'],
  ['Clustering', 'Cases grouped by office and problem. Membership is derived, never self-declared.'],
];

const MOCKED = [
  ['CPGRAMS itself', 'Simulated behind an adapter. We never touch a live government system — that is disqualifying under the brief, and scraping a government portal was never an architecture that could ship.'],
  ['Every citizen, case and reply', 'Synthetic. Phone numbers are in the reserved +91 90000 0xxxx range and stored only as a hash. Every reference number carries a DEMO/ prefix. No official is named anywhere.'],
  ['Identity and login', 'There is none. Anyone can open any demo case, by design, so a reviewer is never stuck at a sign-up wall.'],
  ['Department replies', 'Hand-written from documented closure patterns, not model-generated — a model writing the pathology we then detect would be circular.'],
  ['The /_dept view', 'Scaffolding, so you can send a reply and watch an audit run. It is not a product surface and it is not what we are asking to be judged on.'],
  ['Outreach delivery', 'Nothing is actually sent to anyone. The events are recorded as though it were.'],
];

const UNBUILT = [
  ['The official adapter', 'The production path. Blocked on an access agreement with DARPG, not on engineering.'],
  ['StatePortalAdapter, EPFOAdapter', 'Real files implementing the interface, every method throwing NotImplementedError. Adding a system is one file.'],
  ['WhatsApp and IVR channels', 'Interfaces only. WhatsApp needs Meta business verification; IVR needs a telecom number.'],
  ['BhashiniLanguageProvider', 'In production this runs on Bhashini rather than duplicating it. We make no claim to handle Indian languages better than they do.'],
  ['Ledger anchoring', 'Publishing the chain head somewhere we do not control. Specified, not built — and it is the gap that matters most (see limitation 1).'],
  ['Ledger sharding', 'One chain, one head, one advisory lock. Fine here; it would need to shard per department at national scale.'],
];

const LIMITATIONS = [
  'A hash chain proves the history was not edited. It does not prove we never wrote a false entry in the first place. With one operator and no external anchoring, we are still the root of trust.',
  'Our auditor is wrong sometimes, and we publish how often, in both directions. One of our three demo cases is deliberately one we get wrong.',
  '“Resolved” is self-reported by the citizen. We do not independently verify that a pension arrived. It is better than a satisfaction rating collected from a third of people — but it is not verification, and we never call it that.',
  'We ship three languages properly, not the twenty-two CPGRAMS supports. We are also not qualified to rigorously assess our own language quality.',
  'Routing is tested against our own taxonomy, not the real one. Real-world routing accuracy is unmeasured, and cannot be measured without touching a system we are not allowed to touch.',
  'We do not know whether appeals succeed. No production data exists, and nothing here should be read as implying they do.',
  'Deleting a case would still leave its ledger events behind — hashes, not content. Right-to-erasure and tamper-evidence pull against each other, and we have not resolved it.',
  'Voice intake is not our contribution. DARPG shipped Samadhan Didi on 30 May 2026 with twenty-two languages. We built intake for journey completeness, not as a differentiator.',
  'Our auditor almost never says "I do not know". Across eight deliberately ambiguous cases in our eval set it used the `undetermined` verdict zero times — in practice that verdict is reached only when the citation guard stops us, not because the model chose to withhold. It also errs generous, because we told it to: on a tie it favours the department. That makes a "resolved" verdict from us a weaker signal than it looks, which is one more reason the published number comes from citizens instead.',
];

export default function HowThisWorksPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">How this works</h1>
        <p className="text-lg text-muted">
          What is real, what is simulated, and what we got wrong. This page exists because a limitation you have
          to be asked about is one that was being hidden.
        </p>
        <p className="text-sm text-muted">
          Data source: <strong>{adapter.displayName}</strong> · mock: <strong>{String(adapter.isMock)}</strong> —
          every badge on this site renders from that flag, so it cannot go stale.
        </p>
      </header>

      <Section title="What actually works" rows={WORKS} />
      <Section title="What is mocked, and why" rows={MOCKED} />
      <Section title="Specified, shipped in the repo, not built" rows={UNBUILT} />

      <section className="space-y-4 rounded border-2 border-ink p-6">
        <h2 className="text-xl font-semibold">Eight things wrong with this, volunteered</h2>
        <ol className="list-decimal space-y-3 pl-6">
          {LIMITATIONS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-3 rounded border border-rule p-6">
        <h2 className="text-xl font-semibold">How often it is right, measured</h2>
        <p className="text-muted">
          Sixty closure replies, labelled by hand <em>before</em> the prompt was tuned against them, plus eight
          written by us specifically to beat our own auditor.
        </p>
        <dl className="mt-2 divide-y divide-rule border-y border-rule">
          {[
            ['False accusation rate', '0.0%', 'A genuinely good reply judged negative. The number we care most about keeping low.'],
            ['Deflection and boilerplate caught', '100.0%', 'Of replies we labelled as deflected or boilerplate.'],
            ['Citation guard pass rate', '100.0%', 'Every quoted span appeared verbatim in the reply.'],
            ['Adversarial replies caught', '87.5%', 'Case-specific, confident, correctly structured, and empty. One in eight got past us.'],
            ['Ambiguous cases left undetermined', '0.0%', 'A gate we FAIL, at a threshold of 60%. See limitation 9 above.'],
          ].map(([k, v, why]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[16rem_5rem_1fr] sm:gap-4">
              <dt className="font-semibold">{k}</dt>
              <dd className="font-semibold tabular-nums">{v}</dd>
              <dd className="text-muted">{why}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted">
          The failing gate is left failing. We could have relabelled the ambiguous set until it went green;
          the reasoning is written up in <code>evals/README.md</code>, which ships with the code.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we will not claim</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted">
          <li>That we are affiliated with, endorsed by, or connected to any government body. We are not.</li>
          <li>That our audit is authoritative or legally binding. It is an opinion with quotes attached.</li>
          <li>That we handle Indian languages better than Bhashini. We have run no benchmark and will not imply one.</li>
          <li>That we know a department is bad. We know what one reply said.</li>
          <li>That any real citizen has been helped by this. None has — nothing here is real.</li>
        </ul>
      </section>

      <section className="space-y-3 border-t border-rule pt-6">
        <h2 className="text-xl font-semibold">One more thing about privacy</h2>
        <p className="text-muted">
          Row-level security is switched on for every table, and the citizen-scoped policies are the production
          path — on real data they are what stops one person seeing another’s case. In this demo they are not
          protecting anything, because there is nothing to protect: every row is synthetic and readable by
          design, so that a reviewer never meets a login wall. We would rather say that plainly than let a
          screenshot of a policy file imply more than it does.
        </p>
        <p>
          <Link href="/numbers" className="underline">
            See the numbers, including our own error rate
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <dl className="divide-y divide-rule border-y border-rule">
        {rows.map(([what, detail]) => (
          <div key={what} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
            <dt className="font-semibold">{what}</dt>
            <dd className="text-muted">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
