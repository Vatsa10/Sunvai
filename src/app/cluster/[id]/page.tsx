import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one, query } from '@/lib/db';
import { MockNote } from '@/components/MockBadge';
import { ClusterMap } from '@/components/ClusterMap';

export const dynamic = 'force-dynamic';

/**
 * The pattern. Counts and offices only — never names, never narratives, never who.
 *
 * Membership is derived from the case record, and a cluster only becomes public once it clears
 * a gate applied in code — see the gate in supabase/seed/run.ts, which computes it from the
 * members rather than taking anyone's word for it: at least five cases, from at least five
 * distinct citizen records, spread over more than forty-eight hours. Without that, one
 * motivated person can manufacture a public accusation in an afternoon, and we would have
 * built a machine for doing it. A same-device check belongs in that gate too; there is no
 * device signal in this data, so the gate does not apply one and this page does not claim it.
 */
export default async function ClusterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cluster = await one<{
    id: string; label: string; office: string; state: string; department: string;
    first_seen_at: string; last_seen_at: string; lat: string | null; lon: string | null;
  }>(
    `select cl.id, cl.label, o.name as office, o.state, d.short_name as department,
            cl.first_seen_at, cl.last_seen_at, o.lat, o.lon
       from clusters cl
       join offices o on o.id = cl.office_id
       join departments d on d.id = o.department_id
      where cl.id::text = $1 and cl.is_public`,
    [id],
  );
  if (!cluster) notFound();

  // Three states, never two. A closure nobody was ever asked about is not evidence that the
  // problem was left unfixed — counting it as one would manufacture an accusation out of
  // silence, which is the exact inversion this whole project exists to refuse. So the query
  // separates "they said no", "they said yes" and "nobody answered", and the page prints all
  // three. The accusation number gets smaller. That is the point.
  const stats = await one<{
    members: string; closed: string; said_not_fixed: string; said_fixed: string; never_asked: string;
  }>(
    `select count(*) as members,
            count(*) filter (where g.status in ('closed','appeal_closed')) as closed,
            count(*) filter (where g.status in ('closed','appeal_closed')
                               and cf.resolved is false)                   as said_not_fixed,
            count(*) filter (where g.status in ('closed','appeal_closed')
                               and cf.resolved is true)                    as said_fixed,
            count(*) filter (where g.status in ('closed','appeal_closed')
                               and cf.id is null)                          as never_asked
       from cluster_members m
       join grievances g on g.id = m.grievance_id
       left join confirmations cf on cf.grievance_id = g.id and cf.supersedes_id is null
      where m.cluster_id = $1`,
    [id],
  );

  // Every public cluster, so the map has something to place this one against.
  const all = await query<{ id: string; label: string; office: string; lat: string; lon: string; members: string }>(
    `select cl.id, cl.label, o.name as office, o.lat, o.lon,
            (select count(*) from cluster_members m where m.cluster_id = cl.id) as members
       from clusters cl join offices o on o.id = cl.office_id
      where cl.is_public and o.lat is not null`,
  );

  const members = Number(stats?.members ?? 0);
  const closed = Number(stats?.closed ?? 0);
  const saidNotFixed = Number(stats?.said_not_fixed ?? 0);
  const saidFixed = Number(stats?.said_fixed ?? 0);
  const neverAsked = Number(stats?.never_asked ?? 0);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted">A pattern, not a case</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">{cluster.label}</h1>
        <p className="text-muted">
          {cluster.office} · {cluster.department} · {cluster.state}
        </p>
      </header>

      <section className="rounded border-2 border-ink p-6">
        <p className="text-2xl leading-snug">
          <strong className="tabular-nums">{members} people</strong> have complained about the same thing at
          this office.
        </p>
        <p className="mt-3 text-2xl leading-snug">
          <strong className="tabular-nums">{closed}</strong> of those complaints have been marked closed. Of those
          closures:
        </p>
        <ul className="mt-3 space-y-2 text-2xl leading-snug">
          <li>
            <strong className="tabular-nums">{saidNotFixed}</strong> — the person told us the problem was still
            not fixed.
          </li>
          <li>
            <strong className="tabular-nums">{saidFixed}</strong> — the person told us it was actually sorted.
          </li>
          <li>
            <strong className="tabular-nums">{neverAsked}</strong> — nobody ever answered us, so we do not know
            either way.
          </li>
        </ul>
        <p className="mt-4 text-base text-muted">
          Only the first number is an accusation, and it is the one those citizens made themselves.
          We do not fold the {neverAsked} unanswered closures into it, or into the sorted ones. Silence is not
          evidence in either direction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Where these are</h2>
        <p className="text-muted">
          Office locations, not people. A complaint tells you where an office is; it does not get to tell anyone
          where the complainant lives.
        </p>
        <ClusterMap
          points={all.map((c) => ({
            id: c.id,
            label: c.label,
            office: c.office,
            lat: Number(c.lat),
            lon: Number(c.lon),
            members: Number(c.members),
            current: c.id === cluster.id,
          }))}
        />
      </section>

      <section className="space-y-3 rounded border border-rule p-5">
        <h2 className="text-lg font-semibold">Why you are not seeing names</h2>
        <p className="text-muted">
          People who complain about an office are sometimes vulnerable to that office. So this page aggregates
          by office and never by named official, and it shows counts rather than complainants. Nobody appears
          here by name — including the officers involved.
        </p>
        <p className="text-muted">
          This pattern became public only after clearing a fixed bar, computed in code from the cases
          themselves: five or more cases, from five or more separate citizen records, with more than
          two days between the first filing and the last. Three of the six clusters in this prototype
          do not clear it, and stay private — you cannot reach their pages.
        </p>
        <p className="text-muted">
          One thing the bar does not yet include: a check that the cases did not all come from a single
          device. It is the right condition and it is not enforced here, because this synthetic corpus
          carries no device or session signal to check. On real submissions it would sit alongside the
          three above, and until it does we are not going to describe it as protection you have.
        </p>
      </section>

      <MockNote>
        Synthetic cases, invented office names, and one citizen record per synthetic complainant so the
        counts above mean what they say. The grouping logic and the visibility gate are real and run over
        this data; the pattern they are grouping is not. <Link href="/how-this-works" className="underline">More</Link>.
      </MockNote>
    </div>
  );
}
