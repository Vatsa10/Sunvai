-- 16. A superseded confirmation names the answer that replaced it.
--
-- `confirmResolution()` used to run `set supersedes_id = $1 where id = $1`, pointing the old
-- row at itself. It satisfied the partial unique index — only one confirmation per grievance
-- may have a null `supersedes_id`, and that is what "live" means — so the published resolution
-- rate was never affected. But a row that supersedes itself records nothing: a citizen who
-- changed her answer twice left a history that could not be walked, on a product whose claim
-- is that if it is not in the ledger it did not happen.
--
-- Writing the real link needs the old row to name the new one, and the new row cannot exist
-- yet: the moment it is inserted with a null `supersedes_id` there would briefly be two live
-- confirmations for the grievance. So the id is generated in the action, the old row is
-- pointed at it, and the new row is inserted second. That order requires this foreign key to
-- be checked at commit rather than per statement.
--
-- Deferred, not dropped. At commit the reference still has to resolve, so a dangling
-- supersedes_id remains impossible.

alter table confirmations
  drop constraint if exists confirmations_supersedes_id_fkey;

alter table confirmations
  add constraint confirmations_supersedes_id_fkey
  foreign key (supersedes_id) references confirmations(id)
  deferrable initially deferred;
