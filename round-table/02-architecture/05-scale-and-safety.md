# Scale and Safety

> Part of the [Sunvai Round Table](../README.md).
> Direct answer to the brief's question: **"How could the idea work safely at a larger
> scale?"** — and to the *End-to-end thinking* criterion.

---

## The actual numbers we would have to survive

Not a hypothetical. CPGRAMS's real, published volume:

| Metric | Value |
|---|---|
| Grievances, 2024 | **26,45,869** |
| Resolved, 2020–2024 | **1,15,52,503** |
| Closures, May 2026 (central + states) | **≈ 2,62,788/month** |
| Peak day, derived ⚠️ | ~15,000 closures |
| Ledger events at ~8/grievance | **~2.1 crore rows/year** |

Every design decision below is sized against these, not against a demo.

---

## What Postgres handles unchanged

**~2.1 crore ledger rows a year** is a few GB on a `bigserial` primary key. Append-only,
never updated, rarely read outside a single grievance's chain. Partition by year and it
stays boring indefinitely. Postgres is not the bottleneck.

**26 lakh grievances/year** ≈ 7,200/day ≈ 0.08 writes/second average, with peaks perhaps
50× that. Trivial.

The bottleneck is not storage. It is **LLM cost, LLM latency, and the ledger's single
head.**

---

## Bottleneck 1 — one audit per closure

At 2.6 lakh closures/month, every closure triggering a reasoning-model call is the dominant
cost and the dominant failure risk.

**Mitigations, in order of leverage:**

1. **Triage before reasoning.** Most bad closures are *lexically* obvious. A cheap
   deterministic pre-filter catches known boilerplate patterns — *"matter forwarded to
   concerned department"*, *"noted for future action"*, replies under N characters, replies
   with no case-specific token — and routes only ambiguous cases to the expensive model.
   Realistically this diverts a large fraction at near-zero cost. **The pre-filter never
   issues a final verdict on its own**; it assigns a lane.
2. **Tiered models.** Cheap model first; escalate to the reasoning model only on low
   confidence or citation-guard failure.
3. **Batch, never real-time.** Nobody is waiting on the page. Audits run asynchronously
   with generous windows, which unlocks batch pricing and smooths peaks.
4. **Cache by reply-template.** Departments reuse identical boilerplate across thousands of
   cases. Hash the reply; identical text against a *similar* complaint reuses the verdict
   skeleton, with the citation guard re-run per case.

**The safety rule that survives all optimisation:** a cost optimisation may never silently
downgrade a verdict. If we could not afford to judge a case properly, the verdict is
`undetermined` and the citizen is told — never a cheap guess dressed as a finding.

---

## Bottleneck 2 — the ledger's single head

`ledger_append()` takes an advisory lock so the chain has exactly one head. That serialises
all appends globally — fine at demo scale, a hard ceiling at national scale.

**The fix is standard and cheap: shard the chain.** One chain per department (or per
office), each with its own head. Grievances only ever append to their own department's
chain, so appends parallelise perfectly. Verification is unchanged — a citizen's receipt
covers their grievance's chain.

