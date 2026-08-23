# System Overview

> Part of the [Sunvai Round Table](../README.md). Judging criterion: **End-to-end
> thinking** — *"Does the solution address the backend, infrastructure and processes, not
> just the interface?"* This is the document that answers it.

---

## Shape of the system

Sunvai is a **layer on top of a grievance system**, not a replacement for one. That single
decision drives the whole architecture: everything that talks to the outside world goes
through an [adapter](04-adapters.md), and the core knows nothing about CPGRAMS specifically.

```
┌──────────────────────────────────────────────────────────────────────┐
│  CHANNELS                                                            │
│  ┌────────────┐   ┌──────────────────┐   ┌────────────────────┐      │
│  │ Web (built)│   │ WhatsApp (stub)  │   │ IVR / voice (stub) │      │
│  └─────┬──────┘   └────────┬─────────┘   └─────────┬──────────┘      │
└────────┼───────────────────┼───────────────────────┼─────────────────┘
         └───────────────────┴───────────────────────┘
                             │  ChannelAdapter interface
┌────────────────────────────▼─────────────────────────────────────────┐
│  APPLICATION — Next.js App Router on Vercel                          │
│                                                                      │
│   Citizen routes          Server Actions / Route Handlers            │
│   ─────────────           ────────────────────────────────           │
│   /  landing              import case · file grievance               │
│   /case/[id]  watch       confirm resolution · send appeal           │
│   /case/[id]/audit        verify receipt                             │
│   /cluster/[id]                                                      │
│   /numbers  public                                                   │
│   /how-this-works                                                    │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
┌───────────────┐   ┌──────────────────┐   ┌─────────────────────┐
│ AGENT LAYER   │   │  LEDGER          │   │  SCHEDULED WORK     │
│               │   │                  │   │                     │
│ Intake        │   │ append-only      │   │ SLA clock tick      │
│ Router        │   │ hash-chained     │   │ escalation          │
│ Drafter       │   │ events table     │   │ proactive "did it   │
│ ClosureAudit ★│   │                  │   │   work?" outreach   │
│ Appeal        │   │ verify endpoint  │   │ cluster recompute   │
│ Cluster       │   │ citizen receipt  │   │ metric recompute    │
│ Document      │   └────────┬─────────┘   └──────────┬──────────┘
└───────┬───────┘            │                        │
        │                    ▼                        │
        │          ┌──────────────────────────────────▼──────────┐
        │          │  SUPABASE POSTGRES                          │
        │          │  citizens · grievances · events · replies   │
        │          │  audits · appeals · clusters · departments  │
        │          │  Row Level Security on every table          │
        │          │  Realtime → the Watch timeline              │
        │          │  Storage → audio, documents                 │
        │          └─────────────────────────────────────────────┘
        │
        ▼
┌────────────────────┐        ┌──────────────────────────────────────┐
│  LanguageProvider  │        │  GrievanceSystemAdapter              │
│  (interface)       │        │  (interface)                         │
│  ├ OpenAI  (built) │        │  ├ MockCPGRAMS      (built)          │
│  └ Bhashini (stub) │        │  ├ CPGRAMSOfficial  (stub, API Setu) │
└────────────────────┘        │  ├ StatePortal      (stub)           │
                              │  └ EPFO / other     (stub)           │
                              └──────────────────────────────────────┘
```

★ = the differentiating component.

---

## Component responsibilities

Each unit has one job, a defined interface, and can be understood without reading the
others.

| Component | Does | Depends on | Does NOT |
|---|---|---|---|
| **Channels** | Deliver content to a citizen and collect their input, in whatever medium | Nothing in core | Know about grievance logic |
| **App routes** | Render the journey, call server actions | Agents, DB, ledger | Contain business rules inline |
| **Agent layer** | Every LLM call in the system | OpenAI, LanguageProvider | Write to the DB directly — they return values |
| **Ledger** | Append-only, hash-chained record of everything | Postgres | Ever update or delete |
| **Scheduled work** | Time-driven behaviour: clocks, escalation, outreach, recomputes | DB, agents, channels | Serve requests |
| **Postgres** | State, RLS, realtime | — | Contain LLM logic |
| **GrievanceSystemAdapter** | The only code that knows what CPGRAMS is | — | Leak vendor concepts upward |
| **LanguageProvider** | STT, TTS, translation | OpenAI / Bhashini | Know about grievances |

**The rule that keeps this clean:** *agents return values; only server actions write.* An
agent that writes to the database directly is a bug — it makes the agent untestable and
lets state change without a ledger event.

---

## The core data flow — closure to appeal

The path that matters. Everything else is supporting cast.

