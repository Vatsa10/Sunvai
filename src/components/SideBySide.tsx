import Link from 'next/link';
import { t, type ShippedLang } from '@/lib/i18n/strings';
import { verdictCopy } from '@/lib/verdicts';
import { fixtureCase } from '@/lib/fixture-cases';
import { translateJargon } from '@/lib/jargon';
import { MockBadge } from '@/components/MockBadge';

/**
 * One closure, read twice.
 *
 * The hackathon brief asks for something "faster and simpler than the site they use today".
 * Sunvai is not fewer taps than the portal — it is additional to it — so this component argues
 * that simpler is the wrong unit, and answers the criterion in the unit that fits: how many of
 * the citizen's questions are still unanswered when the case is marked closed.
 *
 * Two rules govern how it is built.
 *
 * 1. **No mimicry.** The left panel quotes the text a citizen actually received, which is the
 *    whole point of the exercise. It does not imitate the portal's interface, carry a logo, a
 *    masthead or an emblem, and it is not styled to resemble one. It is plain text in a plain
 *    box. The plainness is the argument and is not a rough edge to be polished out.
 *
 * 2. **Nothing here is retyped.** The reply, the status word and both dates are read from the
 *    seeded case, and the verdict and the quoted spans from the recorded model run against
 *    that exact text. If the seed changes, this changes with it. Only our own framing — the
 *    headings, the summary of what went unanswered, the forum line — lives in the string file,
 *    because that framing has to exist in Hindi, English and Marathi.
 *
 * If the recorded audit is not on disk there is no verdict to show, and the section renders
 * nothing rather than an invented one.
 */

const KAMLA = 'DEMO/2026/0000472';

export function SideBySide({ lang }: { lang: ShippedLang }) {
  const s = t(lang);
  const c = fixtureCase(KAMLA);
  if (!c || !c.reply || !c.audit) return null;

  const v = verdictCopy(c.audit.verdict, lang);
  const days = Math.round((Date.parse(c.closedAt ?? c.filedAt) - Date.parse(c.filedAt)) / 86_400_000);
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <section aria-labelledby="sxs-heading" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="sxs-heading" className="text-xl font-semibold">
          {s.sxsHeading}
        </h2>
        <MockBadge what={s.simulatedCase} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: only what she has today. Deliberately unstyled. */}
        <div className="rounded border border-rule p-5">
          <h3 className="text-lg font-semibold">{s.sxsLeftHeading}</h3>

          <dl className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">{s.sxsStatusLabel}:</dt>
              {/* Their word, verbatim, and then what it means — the status word she was given
                  is English on a Hindi page because that is what she was actually given, and
                  leaving it alone without saying what it means would just repeat the problem. */}
              <dd className="font-semibold">
                {c.rawStatus}
                <span className="font-normal text-muted"> — {translateJargon(c.rawStatus, lang)}</span>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">{s.sxsElapsedLabel}:</dt>
              <dd className="font-semibold">
                {s.elapsedDays(days)} · {fmt(c.filedAt)} → {fmt(c.closedAt!)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-muted">{s.sxsReplyLabel}</p>
          <blockquote className="mt-1 border-l-4 border-rule p-3 font-serif text-lg leading-relaxed">
            {c.reply.body}
          </blockquote>
          <p className="mt-2 text-sm text-muted">{s.sxsReplyNote}</p>
        </div>

        {/* Right: the same closure, with the questions it left standing. */}
        <div className="rounded border-2 border-ink p-5">
          <h3 className="text-lg font-semibold">{s.sxsRightHeading}</h3>

          <p className="mt-4 text-muted">{s.sxsVerdictLabel}</p>
          {/* Icon and word both carry the meaning — never the colour on its own. */}
          <p className={`mt-1 inline-flex items-center gap-2 rounded border px-3 py-1 font-semibold ${v.className}`}>
            <span aria-hidden="true">{v.icon}</span>
            {v.label}
          </p>
          <p className="mt-2">{v.headline}</p>

          <p className="mt-4 text-muted">{s.sxsQuotedLabel}</p>
          <ul className="mt-1 space-y-1">
            {c.audit.citations.map((q) => (
              <li key={q.quote} className="border-l-4 border-ink pl-3 font-serif leading-relaxed">
                {q.quote}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-muted">{s.sxsUnansweredLabel}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {s.sxsUnanswered.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>

          <p className="mt-4 text-muted">{s.sxsForumLabel}</p>
          <p className="mt-1">{s.sxsForumValue}</p>

          <Link
            href={`/case/${encodeURIComponent(c.ref)}?lang=${lang}`}
            className="mt-4 inline-flex min-h-touch items-center rounded border border-ink px-5 py-2 font-semibold text-ink no-underline"
          >
            {s.sxsOpenCase}
          </Link>
        </div>
      </div>

      <p className="text-lg font-semibold">{s.sxsClosing}</p>
    </section>
  );
}