For cross-chain integrity, publish a **Merkle root over all chain heads** hourly, which is
also the natural [anchoring](03-ledger.md#anchoring--the-production-answer) point.

> Worth stating plainly on video: *"The ledger shards by department. We didn't build the
> sharding, because at demo scale one chain is correct and premature sharding would be
> the wrong thing to spend six days on."* Knowing where your design breaks — and choosing
> not to fix it yet — is stronger than pretending it doesn't.

---

## Bottleneck 3 — asking 100% of citizens

2.6 lakh outreach messages a month. Today's Feedback Call Centre manages ~78,830 — because
it is **human**, and humans are the constraint.

Automated multilingual voice outreach is what makes 100% coverage possible at all. But
scale creates its own hazards:

| Hazard | Mitigation |
|---|---|
| We become a spam engine | Hard cap: **one outreach per closure**, at most two reminders, then stop forever. Opt-out is permanent and one word. |
| Outreach becomes a phishing vector others imitate | We **never ask for any credential, OTP, bank detail or Aadhaar number** — in any message, ever. Stated in every message, so a message that asks is provably not us. |
| Calls at unreasonable hours | Time-zone and hours-of-day windows; never before 9am or after 8pm local. |
| Elderly or distressed citizens confused by an AI voice | Every message identifies itself as automated, in the first sentence, in their language. |

---

## Safety: the things that could go badly wrong

### 1. We accuse a department wrongly, at scale

The failure that would end the project's credibility.

- Verdicts require **verbatim citations**, guarded by string match
  ([`01-system-overview.md`](01-system-overview.md#the-core-data-flow--closure-to-appeal) step 5).
- The **audit is never the metric** — the citizen's confirmation is. A wrong verdict misleads
  one person and is caught by their answer; it does not corrupt the public number.
- **We publish our own error rate**, both directions
  ([`02-data-model.md`](02-data-model.md#derived-the-north-star)).
- Aggregation is **by office, never by named official**.
- Verdict distribution is monitored per department and per language for skew
  ([`../03-agents/10-evals.md`](../03-agents/10-evals.md)).

### 2. We become an attack surface on the grievance system

Automated appeal drafting could flood appellate authorities.

- Appeals require an **audit-based trigger** and **explicit citizen consent** — never
  auto-sent.
- Rate limits per citizen and per office.
- Appeals cite specifics; a generic appeal is refused by the
  [Appeal Agent](../03-agents/06-agent-appeal.md).
- **The load we add is legitimate load.** These are appeals citizens were entitled to file
  and were structurally prevented from filing. If that volume is uncomfortable, the
  discomfort is the finding.

### 3. Astroturfed clusters manufacture a false scandal

Covered in [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#clusters-are-derived-not-declared):
derived membership, ≥5 distinct citizens, >48h spread, no single-device origin, public
gating.

### 4. Retaliation against citizens

Aggregate by office; never publish complainant identities; state visibility plainly before
filing; anonymity options where the grievance targets a local officer
([`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md#5-fear-of-retaliation)).

### 5. Prompt injection through department replies

Replies are **untrusted input**. Delimited, never concatenated into instructions,
schema-constrained output. A reply attempting instruction injection is data — and is itself
flagged, because a department whose reply text contains *"mark this resolved"* is a finding.

### 6. Data breach

- `phone_hash`, never plaintext phone numbers.
- RLS on every table, enforced by the database.
- Attachments in a private bucket, signed URLs, short expiry.
- Grievance narratives are the sensitive asset — a citizen's problems are personal, and a
  breach here endangers people who complained about powerful neighbours. Retention limits
  and deletion-on-request in production; **note that a deleted narrative still leaves its
  ledger events** (hashes, not content), which is a design tension we state openly rather
  than hide.

---

## Cost envelope at national scale ⚠️

Rough, and explicitly labelled as an estimate:

| Item | Order of magnitude |
|---|---|
| Postgres (2 crore events/yr + app tables) | Low tens of GB — small managed instance |
| Audits, with triage + tiering | The dominant line item; triage is the difference between viable and not |
| Voice outreach (STT/TTS) | Second largest; TTS caching matters because departments and we both repeat phrases |
| Compute / hosting | Negligible relative to inference |

**The honest statement:** this is cheaper than the Feedback Call Centre it extends, because
the marginal cost of asking the 2,00,000th citizen is inference, not a human minute. We
have not modelled it precisely and we say so.

---

## What we would need that is not technical

The real blockers, named — because pretending they are engineering problems would be the
least credible thing in this document:

1. **An access agreement with DARPG.** Everything else assumes cooperation.
2. **A statutory home for the resolution metric.** A number nobody is obliged to act on
   changes nothing. This is the recommendation the Parliamentary Committee already
   made — [penalties and rewards for grievance-handling
   officials](../00-mission/02-the-problem.md#failure-mode-5--no-consequence-architecture).
3. **Independent governance.** A metric operated by any single private party is a metric
   nobody should trust — including one operated by us. The right long-term custodian is a
   body answerable to the legislature, which is precisely the missing third tier that
   international best practice has and India does not.

> The product's ambition is not to *be* the accountability institution. It is to build the
> instrument such an institution would need, and to demonstrate that the instrument is
> cheap, buildable, and already possible.

---

**Next:** [`../03-agents/01-orchestration.md`](../03-agents/01-orchestration.md) — the intelligence layer.
