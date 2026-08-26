'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { lookupSavedCase } from '@/actions/saved-case-actions';
import { readSavedCases, type SavedCase } from '@/lib/local-cases';
import { t, type ShippedLang } from '@/lib/i18n/strings';

/**
 * The list of cases this device has seen, under Door A.
 *
 * The point of Sunvai is the visit weeks later, and until this existed there was no way back
 * in without a reference number nobody was told to write down. It is also what makes the demo
 * survivable: a reviewer who files through Door B can now find their own case again.
 *
 * When there is nothing stored it renders nothing at all — no empty box, no placeholder. An
 * empty state here would be a permanent piece of furniture on the most important screen,
 * explaining a feature to someone who has not used it yet.
 */

type Row = SavedCase & { state: 'checking' | 'open' | 'unavailable' };

export function MyCases({ lang }: { lang: ShippedLang }) {
  const s = t(lang);
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    // Read is already total: a private window or blocked site data gives an empty array, and
    // an empty array renders nothing.
    const stored = readSavedCases();
    if (stored.length === 0) {
      setRows([]);
      return;
    }
    setRows(stored.map((c) => ({ ...c, state: 'checking' })));

    let live = true;
    for (const c of stored) {
      // Each reference is checked on its own. The database this runs on pauses when idle, so
      // one that does not answer must cost one muted row rather than the whole list.
      void (async () => {
        let ok = false;
        let subject: string | null = null;
        try {
          const res = await lookupSavedCase(c.ref);
          ok = res.ok;
          if (res.ok) subject = res.subject;
        } catch {
          ok = false;
        }
        if (!live) return;
        setRows((prev) =>
          (prev ?? []).map((r) =>
            r.ref === c.ref
              ? { ...r, state: ok ? 'open' : 'unavailable', subject: subject ?? r.subject }
              : r,
          ),
        );
      })();
    }
    return () => {
      live = false;
    };
  }, []);

  if (!rows || rows.length === 0) return null;

  return (
    <section className="rounded border border-rule p-5" aria-labelledby="my-cases-heading">
      <h2 id="my-cases-heading" className="text-lg font-semibold">
        {s.myCases}
      </h2>
      <p className="mt-1 text-muted">{s.myCasesPrivacy}</p>
      <ul className="mt-4 space-y-2">
        {rows.map((r) =>
          r.state === 'unavailable' ? (
            <li
              key={r.ref}
              className="flex min-h-touch flex-col justify-center rounded border border-rule border-dashed p-3 text-muted"
            >
              <span className="font-mono text-sm">{r.ref}</span>
              {/* Said in words, not signalled by the grey alone. */}
              <span>{s.caseUnavailable}</span>
            </li>
          ) : (
            <li key={r.ref}>
              <Link
                href={`/case/${encodeURIComponent(r.ref)}?lang=${lang}`}
                className="flex min-h-touch flex-col justify-center rounded border border-rule p-3 no-underline hover:border-ink"
              >
                <span className="font-mono text-sm text-muted">{r.ref}</span>
                {r.subject && <span className="text-ink">{r.subject}</span>}
              </Link>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