```
 1. Department marks a grievance disposed
        │           (in this build: mock department UI or seeded fixture)
        ▼
 2. Adapter emits ClosureReceived { grievance_id, reply_text, closed_at }
        │
        ▼
 3. Server action:  ledger.append('closure_received', payload)
        │           ← state change and ledger entry are ONE transaction
        ▼
 4. ClosureAuditor.audit(original_grievance, reply_text)
        │           returns { verdict, confidence, citations[], reasoning }
        ▼
 5. Citation guard: every citation must verbatim-match the reply text
        │           fail → re-run once → flag for review, never silently pass
        ▼
 6. ledger.append('audit_completed', verdict)   +   audits row
        │
        ▼
 7. Notify citizen via their channel, in their language, with read-aloud
        │
        ├──► verdict is inadequate ──► AppealAgent.draft()  (pre-drafted, unsent)
        │
        ▼
 8. Ask: "Did your problem actually get fixed?"     ◄── asked of 100%
        │
        ├── YES ──► ledger.append('citizen_confirmed_resolved')
        │              └─► counts toward TRUE RESOLUTION RATE
        │              └─► if auditor disagreed: log as OUR error
        │
        └── NO ───► ledger.append('citizen_confirmed_unresolved')
                       └─► surface pre-drafted appeal
                       └─► consent gate → send via adapter
                       └─► ledger.append('appeal_filed')
                       └─► ClusterAgent re-evaluates membership
```

**Step 5 is not optional.** A verdict quoting text that is not in the reply is a
hallucination, and an accountability tool that hallucinates evidence is worse than useless.
See [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#threat-4--the-ai-itself).

**Step 8 is the metric, not step 4.** The audit informs the citizen; the citizen's answer
is the number. This separation is what makes the metric ungameable by a department that
learns to write for the auditor.

---

## Boundaries and why they exist

**Adapter boundary.** No code outside `lib/adapters/` may know that CPGRAMS exists.
Everything upstream deals in `Grievance`, `Reply`, `Department`. This is what makes the
harness claim true rather than aspirational — and what lets us answer *"how does this work
at scale?"* with an interface rather than a promise. See [`04-adapters.md`](04-adapters.md).

**Agent boundary.** Every LLM call lives in `lib/agents/`, behind a typed function with a
schema-validated return. No prompt strings anywhere else in the codebase. This makes agents
independently testable ([`../03-agents/10-evals.md`](../03-agents/10-evals.md)) and means
swapping a model is one file.

**Ledger boundary.** All writes to `events` go through `ledger.append()`. Nothing else
inserts into that table; nothing at all updates or deletes from it. Enforced at the
database level, not by convention — see [`03-ledger.md`](03-ledger.md).

**Language boundary.** STT/TTS/translation behind `LanguageProvider`. We use OpenAI; a
production deployment would use Bhashini. Because it is an interface, that is a config
change, and saying so is credible rather than hand-waving.

---

## Trust boundaries

| Data | Trust | Handling |
|---|---|---|
| Citizen's spoken/typed grievance | Untrusted input | Never interpolated into a prompt as instructions |
| **Department reply text** | **Untrusted input** | Delimited, schema-constrained output. A reply containing *"ignore previous instructions"* is data — and a flag |
| Adapter responses | Untrusted | Validated against a schema before entering the system |
| Agent output | Untrusted until validated | Schema + citation guard before any use |
| Ledger contents | Verifiable, not trusted | Anyone can recompute the chain |

---

## What runs when

| Trigger | Runs | Why not inline |
|---|---|---|
| Citizen action | Server action, synchronous | They are waiting |
| Closure received | Audit, async | 3–8s LLM call; the citizen is not on the page |
| Every 15 min (cron) | SLA tick, escalation, outreach queue | Time-driven, not request-driven |
| Every hour (cron) | Cluster recompute, metric recompute | Expensive; batch is correct |

Long-running work never blocks a request. The Watch updates via Supabase Realtime, so the
citizen sees the audit land without polling or refreshing.

---

## Failure modes and degradation

Designed against, because our users are on 2G and our demo is on a Tuesday.

| Failure | Behaviour |
|---|---|
| OpenAI unavailable | Audit queues and retries with backoff. Citizen sees *"We are still reading their reply."* — never a fabricated verdict. |
| Citation guard fails twice | Verdict withheld. Citizen sees the raw reply and *"We could not judge this one — read it yourself and tell us."* Honest beats confident. |
| Adapter unavailable | Cached state shown with an explicit "as of" timestamp. |
| Citizen offline | Voice captured locally, queued, retried. Explicit UI state; no infinite spinner. |
| TTS unavailable | Text remains; read-aloud control disabled with a reason given. |
| Cron missed | Idempotent by design — next run catches up. Nothing depends on a tick having fired exactly once. |

**Principle:** every degradation is *visible and named*. A silent failure in an
accountability product is the exact pathology we exist to fight.

---

## Why this shape answers "end-to-end thinking"

- **Backend:** Postgres schema with RLS as a database-level guarantee, not application
  logic → [`02-data-model.md`](02-data-model.md)
- **Infrastructure:** hash-chained ledger, cron workers, realtime, storage, degradation
  paths → [`03-ledger.md`](03-ledger.md)
- **Process:** SLA clocks, automatic escalation, proactive outreach to 100% of closures,
  appeal generation — these are *process changes*, expressed in software
- **Integration:** an adapter interface with the real path named, rather than scraping →
  [`04-adapters.md`](04-adapters.md)
- **Scale and safety:** what changes at 26 lakh grievances a year →
  [`05-scale-and-safety.md`](05-scale-and-safety.md)

---

**Next:** [`02-data-model.md`](02-data-model.md) — the schema.
