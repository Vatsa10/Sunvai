-- 5. Clusters. Membership is DERIVED, never self-declared: there is no code path by which a
-- citizen inserts their own cluster_members row. See 03-agents/07-agent-cluster.md.

create table if not exists clusters (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  office_id     uuid references offices(id),
  centroid      vector(1536),
  first_seen_at timestamptz not null,
  last_seen_at  timestamptz not null,
  -- Public only when: >=5 members, >=5 distinct citizens, spread over >48h. Enforced in code,
  -- computed from cluster_members, never by a model and never hand-set — see the gate in
  -- supabase/seed/run.ts. A same-device condition belongs here too and is NOT implemented:
  -- there is no device or session signal on a submission yet to compute it from.
  is_public     boolean not null default false
);

create table if not exists cluster_members (
  cluster_id   uuid not null references clusters(id),
  grievance_id uuid not null references grievances(id),
  similarity   numeric(4,3) not null,
  added_at     timestamptz not null default now(),
  primary key (cluster_id, grievance_id)
);
