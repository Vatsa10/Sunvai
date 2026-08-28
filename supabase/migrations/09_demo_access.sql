-- 9. Demo access.
--
-- The brief says reviewers must reach the whole citizen journey without being asked to log
-- in, and every row in this database is synthetic. So demo rows are readable by `anon` —
-- explicitly, by policy, rather than by us bypassing RLS with a service-role key everywhere.
--
-- The citizen-scoped policies in 07_rls.sql stay exactly as they are. They are the
-- production path, they are shipped, and on real data they are what isolates one citizen
-- from another. Disclosed on /how-this-works: in this demo they are not what is protecting
-- anything, because there is nothing to protect.

create or replace function is_demo_grievance(g_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from grievances g join citizens c on c.id = g.citizen_id
    where g.id = g_id and c.is_demo
  );
$$;

do $$ begin
  create policy citizens_demo_readable on citizens for select using (is_demo);
  create policy grievances_demo_readable on grievances for select
    using (exists (select 1 from citizens c where c.id = grievances.citizen_id and c.is_demo));

  create policy replies_demo_readable       on replies       for select using (is_demo_grievance(grievance_id));
  create policy audits_demo_readable        on audits        for select using (is_demo_grievance(grievance_id));
  create policy confirmations_demo_readable on confirmations for select using (is_demo_grievance(grievance_id));
  create policy appeals_demo_readable       on appeals       for select using (is_demo_grievance(grievance_id));
  create policy attachments_demo_readable   on attachments   for select using (is_demo_grievance(grievance_id));
  create policy events_demo_readable        on events        for select using (is_demo_grievance(grievance_id));
exception when duplicate_object then null; end $$;

-- Aggregates. These views expose counts and office names only — never narrative text,
-- never a citizen, never a named official.
-- `our_error_rate` and `simulated_corpus_rate` are not granted here: they do not exist yet at
-- this point in the folder. Both are created and granted together in 11, so that the view and
-- the permission to read it can never drift apart by ordering.
grant select on true_resolution_rate, headline_numbers to anon, authenticated;

-- Writes still go only through Server Actions using the service role, and every write is
-- paired with ledger_append() in the same transaction.
revoke insert, update, delete on
  citizens, grievances, replies, audits, confirmations, appeals, attachments,
  clusters, cluster_members
from anon, authenticated;
