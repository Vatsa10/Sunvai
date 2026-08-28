'use client';

/**
 * The last thing between a tired reviewer and a stack trace.
 *
 * It says what happened in one sentence, does not apologise at length, and — the part that
 * matters — puts three working cases one tap away, so a broken page is a detour rather than
 * the end of the visit.
 */

import Link from 'next/link';
import { useEffect } from 'react';

const WAYS_ON = [
  { ref: 'DEMO/2026/0000472', label: 'Kamla — pension stopped, closed in 19 days' },
  { ref: 'DEMO/2026/0000518', label: 'Arif — PF claim rejected, the reply repeats the code' },
  { ref: 'DEMO/2026/0000631', label: 'Meera — road not repaired (a case we get wrong)' },
];

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The server log is where this belongs; the citizen gets the sentence above instead.
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold leading-tight">This page did not load.</h1>
      <p className="text-muted">
        Something on our side failed — not on yours, and nothing you did caused it. Nothing was sent
        anywhere and nothing was lost.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-touch rounded bg-ink px-6 py-2 font-semibold text-paper"
        >
          Try again
        </button>
        <Link href="/" className="min-h-touch rounded border border-ink px-6 py-2 font-semibold no-underline">
          Start over
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Or open one of these — they work:</h2>
        <ul className="space-y-2">
          {WAYS_ON.map((w) => (
            <li key={w.ref}>
              <Link href={`/case/${encodeURIComponent(w.ref)}`} className="block rounded border border-rule p-4 no-underline hover:border-ink">
                {w.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {error.digest && <p className="font-mono text-sm text-muted">Reference: {error.digest}</p>}
    </div>
  );
}
