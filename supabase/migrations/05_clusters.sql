-- 5. Clusters. Membership is DERIVED, never self-declared: there is no code path by which a
-- citizen inserts their own cluster_members row. See 03-agents/07-agent-cluster.md.

create table if not exists clusters (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  office_id     uuid references offices(id),
  centroid      vector(1536),
  first_seen_at timestamptz not null,
  last_seen_at  timestamptz not null,
  -- Public only when: >=5 members, >=5 distinct citizens, spread over >48h, not one device.
  -- Enforced by the recompute job, in code, never by a model.
  is_public     boolean not null default false
);

create table if not exists cluster_members (
  cluster_id   uuid not null references clusters(id),
  grievance_id uuid not null references grievances(id),
  similarity   numeric(4,3) not null,
  added_at     timestamptz not null default now(),
  primary key (cluster_id, grievance_id)
);
