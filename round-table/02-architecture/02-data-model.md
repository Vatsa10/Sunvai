# Data Model

> Part of the [Sunvai Round Table](../README.md). Supabase Postgres. Every table has Row
> Level Security. The `events` table is append-only and hash-chained —
> see [`03-ledger.md`](03-ledger.md).

**All data in this build is synthetic.** See [`../04-build/03-mock-data.md`](../04-build/03-mock-data.md).

---

## Entity relationships

```
  citizens ──┬──< grievances >──── departments ──< offices
             │        │
             │        ├──< replies         (what the department said)
             │        ├──< audits          (what we judged)      ★
             │        ├──< confirmations   (what the citizen said) ★★
             │        ├──< appeals
             │        ├──< attachments
             │        └──< cluster_members >── clusters
             │
             └──< events  (the ledger — every state change, all entities)
```

★ informs the citizen ★★ **is the metric** — see
[`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#1b-write-replies-that-pass-the-auditor-without-solving-anything)

---

## Core tables

### `citizens`

```sql
create table citizens (
  id                uuid primary key default gen_random_uuid(),
  -- Synthetic. Never a real phone number. See mock-data doc.
  phone_hash        text not null unique,      -- sha256(phone + pepper)
  display_name      text not null,
  preferred_lang    text not null default 'hi' -- ISO 639-1: hi|en|bn|ta|te|mr
                    check (preferred_lang in ('hi','en','bn','ta','te','mr')),
  prefers_audio     boolean not null default true,
  created_at        timestamptz not null default now(),
  is_demo           boolean not null default true   -- labelled in UI
);
```

> **`phone_hash`, never `phone`.** We match returning citizens by hashing the number they
> type. We never need the plaintext, so we never store it. This is a small decision that
> makes the honest answer to *"what happens to my data"* short.

### `departments` and `offices`

```sql
create table departments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                 -- 'Employees Provident Fund Organisation'
  short_name    text not null,                 -- 'EPFO'
  category_path text[] not null,               -- routing taxonomy, coarse → fine
  sla_days      int  not null default 21,      -- Aug 2024 guidelines
  appeal_sla_days int not null default 30
);

create table offices (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id),
  name          text not null,                 -- 'Regional Office, Hyderabad'
  state         text not null,
  district      text,
  jurisdiction  text                           -- how routing decides this office
);
```

> **Aggregation is by `office`, never by an individual official.** There is deliberately no
> `officials` table with performance data. See
> [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#what-we-deliberately-do-not-do).

### `grievances`

```sql
create type grievance_status as enum (
  'draft','filed','acknowledged','assigned','replied',
  'closed','appealed','appeal_replied','appeal_closed','reopened'
);

create table grievances (
  id                 uuid primary key default gen_random_uuid(),
  citizen_id         uuid not null references citizens(id),
  filed_by_citizen_id uuid references citizens(id),  -- assisted filing: the helper
  filed_by_relation  text,                            -- 'son' | 'CSC operator' | ...
  consent_recorded   boolean not null default false,  -- required when filed_by ≠ citizen

  external_ref       text,          -- registration number in the source system
  source_system      text not null default 'mock_cpgrams',
  imported           boolean not null default false,  -- Door A vs Door B

  department_id      uuid references departments(id),
  office_id          uuid references offices(id),

  original_lang      text not null,
  narrative_original text not null,   -- the citizen's own words, never overwritten
  narrative_formal   text,            -- Drafter output, official language
  subject            text,

  status             grievance_status not null default 'draft',
  filed_at           timestamptz,
  sla_due_at         timestamptz,
  closed_at          timestamptz,

  created_at         timestamptz not null default now()
);

