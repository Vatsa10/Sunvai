-- 3. Citizens, departments, offices.

create table if not exists citizens (
  id                uuid primary key default gen_random_uuid(),
  phone_hash        text not null unique,      -- sha256(phone + LEDGER_PEPPER). Never the phone.
  display_name      text not null,
  preferred_lang    text not null default 'hi'
                    check (preferred_lang in ('hi','en','bn','ta','te','mr')),
  prefers_audio     boolean not null default true,
  created_at        timestamptz not null default now(),
  is_demo           boolean not null default true
);

create table if not exists departments (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  short_name      text not null,
  category_path   text[] not null,
  sla_days        int not null default 21,
  appeal_sla_days int not null default 30
);

-- Deliberately no `officials` table: we aggregate by office, never by named individual.
-- See 02-architecture/05-scale-and-safety.md (retaliation) and 00-mission/05-non-goals.md.
create table if not exists offices (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id),
  name          text not null,
  state         text not null,
  district      text,
  jurisdiction  text,
  lat           numeric(8,5),   -- cluster map only; office locations, never citizen locations
  lon           numeric(8,5)
);
