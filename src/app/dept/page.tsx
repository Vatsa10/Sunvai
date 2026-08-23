import Link from 'next/link';
import { query } from '@/lib/db';
import { replyAndClose } from '@/actions/audit-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Department view (scaffolding) — Sunvai' };

/**
 * Department-side scaffolding. Not a product surface.
 *
 * The brief says reviewers are judged on the citizen experience and that the admin side is
 * assumed, so this deliberately gets a list, a text box and one button — nothing more. It
 * exists for one reason: so you can send a reply in your own words and watch the audit run on
 * it, rather than taking our three demo verdicts on trust.
 *
 * The corpus called this `_dept/`. It cannot be: in the App Router a leading underscore marks a
 * folder as private and Next does not route it at all, so the page would simply not exist. It
 * lives at /dept instead — unlinked from the citizen journey, labelled as scaffolding at the
 * top, and reachable from the footer for a reviewer who wants it.
 */
export default async function DeptPage() {
  const open = await query<{ ref: string; subject: string; office: string; filed_at: string; status: string }>(
    `select g.external_ref as ref, coalesce(g.subject,'(no subject)') as subject,
            coalesce(o.name,'—') as office, g.filed_at, g.status
       from grievances g
       left join offices o on o.id = g.office_id
      where g.status in ('filed','acknowledged','assigned','replied')
      order by g.filed_at desc
      limit 15`,
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-warn">
          ▲ Scaffolding — not part of the citizen product
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Department view</h1>
        <p className="text-muted">
          A list, a box and a button. This is here so you can write a closure reply yourself and watch our
          auditor read it — including a reply engineered to sound thorough while answering nothing.
        </p>
        <p className="text-muted">
          Nothing on this page is what we are asking to be judged on. If you want to test the auditor without
          filing anything,{' '}
          <Link href="/" className="underline">
            the box on the front page
          </Link>{' '}
          does it in one step.
        </p>
      </header>

      {open.length === 0 ? (
        <p className="rounded border border-rule p-5 text-muted">
          Nothing is open right now. File one through{' '}
          <Link href="/file" className="underline">
            Door B
          </Link>{' '}
          and it will appear here.
        </p>
      ) : (
        <ul className="space-y-6">
          {open.map((g) => (
            <li key={g.ref} className="rounded border border-rule p-5">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-sm text-muted">{g.ref}</span>
                <span className="text-sm text-muted">{g.office}</span>
              </div>
              <h2 className="mt-1 font-semibold">{g.subject}</h2>

              <form action={replyAndClose} className="mt-3 space-y-3">
                <input type="hidden" name="ref" value={g.ref} />
                <label htmlFor={`body-${g.ref}`} className="sr-only">
                  Reply text
                </label>
                <textarea
                  id={`body-${g.ref}`}
                  name="body"
                  rows={4}
                  placeholder="The matter has been forwarded to the concerned department. The grievance is accordingly closed."
                  className="w-full rounded border border-ink p-3"
                />
                <button
                  type="submit"
                  className="min-h-touch rounded bg-ink px-5 py-2 font-semibold text-paper"
                >
                  Reply and mark disposed
                </button>
              </form>

              <p className="mt-2 text-sm text-muted">
                Sending this closes the case and runs the audit live. Then open{' '}
                <Link href={`/case/${encodeURIComponent(g.ref)}`} className="underline">
                  the citizen’s view
                </Link>
                .
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