create index on grievances (citizen_id);
create index on grievances (office_id, status);
create index on grievances (sla_due_at) where status not in ('closed','appeal_closed');
```

> **`narrative_original` is never overwritten.** The citizen's own words in their own
> language are the ground truth of what they asked for, and the Closure Auditor judges the
> reply against *this*, not against the formal draft we generated. If we judged against our
> own draft, we would be grading our own homework.

### `replies` — what the department said

```sql
create table replies (
  id            uuid primary key default gen_random_uuid(),
  grievance_id  uuid not null references grievances(id),
  body          text not null,        -- raw, verbatim, never cleaned or normalised
  body_lang     text not null default 'en',
  is_final      boolean not null default false,  -- accompanied closure
  received_at   timestamptz not null default now()
);
```

> **`body` is stored verbatim.** The [citation guard](03-ledger.md) string-matches audit
> citations against this exact text. Normalising whitespace here would silently break the
> hallucination check.

### `audits` ★ — what we judged

```sql
create type audit_verdict as enum (
  'resolved','partial','deflected','boilerplate','non_responsive','undetermined'
);

create table audits (
  id            uuid primary key default gen_random_uuid(),
  grievance_id  uuid not null references grievances(id),
  reply_id      uuid not null references replies(id),

  verdict       audit_verdict not null,
  confidence    numeric(3,2) not null check (confidence between 0 and 1),
  reasoning     text not null,          -- shown to the citizen, always
  citations     jsonb not null,         -- [{quote, start, end}] verbatim from replies.body
  citations_verified boolean not null default false,

  model         text not null,          -- for reproducibility
  prompt_version text not null,
  created_at    timestamptz not null default now()
);
```

`undetermined` is a real verdict, not an error state. *"We could not judge this one — read
it yourself and tell us"* is an honest output. See
[`../01-product/04-content-and-voice.md`](../01-product/04-content-and-voice.md#strings-we-will-get-asked-about).

### `confirmations` ★★ — what the citizen said. **This is the metric.**

```sql
create table confirmations (
  id            uuid primary key default gen_random_uuid(),
  grievance_id  uuid not null references grievances(id),
  citizen_id    uuid not null references citizens(id),

  resolved      boolean not null,   -- "did your problem actually get fixed?"
  note          text,
  asked_via     text not null,      -- 'web' | 'voice' | 'whatsapp'
  asked_at      timestamptz not null,
  answered_at   timestamptz not null default now(),

  supersedes_id uuid references confirmations(id)  -- reversible; both rows kept
);

create unique index on confirmations (grievance_id)
  where supersedes_id is null;
```

> Confirmations are **reversible but never deleted.** A citizen who said "yes, fixed" and
> then finds it broken again files a superseding row; both remain, both are in the ledger.
> This closes the "pressure the citizen into confirming" attack — the pressure is undoable
> and the reversal is visible.

### `appeals`

```sql
create table appeals (
  id             uuid primary key default gen_random_uuid(),
  grievance_id   uuid not null references grievances(id),
  audit_id       uuid references audits(id),      -- the inadequacy being cited
  body_formal    text not null,
  body_citizen_lang text not null,                -- the back-translation shown at consent
  status         text not null default 'drafted'  -- drafted | consented | sent | replied
                 check (status in ('drafted','consented','sent','replied')),
  consented_at   timestamptz,
  sent_at        timestamptz,
  appeal_due_at  timestamptz
);
```

> `status` starts at **`drafted`**, not `sent`. The appeal exists before the citizen sees
> it — that is the friction we remove — but it does not leave the building without the
> [consent gate](../01-product/01-citizen-journey.md#step-5--routed-visibly-then-consented).

### `clusters` and `cluster_members`

```sql
create table clusters (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,       -- 'Pension disbursement stoppage · Bihar'
  office_id     uuid references offices(id),
  centroid      vector(1536),        -- pgvector, text-embedding-3-small
  first_seen_at timestamptz not null,
  last_seen_at  timestamptz not null,
  is_public     boolean not null default false   -- gated by anti-astroturf thresholds
);

