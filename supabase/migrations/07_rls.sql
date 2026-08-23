-- 7. Row Level Security. Cross-citizen isolation is enforced by Postgres, not by our code.

alter table citizens      enable row level security;
alter table grievances    enable row level security;
alter table replies       enable row level security;
alter table audits        enable row level security;
alter table confirmations enable row level security;
alter table appeals       enable row level security;
alter table attachments   enable row level security;
alter table events        enable row level security;

-- Reference data is public: departments, offices and cluster shapes carry no personal data.
alter table departments     enable row level security;
alter table offices         enable row level security;
alter table clusters        enable row level security;
alter table cluster_members enable row level security;

do $$ begin
  create policy departments_readable on departments for select using (true);
  create policy offices_readable     on offices     for select using (true);
  -- Only clusters that passed the public-visibility gate. Counts only; the join to
  -- grievances is still blocked by the grievance policy below.
  create policy clusters_public on clusters for select using (is_public);
  create policy cluster_members_public on cluster_members for select using (
    exists (select 1 from clusters c where c.id = cluster_members.cluster_id and c.is_public)
  );

  create policy citizens_self on citizens for select using (id = auth.uid());

  -- A citizen sees their own grievances, and those they filed on someone's behalf.
  create policy grievance_own on grievances for select
    using (citizen_id = auth.uid() or filed_by_citizen_id = auth.uid());

  create policy replies_own on replies for select using (exists (
    select 1 from grievances g where g.id = replies.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())));

  create policy audits_own on audits for select using (exists (
    select 1 from grievances g where g.id = audits.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())));

  create policy confirmations_own on confirmations for select using (exists (
    select 1 from grievances g where g.id = confirmations.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())));

  create policy appeals_own on appeals for select using (exists (
    select 1 from grievances g where g.id = appeals.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())));

  create policy attachments_own on attachments for select using (exists (
    select 1 from grievances g where g.id = attachments.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())));

  create policy events_own on events for select using (exists (
    select 1 from grievances g where g.id = events.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())));

  -- Nobody writes the ledger directly. Only ledger_append(), which is SECURITY DEFINER.
  create policy events_no_direct_insert on events for insert with check (false);
exception when duplicate_object then null; end $$;
