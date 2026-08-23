-- 4. The case record and everything hanging off it.

create table if not exists grievances (
  id                  uuid primary key default gen_random_uuid(),
  citizen_id          uuid not null references citizens(id),
  filed_by_citizen_id uuid references citizens(id),   -- assisted filing: helper != aggrieved
  filed_by_relation   text,
  consent_recorded    boolean not null default false,

  external_ref        text,
  source_system       text not null default 'mock_cpgrams',
  imported            boolean not null default false, -- true = Door A, false = Door B

  department_id       uuid references departments(id),
  office_id           uuid references offices(id),

  original_lang       text not null,
  -- The citizen's own words. NEVER overwritten. The Closure Auditor judges the department's
  -- reply against this, not against narrative_formal — we do not grade our own Drafter.
  narrative_original  text not null,
  narrative_formal    text,
  subject             text,

  status              grievance_status not null default 'draft',
  filed_at            timestamptz,
  sla_due_at          timestamptz,
  closed_at           timestamptz,

  created_at          timestamptz not null default now()
);

create index if not exists grievances_citizen_idx on grievances (citizen_id);
create index if not exists grievances_office_status_idx on grievances (office_id, status);
create index if not exists grievances_sla_idx on grievances (sla_due_at)
  where status not in ('closed','appeal_closed');

create table if not exists replies (
  id           uuid primary key default gen_random_uuid(),
  grievance_id uuid not null references grievances(id),
  -- Stored VERBATIM and never normalised: the citation guard string-matches against this
  -- exact text, so collapsing whitespace would silently break the hallucination check.
  body         text not null,
  body_lang    text not null default 'en',
  is_final     boolean not null default false,
  received_at  timestamptz not null default now()
);

create table if not exists audits (
  id                 uuid primary key default gen_random_uuid(),
  grievance_id       uuid not null references grievances(id),
  reply_id           uuid not null references replies(id),

  verdict            audit_verdict not null,
  confidence         numeric(3,2) not null check (confidence between 0 and 1),
  reasoning          text not null,          -- always shown to the citizen
  citations          jsonb not null,         -- [{quote}] verbatim spans of replies.body
  unaddressed        jsonb not null default '[]'::jsonb,
  citations_verified boolean not null default false,
  injection_suspected boolean not null default false,

  model              text not null,
  prompt_version     text not null,          -- verdicts must be reproducible if challenged
  created_at         timestamptz not null default now()
);

-- ★★ This table is the metric. Not audits.
create table if not exists confirmations (
  id            uuid primary key default gen_random_uuid(),
  grievance_id  uuid not null references grievances(id),
  citizen_id    uuid not null references citizens(id),

  resolved      boolean not null,
  note          text,
  asked_via     text not null,               -- 'web' | 'voice' | 'whatsapp'
  asked_at      timestamptz not null,
  answered_at   timestamptz not null default now(),

  supersedes_id uuid references confirmations(id)  -- reversible, never deleted
);

create unique index if not exists confirmations_one_live_per_grievance
  on confirmations (grievance_id) where supersedes_id is null;

create table if not exists appeals (
  id                uuid primary key default gen_random_uuid(),
  grievance_id      uuid not null references grievances(id),
  audit_id          uuid references audits(id),
  body_formal       text not null,
  body_citizen_lang text not null,
  grounds           jsonb not null default '[]'::jsonb,
  -- Drafted automatically; only the citizen's consent moves it past 'drafted'.
  status            text not null default 'drafted'
                    check (status in ('drafted','consented','sent','replied')),
  consented_at      timestamptz,
  sent_at           timestamptz,
  appeal_due_at     timestamptz,
  external_ref      text
);

create table if not exists attachments (
  id           uuid primary key default gen_random_uuid(),
  grievance_id uuid not null references grievances(id),
  storage_path text not null,      -- private bucket, signed URLs only
  kind         text not null,      -- 'document' | 'audio'
  extracted    jsonb,              -- Document Agent output; never an Aadhaar/PAN number
  readable     boolean,            -- false => tell the citizen BEFORE filing
  created_at   timestamptz not null default now()
);