create table cluster_members (
  cluster_id    uuid not null references clusters(id),
  grievance_id  uuid not null references grievances(id),
  similarity    numeric(4,3) not null,
  added_at      timestamptz not null default now(),
  primary key (cluster_id, grievance_id)
);
```

> Membership is **derived, never self-declared.** There is no path for a citizen to insert
> their own `cluster_members` row. `is_public` requires ≥5 members, ≥5 distinct citizens,
> spread over >48h, not single-device origin — enforced in the recompute job. See
> [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#clusters-are-derived-not-declared).

### `attachments`

```sql
create table attachments (
  id            uuid primary key default gen_random_uuid(),
  grievance_id  uuid not null references grievances(id),
  storage_path  text not null,          -- Supabase Storage, private bucket
  kind          text not null,          -- 'document' | 'audio'
  extracted     jsonb,                  -- Document Agent output
  readable      boolean,                -- false → tell the citizen BEFORE filing
  created_at    timestamptz not null default now()
);
```

### `events` — the ledger

Full specification, including the hash chain and the append-only enforcement, in
[`03-ledger.md`](03-ledger.md). Summary:

```sql
create table events (
  seq           bigserial primary key,
  grievance_id  uuid references grievances(id),
  citizen_id    uuid references citizens(id),
  type          text not null,
  payload       jsonb not null,
  occurred_at   timestamptz not null default now(),
  prev_hash     text not null,
  hash          text not null unique
);
```

---

## Row Level Security

RLS is on for **every** table. The guarantee we want to be able to demonstrate to a judge
is: *"a citizen cannot read another citizen's grievance, and that is enforced by the
database, not by our application code."*

```sql
alter table grievances    enable row level security;
alter table replies       enable row level security;
alter table audits        enable row level security;
alter table confirmations enable row level security;
alter table appeals       enable row level security;
alter table attachments   enable row level security;
alter table events        enable row level security;
alter table citizens      enable row level security;

-- A citizen sees their own grievances, and those they filed on someone's behalf.
create policy grievance_own on grievances for select
  using ( citizen_id = auth.uid() or filed_by_citizen_id = auth.uid() );

-- Child records inherit visibility from the parent grievance.
create policy replies_own on replies for select
  using ( exists (
    select 1 from grievances g
    where g.id = replies.grievance_id
      and (g.citizen_id = auth.uid() or g.filed_by_citizen_id = auth.uid())
  ));
-- ...identical shape for audits, confirmations, appeals, attachments, events.

-- Nobody writes the ledger directly. Only the SECURITY DEFINER append function.
create policy events_no_direct_insert on events for insert with check ( false );

-- Aggregates are public; individual rows are not. Served from a view that
-- exposes counts only, never grievance text or citizen identity.
```

**Public aggregate surfaces** (`/numbers`, `/cluster/[id]`) read from
`SECURITY INVOKER` views that expose **counts and offices only** — never narrative text,
never citizen identity. Cluster pages show *"46 people"*, never who.

---

## Derived: the north star

```sql
create view true_resolution_rate as
select
  o.id as office_id,
  o.name,
  count(*) filter (where g.status in ('closed','appeal_closed'))        as disposed,
  count(*) filter (where c.resolved is true)                            as citizen_confirmed_resolved,
  count(*) filter (where c.id is not null)                              as citizens_asked,
  round(100.0 * count(*) filter (where c.resolved is true)
        / nullif(count(*) filter (where c.id is not null), 0), 1)       as true_resolution_pct
from grievances g
join offices o on o.id = g.office_id
left join confirmations c
       on c.grievance_id = g.id and c.supersedes_id is null
group by o.id, o.name;
```

Note what this computes from: **`confirmations`, not `audits`.** The audit never touches
the metric. That is the whole design.

And the disconfirming view we publish about ourselves:

```sql
create view our_error_rate as
select
  count(*) filter (where a.verdict = 'resolved'      and c.resolved = false) as too_soft,
  count(*) filter (where a.verdict in ('deflected','boilerplate','non_responsive')
                   and c.resolved = true)                                    as too_harsh,
  count(*)                                                                   as total_compared
from audits a
join confirmations c
  on c.grievance_id = a.grievance_id and c.supersedes_id is null;
```

---

## Migration order

1. extensions — `pgcrypto`, `vector`
2. enums
3. `citizens` → `departments` → `offices`
4. `grievances` → `replies` → `audits` → `confirmations` → `appeals` → `attachments`
5. `clusters` → `cluster_members`
6. `events` + `ledger_append()` + append-only triggers ([`03-ledger.md`](03-ledger.md))
7. RLS policies
8. views
9. seed ([`../04-build/03-mock-data.md`](../04-build/03-mock-data.md))

---

**Next:** [`03-ledger.md`](03-ledger.md) — the tamper-evident record.
