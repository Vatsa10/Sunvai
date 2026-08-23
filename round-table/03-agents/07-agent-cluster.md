# Agent — Cluster

> Part of the [Sunvai Round Table](../README.md). Priority **P2**.
> Attacks [failure mode 4](../00-mission/02-the-problem.md#failure-mode-4--systemic-problems-are-shredded-into-individual-tickets):
> systemic issues shredded into individual tickets and disposed one by one.

## Job

Group grievances that share a **root cause** across citizens, so a pattern that is currently
invisible by construction becomes countable.

Five hundred people complaining about one collapsed drainage line generate five hundred
separate cases, each closed with its own boilerplate. Nobody — not the department, and
certainly not the citizen — ever sees the five hundred as one thing.

## Contract

```ts
cluster({
  grievanceId: string,
  narrative: string,
  officeId: string,
  filedAt: string,
}) => {
  clusterId: string | null;
  similarity: number;
  isNew: boolean;
}
```

Runs hourly as a batch job, not on the request path.

## Method — cheap first, model second

1. **Embed** `narrative` (translated to English for cross-language grouping) with
   `text-embedding-3-small` → `vector(1536)` in pgvector.
2. **Candidate retrieval:** nearest neighbours **within the same office**, within a rolling
   time window. Office scoping is what keeps *"pension not received"* in Bihar from merging
   with *"pension not received"* in Kerala — different root causes, same words.
3. **LLM confirmation** on candidates above threshold: *"do these describe the same
   underlying problem, or merely the same category of problem?"* This distinction is the
   whole value, and embeddings alone cannot make it.
4. **Label** the cluster in plain language: *"Pension disbursement stoppage · Bihar · May–Aug
   2026"*.

## Membership is derived, never declared

**The core anti-astroturf property.** There is no code path by which a citizen inserts their
own `cluster_members` row.

*"Join this cluster"* in the UI means **"show me this pattern"** — the grievance was already
in the cluster or not, on the evidence, before the citizen ever saw the button.

**Public visibility gate**, enforced in the recompute job, not by a model:

- ≥5 member grievances
- from ≥5 **distinct** citizen identities
- spread over **>48 hours**
- not originating from a single device or a single narrow IP range

See [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#clusters-are-derived-not-declared).

## Privacy

Clusters display **counts and patterns, never complainants**. No names, no narratives, no
identifying detail. A citizen who complained about a local official must never be
discoverable through a cluster page — that would convert our accountability tool into a
retaliation tool
([`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md#5-fear-of-retaliation)).

Aggregation is by **office, never by named official**.

## Why it matters to one citizen

The product value is not analytical, it is psychological, and it is the strongest emotional
beat in the demo:

> **46 other people have complained about the same thing.**
> **38** were closed without resolution. **0** have been paid.

A citizen who believed they were failing alone learns they are part of a documented pattern.
That converts private exhaustion into public evidence — and it is what makes Sunvai read as
civic infrastructure rather than a personal utility.

**Next:** [`08-agent-document.md`](08-agent-document.md)
