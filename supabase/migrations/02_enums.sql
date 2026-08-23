-- 2. Enums.
do $$ begin
  create type grievance_status as enum (
    'draft','filed','acknowledged','assigned','replied',
    'closed','appealed','appeal_replied','appeal_closed','reopened'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  -- 'undetermined' is a real verdict, not an error. See 03-agents/05-agent-closure-auditor.md.
  create type audit_verdict as enum (
    'resolved','partial','deflected','boilerplate','non_responsive','undetermined'
  );
exception when duplicate_object then null; end $$;
