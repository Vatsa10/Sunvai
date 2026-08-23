import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adapter } from '@/lib/adapters';
import { LANG_NAMES, SHIPPED_LANGS, t, type ShippedLang } from '@/lib/i18n/strings';
import { MockNote } from '@/components/MockBadge';
import { TryTheAuditor } from '@/components/TryTheAuditor';
import { one } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * The landing page. One screen, no login wall, and three demo cases one tap away — a reviewer
 * who has no registration number is never stuck wondering what to type. Most demos die in the
 * first fifteen seconds on exactly that.
 */

const DEMO_CHIPS = [
  { ref: 'DEMO/2026/0000472', who: 'Kamla, 58', what: 'Pension stopped three months ago. Marked Disposed in 19 days.' },
  { ref: 'DEMO/2026/0000518', who: 'Arif, 31', what: 'PF claim rejected. The reply repeats the rejection code.' },
  { ref: 'DEMO/2026/0000631', who: 'Meera, 24', what: 'Road not repaired. A case our own auditor gets wrong.' },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string; notfound?: string }> }) {
  const sp = await searchParams;
  const lang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '') ? (sp.lang as ShippedLang) : 'hi';
  const s = t(lang);

  const errors = await one<{ too_soft: string; too_harsh: string; total_compared: string }>(
    'select * from our_error_rate',
  );
  const wrong = Number(errors?.too_soft ?? 0) + Number(errors?.too_harsh ?? 0);
  const compared = Number(errors?.total_compared ?? 0);

  async function open(formData: FormData) {
    'use server';
    const ref = String(formData.get('ref') ?? '').trim();
    const found = ref ? await adapter.fetchCase(ref) : null;
    redirect(found ? `/case/${encodeURIComponent(found.ref)}?lang=${lang}` : `/?lang=${lang}&notfound=1`);
  }

  return (
    <div className="space-y-10">
      <nav aria-label="Language" className="flex flex-wrap gap-2">
        {SHIPPED_LANGS.map((l) => (
          <Link
            key={l}
            href={`/?lang=${l}`}
            aria-current={l === lang ? 'true' : undefined}
            className={`inline-flex min-h-touch items-center rounded border px-4 py-2 no-underline ${
              l === lang ? 'border-ink bg-ink text-paper' : 'border-rule text-ink'
            }`}
          >
            {LANG_NAMES[l]}
          </Link>
        ))}
        <span className="inline-flex items-center px-1 text-sm text-muted">
          Three languages, done properly. Not twenty-two, half-working.
        </span>
      </nav>

      <h1 className="text-3xl font-semibold leading-tight tracking-tight">{s.tagline}</h1>

      {/* Door A first, and larger. The audit is the product; intake is table stakes. */}
      <section className="space-y-4">
        <div className="rounded border-2 border-ink p-5">
          <h2 className="text-xl font-semibold">{s.doorA}</h2>
          <p className="mt-1 text-muted">{s.doorASub}</p>

          <form action={open} className="mt-4 flex flex-wrap gap-3">
            <label htmlFor="ref" className="sr-only">{s.refLabel}</label>
            <input
              id="ref"
              name="ref"
              placeholder={s.refPlaceholder}
              autoComplete="off"
              inputMode="text"
              className="min-h-touch flex-1 rounded border border-ink px-3 py-2 text-lg"
            />
            <button type="submit" className="min-h-touch rounded bg-ink px-6 py-2 font-semibold text-paper">
              {s.open}
            </button>
          </form>

          {sp.notfound && <p className="mt-3 text-bad">{s.notFound}</p>}
        </div>

        <div className="rounded border border-rule p-5">
          <h2 className="text-lg font-semibold">{s.doorB}</h2>
          <p className="mt-1 text-muted">{s.doorBSub}</p>
          <Link
            href={`/file?lang=${lang}`}
            className="mt-3 inline-flex min-h-touch items-center rounded border border-ink px-5 py-2 font-semibold text-ink no-underline"
          >
            {s.doorB}
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{s.tryOne}</h2>
        <ul className="space-y-3">
          {DEMO_CHIPS.map((c) => (
            <li key={c.ref}>
              <Link
                href={`/case/${encodeURIComponent(c.ref)}?lang=${lang}`}
                className="block rounded border border-rule p-4 no-underline hover:border-ink"
              >
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-semibold text-ink">{c.who}</span>
                  <span className="rounded border border-warn/40 bg-warn/5 px-2 py-0.5 text-sm text-warn">
                    {s.demoData}
                  </span>
                </span>
                <span className="mt-1 block text-muted">{c.what}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Try it on something we did not choose. Three cases we picked invite one fair
          objection, and this is the answer to it. */}
      <section className="rounded border-2 border-ink p-5">
        <TryTheAuditor />
      </section>

      {/* Our own error rate, on the front page rather than in a footnote. */}
      <section className="rounded border border-rule p-5">
        <h2 className="text-lg font-semibold">We are wrong about {compared ? ((wrong / compared) * 100).toFixed(1) : '—'}% of the time</h2>
        <p className="mt-1 text-muted">
          Every time our verdict disagreed with what the citizen told us, we counted it — both when we were
          too harsh and when we were too soft. That is {wrong.toLocaleString('en-IN')} out of{' '}
          {compared.toLocaleString('en-IN')} cases.{' '}
          <Link href="/numbers" className="underline">See the breakdown</Link>.
        </p>
        <p className="mt-1 text-muted">
          One of the three cases above is one we get wrong on purpose. It is left in.
        </p>
      </section>

      <MockNote>
        There is no login here, and nothing to sign up for. Every case, citizen and department
        reply on this site is synthetic — we never touch a live government system.{' '}
        <Link href="/how-this-works" className="underline">What is real and what is mocked</Link>.
      </MockNote>
    </div>
  );
}
