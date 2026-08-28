/**
 * Nothing at this address. Same rule as the error page: one plain sentence, then three doors
 * that open.
 */

import Link from 'next/link';

const WAYS_ON = [
  { ref: 'DEMO/2026/0000472', label: 'Kamla — pension stopped, closed in 19 days' },
  { ref: 'DEMO/2026/0000518', label: 'Arif — PF claim rejected, the reply repeats the code' },
  { ref: 'DEMO/2026/0000631', label: 'Meera — road not repaired (a case we get wrong)' },
];

export default function NotFound() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold leading-tight">There is nothing at this address.</h1>
      <p className="text-muted">
        Every case on this site is synthetic and carries a DEMO/ reference. If you typed a real
        registration number, we cannot open it — there is no connection to any live government
        system. The paste box on the front page does work on a real reply you have in hand.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Open one of these instead:</h2>
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

      <Link href="/" className="inline-flex min-h-touch items-center rounded border border-ink px-6 py-2 font-semibold no-underline">
        Back to the front page
      </Link>
    </div>
  );
}
