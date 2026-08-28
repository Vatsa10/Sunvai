import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adapter } from '@/lib/adapters';
import { LANG_NAMES, SHIPPED_LANGS, t, type ShippedLang , DEFAULT_LANG} from '@/lib/i18n/strings';
import { MockNote } from '@/components/MockBadge';
import { TryTheAuditor } from '@/components/TryTheAuditor';
import { MyCases } from '@/components/MyCases';
import { SideBySide } from '@/components/SideBySide';
import { evalResults, pct } from '@/lib/eval-results';
import { isDbUnavailable } from '@/lib/db';
import { fixtureCase } from '@/lib/fixture-cases';
import { looksLikeLiveRef } from '@/lib/ref';

export const dynamic = 'force-dynamic';

/**
 * The landing page. One screen, no login wall, and three demo cases one tap away — a reviewer
 * who has no registration number is never stuck wondering what to type. Most demos die in the
 * first fifteen seconds on exactly that.
 */

// Only the references live here now. The name and the one-line description are per-language,
// because this page defaults to Hindi and three English chips under a Hindi headline read as
// unfinished localisation rather than as the deliberate choice they were not.
const DEMO_REFS = ['DEMO/2026/0000472', 'DEMO/2026/0000518', 'DEMO/2026/0000631'];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; notfound?: string }>;
}) {
  const sp = await searchParams;
  const lang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '') ? (sp.lang as ShippedLang) : DEFAULT_LANG;
  const s = t(lang);

  // The only accuracy claim on this page, and it is read from the eval file rather than
  // computed from the seeded corpus. If the eval has not been run, the section does not render.
  const evals = evalResults();

  // Deliberately no database probe here. Nothing on this page needs one: the chips, the eval
  // block and the paste box are static or read from a file. A probe would have put up to five
  // seconds of blocking wait in front of a judge on exactly the scenario this work exists for
  // — a paused pooler on the first click of the day — to tell them about a database whose
  // absence changes nothing on this screen. The `open` action below degrades on its own.

  async function open(formData: FormData) {
    'use server';
    const ref = String(formData.get('ref') ?? '').trim();
    if (!ref) redirect(`/?lang=${lang}&notfound=1`);

    // A number from a real system. We cannot open it and never will be able to without an
    // access agreement, so we say that instead of implying they mistyped it.
    if (looksLikeLiveRef(ref)) redirect(`/?lang=${lang}&notfound=live`);

    let found: { ref: string } | null = null;
    // Whether the database was unreachable matters to what we tell her. "Re-read your number"
    // and "wait a minute" are different instructions, and giving the first one to someone whose
    // number was correct all along is the kind of small lie this project exists to not tell.
    let down = false;
    try {
      found = await adapter.fetchCase(ref);
    } catch (err) {
      // Only an unreachable database falls back — the same rule the case page holds to. A
      // broken query is still a real error, because quietly serving fixtures over a bug is how
      // a demo starts lying.
      if (!isDbUnavailable(err)) throw err;
      down = true;
      found = fixtureCase(ref);
    }
    if (found) redirect(`/case/${encodeURIComponent(found.ref)}?lang=${lang}`);
    // Not one of the committed copies either, and the database is the reason we cannot say
    // more than that. Never claim the number is wrong when we simply could not look.
    redirect(`/?lang=${lang}&notfound=${down ? 'down' : '1'}`);
  }

  return (
    <div className="space-y-8">
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
        {/* Commentary, not a control. Hidden on a phone so it does not push the
            proposition below the fold on the screen most people arrive on. */}
        <span className="hidden items-center px-1 text-muted sm:inline-flex">{s.langNote}</span>
      </nav>

      <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{s.tagline}</h1>

      {/* Who is hurt, and by what, before anything asks the reader for input. The figure is
          the published national one and is labelled as read rather than measured — the two
          kinds of number are never allowed to sit unlabelled on the same screen. */}
      <section className="space-y-2">
        <p className="text-lg leading-relaxed sm:text-xl">{s.problemLead}</p>
        <p className="text-sm text-muted">{s.problemSource}</p>
      </section>

      {/* The three demo cases, promoted above the form. A judge who has no registration
          number must not meet a box asking for one as the first thing they can act on. */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{s.tryOne}</h2>
        <ul className="space-y-3">
          {DEMO_REFS.map((ref, i) => (
            <li key={ref}>
              <Link
                href={`/case/${encodeURIComponent(ref)}?lang=${lang}`}
                className="block rounded border border-rule p-4 no-underline hover:border-ink"
              >
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-semibold text-ink">{s.demoChips[i].who}</span>
                  <span className="rounded border border-warn/40 bg-warn/5 px-2 py-0.5 text-sm text-warn">
                    {s.demoData}
                  </span>
                </span>
                <span className="mt-1 block text-muted">{s.demoChips[i].what}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* What the portal gives her, against what we add. The argument for why "simpler"
          cannot be counted in taps here. */}
      <SideBySide lang={lang} />

      {/* Door A, demoted. Someone who does have a number will look for the box. */}
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

          {sp.notfound === 'live' ? (
            <div className="mt-3 rounded border-2 border-ink p-4">
              <p className="font-semibold text-ink">{s.realRefHeading}</p>
              <p className="mt-1 text-ink">{s.realRefBody}</p>
              <a href="#try-the-auditor" className="mt-2 inline-block underline">
                {s.goToBox}
              </a>
            </div>
          ) : (
            sp.notfound && (
              <p className="mt-3 text-bad">{sp.notfound === 'down' ? s.systemDown : s.notFound}</p>
            )
          )}
        </div>

        {/* Cases this device has already seen. Renders nothing when there are none. */}
        <MyCases lang={lang} />

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

      {/* Try it on something we did not choose. Three cases we picked invite one fair
          objection, and this is the answer to it. */}
      <section id="try-the-auditor" className="rounded border-2 border-ink p-5">
        <TryTheAuditor lang={lang} />
      </section>

      {/* How well the auditor actually does, measured on hand-labelled cases. Every figure here
          comes from evals/results.json. If that file is missing this section renders nothing —
          a fabricated fallback is the one thing this page must never do. */}
      {evals && (
        <section className="rounded border border-rule p-5">
          <h2 className="text-lg font-semibold">{s.evalHeading(evals.cases)}</h2>
          <p className="mt-1 text-muted">
            {s.evalFalseAccusation(evals.falseAccusation === 0 ? null : pct(evals.falseAccusation))}{' '}
            {s.evalAdversarial(pct(evals.adversarialCatch))} {s.evalGates(evals.gatesFailed)}{' '}
            <Link href="/how-this-works" className="underline">{s.evalSeeEvery}</Link>.
          </p>
          <p className="mt-1 text-muted">{s.evalOneWrong}</p>
        </section>
      )}

      <MockNote>
        {s.homeMockNote}{' '}
        <Link href="/how-this-works" className="underline">{s.homeMockNoteLink}</Link>.
      </MockNote>
    </div>
  );
}
