# Agent Orchestration

> Part of the [Sunvai Round Table](../README.md).
> Seven narrow agents, hard contracts, one state machine. **Not one mega-prompt.**

---

## Why seven agents and not one

A single "grievance assistant" prompt would be shorter to write and worse in every way that
matters here:

- **Testability.** *"Does the Closure Auditor correctly classify a deflection?"* is a
  question with an eval set and a number. *"Is the assistant good?"* is not. See
  [`10-evals.md`](10-evals.md).
- **Failure isolation.** When routing degrades, routing is what we fix. In a mega-prompt,
  every fix risks every behaviour.
- **Cost.** Intake needs conversational fluency. The audit needs careful reasoning over
  adversarial text. Clustering needs embeddings. Paying reasoning-model prices for a
  transcription cleanup is how a cost envelope dies at scale
  ([`../02-architecture/05-scale-and-safety.md`](../02-architecture/05-scale-and-safety.md)).
- **Explainability.** *"Here is the agent that decides whether a reply answers your
  complaint, here is its prompt, here is its accuracy"* is a thing we can put on screen.

**The boundary rule:** every LLM call in the system lives in `lib/agents/`, behind a typed
function with a schema-validated return value. **No prompt strings anywhere else in the
codebase. Agents return values; only server actions write to the database.** An agent that
writes state directly is a bug — it becomes untestable and it lets state change without a
ledger event.

---

## The seven

| Agent | Job | Model tier | Criticality |
|---|---|---|---|
| [**Closure Auditor**](05-agent-closure-auditor.md) ★ | Does this reply actually address the complaint? | Reasoning | **P0 — the product** |
| [**Appeal**](06-agent-appeal.md) | Draft an appeal citing a specific inadequacy | Reasoning | P0 |
| [**Intake**](02-agent-intake.md) | Turn free speech into a complete complaint | Conversational | P1 |
| [**Router**](03-agent-router.md) | Which department, which office, and why | Classification | P1 |
| [**Drafter**](04-agent-drafter.md) | Formal grievance text in the official language | Fast | P1 |
| [**Cluster**](07-agent-cluster.md) | Group grievances by root cause | Embeddings + light LLM | P2 |
| [**Document**](08-agent-document.md) | Read an attached photo; is it usable? | Vision | P2 |

Priorities map to the cut line in
[`../04-build/04-build-order.md`](../04-build/04-build-order.md). If time runs out, the
Auditor and the Appeal agent are the last things standing.

---

## The graph

Not a free-form agent swarm. A **deterministic state machine** with LLM calls at specific
nodes. Control flow is code; judgement is the model.

```
                      ┌─────────────── DOOR A: import ────────────────┐
                      │  adapter.fetchCase(ref) → ExternalCase        │
                      └───────────────────────┬───────────────────────┘
                                              │
  ┌──── DOOR B: file new ────┐                │
  │                          │                │
  │  audio ──► [INTAKE] ◄────┼── follow-ups   │
  │              │           │   (≤4, loop)   │
  │              │  optional │                │
  │              ├──► [DOCUMENT] ──► readable?│
  │              │        │no → ask again     │
  │              ▼                            │
  │          [ROUTER] ──► dept + office + why │
  │              │                            │
  │              ▼                            │
  │          [DRAFTER] ──► formal text        │
  │              │                            │
  │              ▼                            │
  │      ╔═══════════════════╗                │
  │      ║   CONSENT GATE    ║  human, always │
  │      ╚═══════┬═══════════╝                │
  │              ▼                            │
  │        adapter.file()                     │
  └──────────────┬────────────────────────────┘
                 │                            │
                 └──────────┬─────────────────┘
                            ▼
                   ┌─────────────────┐
                   │   WATCHING      │  ◄── cron: SLA tick, escalate
                   └────────┬────────┘
                            │ reply_received + closed
                            ▼
                   ┌─────────────────┐
                   │ [CLOSURE AUDIT] │ ★
                   └────────┬────────┘
                            │
                    ┌───────▼────────┐
                    │ CITATION GUARD │  verbatim match or re-run
                    └───────┬────────┘
                       pass │ fail×2 → verdict = undetermined
                            ▼
                   ┌─────────────────┐
                   │  NOTIFY CITIZEN │  their language, read aloud
                   └────────┬────────┘
                            │
              verdict inadequate → [APPEAL] drafts, unsent
                            │
                            ▼
                   ┌─────────────────┐
                   │  ASK THE CITIZEN│  "did it actually get fixed?"
                   └────────┬────────┘
                            │
              ┌─────────────┴──────────────┐
         YES  │                            │  NO
              ▼                            ▼
     confirmed_resolved            confirmed_unresolved
     → resolution metric           → surface drafted appeal
     → if auditor disagreed:       → ╔══════════════╗
       log OUR error                 ║ CONSENT GATE ║
                                     ╚══════┬═══════╝
                                            ▼
                                     adapter.appeal()
                                            │
                                            ▼
                                     [CLUSTER] re-evaluate
```

