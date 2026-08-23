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
 * a gate applied in code: at least five cases, from at least five distinct people, spread over
 * more than forty-eight hours. Without that, one motivated person with five devices can
 * manufacture a public accusation, and we would have built a machine for doing it.
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

  const stats = await one<{ members: string; closed: string; unresolved: string; asked: string; fixed: string }>(
    `select count(*) as members,
            count(*) filter (where g.status in ('closed','appeal_closed')) as closed,
            count(*) filter (where g.status in ('closed','appeal_closed')
                               and coalesce(cf.resolved, false) = false)   as unresolved,
            count(*) filter (where cf.id is not null)                      as asked,
            count(*) filter (where cf.resolved is true)                    as fixed
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
  const unresolved = Number(stats?.unresolved ?? 0);
  const fixed = Number(stats?.fixed ?? 0);

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
          <strong className="tabular-nums">{unresolved}</strong> of those were closed without the problem being
          fixed.
        </p>
        <p className="mt-3 text-2xl leading-snug">
          <strong className="tabular-nums">{fixed}</strong> have told us it is actually sorted.
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
          This pattern became public only after clearing a fixed bar: five or more cases, from five or more
          separate people, spread over more than two days, not originating from one device. Three of the six
          clusters in this prototype do not clear it, and stay private.
        </p>
      </section>

      <MockNote>
        Synthetic cases, invented office names. The grouping logic and the visibility gate are real; the
        pattern they are grouping is not. <Link href="/how-this-works" className="underline">More</Link>.
      </MockNote>
    </div>
  );
}
