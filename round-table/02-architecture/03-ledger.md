# The Ledger

> Part of the [Sunvai Round Table](../README.md).
> **A tamper-evident, append-only, hash-chained event log in Postgres.**

---

## Why this exists

India's grievance system has [no consequence architecture and no independent
oversight](../00-mission/02-the-problem.md#failure-mode-5--no-consequence-architecture) —
the officials monitoring grievances are frequently from the same administrative cadre as
those being complained about. We cannot create a statutory ombudsman. We can create the
thing an ombudsman would need first: **a record that nobody, including us, can quietly
alter.**

The citizen benefit, in the words we actually use on screen:

> *"The department cannot quietly change your dates, rewrite what they told you, or
> backdate your clock. If they do, this file will not verify — and you will be able to
> show that to anyone."*

---

## On the word "blockchain"

We were going to call this a blockchain. We are not going to.

**What we need:** tamper-evidence, verifiability by the citizen, an ordered history.
**What a chain would add:** distributed consensus, immutability against the operator,
tokens, latency, cost, and operational complexity.

We need the first three. We do not need consensus, because there is exactly one writer.
A **hash chain** — the same primitive a blockchain is built on, without the distributed
agreement layer — delivers all three properties in about forty lines of SQL.

The framing rule ([`../00-mission/05-non-goals.md`](../00-mission/05-non-goals.md)):

| Never say | Always say |
|---|---|
| "blockchain-based" | "tamper-evident" |
| "immutable ledger on-chain" | "append-only, hash-chained record" |
| "decentralised trust" | "you can verify this yourself" |

Say *blockchain* to a 2026 judging panel and you spend your credibility defending the word.
Say *"the department cannot backdate your SLA and here is how you check"* and they
immediately want it.

**Honest limitation, stated plainly** (and on the how-this-works page): a hash chain proves
that history has not been *edited*. It does not prove the operator never wrote a false
entry in the first place. Defeating that requires anchoring — see
[Anchoring](#anchoring--the-production-answer) below.

---

## The mechanism

Every event carries the hash of the event before it.

```
seq 1   type: grievance_filed        prev: GENESIS  hash: a3f1…
seq 2   type: acknowledged           prev: a3f1…    hash: 9c02…
seq 3   type: assigned               prev: 9c02…    hash: 41bd…
seq 4   type: reply_received         prev: 41bd…    hash: e77a…
seq 5   type: audit_completed        prev: e77a…    hash: 2f5c…
seq 6   type: citizen_confirmed_unresolved  prev: 2f5c…  hash: b810…
seq 7   type: appeal_filed           prev: b810…    hash: 6d43…
```

Alter the `occurred_at` of seq 3 and its hash changes; seq 4's `prev_hash` no longer
matches; every hash from 4 onward is invalid. **One edit invalidates the entire remaining
chain**, and the citizen's downloaded receipt still holds the original values.

### Canonicalisation

The hash must be reproducible by anyone, in any language, so serialisation cannot be
ambiguous.

```
hash = sha256(
  prev_hash ‖ "\n" ‖
  seq       ‖ "\n" ‖
  type      ‖ "\n" ‖
  occurred_at (RFC3339, UTC, milliseconds) ‖ "\n" ‖
  canonical_json(payload)
)
```

`canonical_json` = **JCS (RFC 8785)**: keys sorted lexicographically, no insignificant
whitespace, UTF-8, no floats where an integer will do. Genesis `prev_hash` is 64 zeros.

> Specifying this precisely is what makes the verifier writable by a third party. An
> unspecified hash format is a claim, not a proof.

---

## Schema and enforcement

Append-only is enforced **by the database**, not by convention. A rule that lives only in
application code is a rule that a future edit removes by accident.

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

-- No updates. No deletes. Ever. By anyone.
create rule events_no_update as on update to events do instead nothing;
create rule events_no_delete as on delete to events do instead nothing;

revoke insert, update, delete on events from anon, authenticated;
```

The only writer is a `SECURITY DEFINER` function that computes the chain under a lock,
so concurrent appends cannot fork it:

```sql
create or replace function ledger_append(
  p_grievance_id uuid, p_citizen_id uuid,
  p_type text, p_payload jsonb
) returns events
language plpgsql security definer as $$
declare
  v_prev text;
  v_seq  bigint;
  v_at   timestamptz := now();
  v_hash text;
  v_row  events;
begin
  -- Serialise appends: the chain has exactly one head.
  perform pg_advisory_xact_lock(hashtext('sunvai_ledger'));

  select hash into v_prev from events order by seq desc limit 1;
  v_prev := coalesce(v_prev, repeat('0', 64));
  v_seq  := coalesce((select max(seq) from events), 0) + 1;

  v_hash := encode(digest(
      v_prev || E'\n' || v_seq || E'\n' || p_type || E'\n' ||
      to_char(v_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') || E'\n' ||
      jsonb_canonical(p_payload)          -- JCS helper
    , 'sha256'), 'hex');

  insert into events (grievance_id, citizen_id, type, payload, occurred_at, prev_hash, hash)
  values (p_grievance_id, p_citizen_id, p_type, p_payload, v_at, v_prev, v_hash)
  returning * into v_row;

  return v_row;
end $$;
```

**Transactional coupling.** A state change and its ledger event are written in **one
transaction**. If the event fails, the state change rolls back. There is no code path that
mutates a grievance without a corresponding event — that is what makes *"if it is not in
the ledger, it did not happen"* true rather than aspirational.

---

## Event taxonomy

```
  Filing        grievance_drafted · grievance_filed · consent_recorded
                assisted_filing_declared
  Department    acknowledged · assigned · transferred · reply_received · closed
  Ours          audit_started · audit_completed · audit_withheld
                citation_guard_failed
  Citizen       citizen_asked · citizen_confirmed_resolved
                citizen_confirmed_unresolved · confirmation_superseded
  Escalation    sla_warning · sla_breached · escalated
  Appeal        appeal_drafted · appeal_consented · appeal_filed · appeal_replied
  Cluster       cluster_membership_added · cluster_published
```

Note that **our own failures are event types.** `audit_withheld` and
`citation_guard_failed` are in the chain, publicly countable, and feed
[`our_error_rate`](02-data-model.md#derived-the-north-star). A ledger that only records
other people's behaviour is a weapon, not an audit.

---

## The citizen's receipt

Downloadable at any time from any case. A single JSON file:

```json
{
  "sunvai_receipt_version": 1,
  "grievance_ref": "DEMO/2026/0000472",
  "generated_at": "2026-08-22T11:04:00.000Z",
  "disclaimer": "Demo data. Not a government record.",
  "events": [
    { "seq": 1, "type": "grievance_filed", "occurred_at": "...",
      "payload": { ... }, "prev_hash": "000…0", "hash": "a3f1…" }
  ],
  "head_hash": "6d43…"
}
```

**Verification runs in the browser**, client-side, on the file the citizen holds — no
server call, so we cannot fake the result:

```
for each event in order:
    recomputed = sha256(prev_hash ‖ seq ‖ type ‖ occurred_at ‖ jcs(payload))
    if recomputed ≠ event.hash        → BROKEN at seq
    if event.prev_hash ≠ previous.hash → BROKEN at seq
→ VERIFIED
```

The UI shows: ✅ *"Verified — every one of these 7 steps is unedited, and each follows the
one before it."* or 🔴 *"This record has been changed
at step 3."* Drag any receipt file onto `/verify` — including one we did not issue.

**Demo moment:** the reviewer downloads a receipt, opens it in a text editor, changes one
date, drops it back on `/verify`, and watches it go red. Eight seconds, and the concept
lands completely.

---

## Anchoring — the production answer

State the limitation before a judge finds it: **a hash chain proves history has not been
edited. It does not prove the operator never wrote a false entry.** For a system making
claims about government accountability, the operator must not be the root of trust.

The production path, documented and deliberately unbuilt:

1. **Periodic head publication** — publish the head hash hourly to an append-only external
   location. Any later rewrite contradicts a value already published.
2. **Citizen-held receipts** — already built, and already effective: thousands of
   independently held receipts make a silent rewrite impractical.
3. **Third-party witness** — a civil-society body or the CIC co-signs the head hash on a
   schedule.
4. **RFC 3161 timestamping** — a trusted authority timestamps the head, proving it existed
   at a point in time.

None of these needs a blockchain. All are cheap. **We build (2); we specify (1), (3), (4)
and disclose them as unbuilt** in
[`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md).

---

## What this is not

- **Not** a blockchain — no consensus, no distributed validators, no token.
- **Not** proof that a department's *claim* is true — only that each step in the record is
  unedited and that consecutive steps follow one another. A receipt is one case's slice of a
  shared chain, so on its own it cannot prove that nothing was removed from the gaps between
  its steps; the word "unaltered" overclaimed that and the verifier no longer uses it.
- **Not** legally admissible evidence. It is a **verifiable civic record**, and we say so.
- **Not** a substitute for oversight. It is the substrate oversight would need.

---

## Cost

One extra row per state change. `sha256` over a small payload. At CPGRAMS's real scale —
~26 lakh grievances a year, ~8 events each — that is ~2 crore rows annually, a few GB, with
a single indexed integer key. Postgres does not notice. See
[`05-scale-and-safety.md`](05-scale-and-safety.md).

The advisory lock serialises appends. At the demo's scale this is free; at national scale
it becomes per-shard — see the same document.

---

**Next:** [`04-adapters.md`](04-adapters.md) — how this connects to the real world.