**Two gates are human and unconditional.** Nothing leaves the system through
`adapter.file()` or `adapter.appeal()` without the citizen having seen the exact text in
both languages and consented. This is the design commitment that makes an AI filing
documents with the government acceptable rather than alarming.

---

## Handoff contracts

Every arrow above is a typed function call with a Zod-validated return. Full schemas in
[`09-prompts-and-contracts.md`](09-prompts-and-contracts.md).

```ts
intake(audio|text, lang)            → { narrative, facts, missing[], readyToRoute }
document(image)                     → { readable, extracted, retakeInstruction? }
route(narrative, facts, taxonomy)   → { departmentId, officeId, reasoning, confidence, alternatives[] }
draft(narrative, facts, dept, lang) → { formalText, subject }
audit(narrative, replyBody)         → { verdict, confidence, reasoning, citations[] }
appeal(narrative, reply, audit)     → { formalText, citizenLangText }
cluster(grievanceId)                → { clusterId | null, similarity }
```

**Every one is a pure function of its inputs.** No agent reads the database; the caller
supplies context and persists the result. This is what makes each agent replayable against
a fixture set, which is what makes [`10-evals.md`](10-evals.md) possible at all.

---

## What is deterministic and what is not

A recurring failure of agent products is letting the model decide things code should decide.

| Decided by **code** | Decided by a **model** |
|---|---|
| When to run the audit | What the verdict is |
| Whether an appeal may be drafted | What the appeal says |
| Whether a cluster is public | Which grievances are similar |
| SLA clocks, escalation timing | — |
| Whether citations verify | — |
| Whether the citizen consented | — |
| Which model tier to use | — |
| The resolution metric | **nothing** |

> **The metric is untouched by any model.** It comes from
> [`confirmations`](../02-architecture/02-data-model.md#confirmations---what-the-citizen-said-this-is-the-metric),
> which is a human answering a yes/no question. Every agent in this system informs a human;
> none of them scores a department. See
> [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#1b-write-replies-that-pass-the-auditor-without-solving-anything).

---

## Cross-cutting: the language layer

Not an agent. A service every agent uses, behind
[`LanguageProvider`](../02-architecture/04-adapters.md#languageprovider).

**Rule:** agents reason in **English internally**, regardless of the citizen's language.
Translation happens at the edges — in on the way from the citizen, out on the way back.
This keeps prompts, eval fixtures and citation matching in one language, and means adding a
seventh language costs nothing in agent logic.

**Exception, and it is important:** the [Closure Auditor](05-agent-closure-auditor.md)
reads the department's reply in **its original language**, never a translation. Judging
whether a reply is evasive on the basis of a machine translation would compound one model's
error with another's — and the citations must string-match the source text exactly.

---

## Reliability

| Concern | Handling |
|---|---|
| Schema violation | Zod validation → one retry with the error fed back → then fail loudly |
| Hallucinated citation | [Citation guard](05-agent-closure-auditor.md#the-citation-guard): verbatim match or re-run; twice failed → `undetermined` |
| Timeout | Async job, exponential backoff, citizen sees *"still reading their reply"* — never a fabricated verdict |
| Prompt injection in a reply | Delimited untrusted input, enum-constrained output, injection attempt flagged as a finding |
| Model drift between runs | `model` and `prompt_version` stored on every `audits` row for reproducibility |
| Non-determinism | `temperature: 0` for audit, routing and appeals. Warmth is for intake, not for judgement |

---

## Prompt versioning

Every prompt is a file in `lib/agents/prompts/<agent>.<version>.md`, and the version is
written to the row it produced.

Non-negotiable, because the audit makes claims about other people's conduct: if a verdict
is challenged, we must be able to reproduce **exactly** what was asked and by which model.
An accountability tool that cannot audit itself has no standing to audit anyone else.

---

**Next:** [`02-agent-intake.md`](02-agent-intake.md), or jump to the core:
[`05-agent-closure-auditor.md`](05-agent-closure-auditor.md).
