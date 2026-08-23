# Sunvai — Round Table

> **सुनवाई** — *a hearing*. Both senses: being listened to, and being given a hearing.

This folder is the complete design corpus for **Sunvai**, our submission to the
*Build What Moves India* hackathon (deadline **28 August 2026, 20:00 IST**).

It is written to be read by **LLM agents building the product** as much as by humans.
Every document is self-contained enough to be loaded alone, and cross-linked so an agent
can follow a thread without loading everything.

---

## The one-paragraph version

India's public grievance system, CPGRAMS, has spent two years fixing its **front door** —
22 languages, Bhashini translation, an AI voice chatbot (*Samadhan Didi*, launched 30 May
2026), 5 lakh Common Service Centres, a 21-day clock. Filing a grievance is now genuinely
easy. **What happens after you file is still broken.** Departments close grievances
without solving them; roughly 70% of closures are never checked with the citizen; the
appeal that would hold someone accountable only unlocks if you rate the disposal "Poor" —
a question most citizens are never asked. Sunvai is the **accountability layer that
begins the moment your grievance is closed.** It audits the department's reply, asks you
whether your problem was *actually* fixed, drafts your appeal for you when it wasn't,
groups your grievance with everyone else suffering the same root cause, and records all
of it in a tamper-evident ledger you can verify yourself.

**CPGRAMS measures disposal. Sunvai measures resolution.**

---

## Reading order

If you are an agent picking this up cold, read in this order. The first four documents
are mandatory context for *any* task in this repo.

| # | Document | Why you need it |
|---|---|---|
| 1 | [`00-mission/01-mission.md`](00-mission/01-mission.md) | The thesis, the north star, the one metric |
| 2 | [`00-mission/02-the-problem.md`](00-mission/02-the-problem.md) | Evidenced failure modes with citations |
| 3 | [`00-mission/03-competitive-landscape.md`](00-mission/03-competitive-landscape.md) | **What already exists — read before proposing any feature** |
| 4 | [`00-mission/05-non-goals.md`](00-mission/05-non-goals.md) | What we deliberately refuse to build |
| 5 | [`01-product/01-citizen-journey.md`](01-product/01-citizen-journey.md) | The journey we must demo end to end |
| 6 | [`02-architecture/01-system-overview.md`](02-architecture/01-system-overview.md) | How the pieces fit |
| 7 | [`03-agents/01-orchestration.md`](03-agents/01-orchestration.md) | The agent graph and state machine |
| 8 | [`04-build/04-build-order.md`](04-build/04-build-order.md) | What to build, in what order, what to cut |

---

## Map

### `00-mission/` — why this exists
- [`01-mission.md`](00-mission/01-mission.md) — thesis, north star metric, principles
- [`02-the-problem.md`](00-mission/02-the-problem.md) — the seven failure modes, with evidence
- [`03-competitive-landscape.md`](00-mission/03-competitive-landscape.md) — CPGRAMS today, Samadhan Didi, what is table stakes
- [`04-hackathon-brief.md`](00-mission/04-hackathon-brief.md) — constraints and judging criteria, extracted
- [`05-non-goals.md`](00-mission/05-non-goals.md) — the refusal list

### `01-product/` — what the citizen experiences
- [`01-citizen-journey.md`](01-product/01-citizen-journey.md) — screen by screen, both entry points
- [`02-india-nuances.md`](01-product/02-india-nuances.md) — the friction catalogue and our answer to each
- [`03-trust-and-antigaming.md`](01-product/03-trust-and-antigaming.md) — why neither side can game this
- [`04-content-and-voice.md`](01-product/04-content-and-voice.md) — tone, language policy, jargon translation table

### `02-architecture/` — how it is built
- [`01-system-overview.md`](02-architecture/01-system-overview.md) — components, boundaries, data flow
- [`02-data-model.md`](02-architecture/02-data-model.md) — Postgres schema and RLS policies
- [`03-ledger.md`](02-architecture/03-ledger.md) — hash-chain spec and verification
- [`04-adapters.md`](02-architecture/04-adapters.md) — the department adapter interface
- [`05-scale-and-safety.md`](02-architecture/05-scale-and-safety.md) — national scale, safely

### `03-agents/` — the intelligence layer
- [`01-orchestration.md`](03-agents/01-orchestration.md) — the graph, the state machine, handoffs
- [`02-agent-intake.md`](03-agents/02-agent-intake.md) · [`03-agent-router.md`](03-agents/03-agent-router.md) · [`04-agent-drafter.md`](03-agents/04-agent-drafter.md)
- [`05-agent-closure-auditor.md`](03-agents/05-agent-closure-auditor.md) — **the core agent**
- [`06-agent-appeal.md`](03-agents/06-agent-appeal.md) · [`07-agent-cluster.md`](03-agents/07-agent-cluster.md) · [`08-agent-document.md`](03-agents/08-agent-document.md)
- [`09-prompts-and-contracts.md`](03-agents/09-prompts-and-contracts.md) — I/O schemas, every agent
- [`10-evals.md`](03-agents/10-evals.md) — how we know each agent works

### `04-build/` — execution
- [`01-stack.md`](04-build/01-stack.md) · [`02-repo-structure.md`](04-build/02-repo-structure.md)
- [`03-mock-data.md`](04-build/03-mock-data.md) — synthetic citizens, departments, replies
- [`04-build-order.md`](04-build/04-build-order.md) — sequenced, with a cut line

### `05-submission/` — winning
- [`01-honesty-disclosure.md`](05-submission/01-honesty-disclosure.md) — every mock, labelled
- [`02-video-script.md`](05-submission/02-video-script.md) — the two minutes
- [`03-summary-250-words.md`](05-submission/03-summary-250-words.md)
- [`04-judging-scorecard-map.md`](05-submission/04-judging-scorecard-map.md) — criterion → where we address it

---

## Working rules for agents in this repo

1. **Read [`03-competitive-landscape.md`](00-mission/03-competitive-landscape.md) before
   proposing any feature.** If the government already shipped it, it is table stakes, not
   a differentiator. Do not pitch it as one.
2. **Never touch a live government system.** Not by API, not by scraping, not "just to
   test." See [`05-non-goals.md`](00-mission/05-non-goals.md). This is disqualifying.
3. **All data is synthetic.** No real Aadhaar, PAN, phone numbers, OTPs, or payment
   details, ever, including in test fixtures. See [`04-build/03-mock-data.md`](04-build/03-mock-data.md).
4. **Every mock must be labelled in the UI**, not just in the docs. Honesty is a scored
   judging criterion. See [`05-submission/01-honesty-disclosure.md`](05-submission/01-honesty-disclosure.md).
5. **If it is not in the ledger, it did not happen.** Every state change writes an event.
   See [`02-architecture/03-ledger.md`](02-architecture/03-ledger.md).
6. **The agent never acts invisibly.** No submission, appeal, or outbound action without
   the citizen seeing exactly what will be sent, in their own language, and consenting.

---

## Status

| | |
|---|---|
| Design | Complete — this folder |
| Implementation | Not started |
| Deadline | 28 Aug 2026, 20:00 IST |
| Stage 2 | Top 250 → 1 week mentorship → resubmit 7 Sep → finals Bengaluru 12 Sep |
