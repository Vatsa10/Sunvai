-- 6. The ledger: append-only, hash-chained. See 02-architecture/03-ledger.md.
-- Never call this a blockchain. It is a hash chain in Postgres that you can verify yourself.

create table if not exists events (
  seq          bigserial primary key,
  grievance_id uuid references grievances(id),
  citizen_id   uuid references citizens(id),
  type         text not null,
  payload      jsonb not null,
  occurred_at  timestamptz not null default now(),
  prev_hash    text not null,
  hash         text not null unique
);

create index if not exists events_grievance_idx on events (grievance_id, seq);

-- RFC 8785 (JCS) canonical JSON. Must produce byte-identical output to
-- src/lib/ledger/canonical-json.ts, or receipts issued by the server will not verify in the
-- browser. Constraint we accept: payload keys are ASCII, numbers are integers.
create or replace function jsonb_canonical(j jsonb) returns text
language plpgsql immutable as $$
declare
  k text;
  e jsonb;
  parts text[] := '{}';
begin
  case jsonb_typeof(j)
    when 'object' then
      for k in select key from jsonb_object_keys(j) as key order by key collate "C" loop
        parts := parts || (to_json(k)::text || ':' || jsonb_canonical(j -> k));
      end loop;
      return '{' || array_to_string(parts, ',') || '}';
    when 'array' then
      for e in select value from jsonb_array_elements(j) loop
        parts := parts || jsonb_canonical(e);
      end loop;
      return '[' || array_to_string(parts, ',') || ']';
    when 'string'  then return to_json(j #>> '{}')::text;
    when 'number'  then return j::text;
    when 'boolean' then return j::text;
    else return 'null';
  end case;
end $$;

-- The ONLY writer. Everything else is revoked below.
create or replace function ledger_append(
  p_grievance_id uuid,
  p_citizen_id   uuid,
  p_type         text,
  p_payload      jsonb
) returns events
language plpgsql security definer
-- Supabase installs pgcrypto into the `extensions` schema, so digest() is not on the
-- default path for a SECURITY DEFINER function.
set search_path = public, extensions
as $$
declare
  v_prev text;
  v_seq  bigint;
  v_at   timestamptz := now();
  v_hash text;
  v_row  events;
begin
  -- One head. Serialising appends is free at demo scale; at national scale this shards
  -- per department (specified in 03-ledger.md, deliberately not built).
  perform pg_advisory_xact_lock(hashtext('sunvai_ledger'));

  select hash into v_prev from events order by seq desc limit 1;
  v_prev := coalesce(v_prev, repeat('0', 64));
  v_seq  := coalesce((select max(seq) from events), 0) + 1;

  v_hash := encode(digest(
      v_prev || E'\n' ||
      v_seq  || E'\n' ||
      p_type || E'\n' ||
      to_char(v_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') || E'\n' ||
      jsonb_canonical(p_payload)
    , 'sha256'::text), 'hex');

  insert into events (seq, grievance_id, citizen_id, type, payload, occurred_at, prev_hash, hash)
  values (v_seq, p_grievance_id, p_citizen_id, p_type, p_payload, v_at, v_prev, v_hash)
  returning * into v_row;

  -- Keep the sequence ahead of hand-assigned seq values.
  perform setval(pg_get_serial_sequence('events','seq'), v_seq);

  return v_row;
end $$;

-- No updates. No deletes. Ever. By anyone, including us.
create or replace rule events_no_update as on update to events do instead nothing;
create or replace rule events_no_delete as on delete to events do instead nothing;

revoke insert, update, delete on events from anon, authenticated;
