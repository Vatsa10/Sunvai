# Repository Structure

> Part of the [Sunvai Round Table](../README.md).
> Layout follows the boundaries in
> [`01-system-overview.md`](../02-architecture/01-system-overview.md). Directory structure
> is how a boundary stays real.

```
sunvai/
├── round-table/                    ← this folder. The spec. Ships with the repo.
│
├── src/
│   ├── app/
│   │   ├── page.tsx                       landing — language, two doors, demo chips
│   │   ├── case/[id]/page.tsx             the Watch (timeline, SLA clock)
│   │   ├── case/[id]/audit/page.tsx       ★ verdict + reasoning + citations
│   │   ├── case/[id]/appeal/page.tsx      draft + consent gate
│   │   ├── file/page.tsx                  Door B — voice intake
│   │   ├── cluster/[id]/page.tsx          the pattern (counts only, no identities)
│   │   ├── numbers/page.tsx               public: disposal vs true resolution
│   │   ├── verify/page.tsx                receipt verifier — client-side only
│   │   ├── how-this-works/page.tsx        the honesty surface
│   │   └── _dept/                         demo scaffolding: minimal department view
│   │
│   ├── actions/                    Server Actions — THE ONLY PLACE THAT WRITES
│   │   ├── import-case.ts   file-grievance.ts   confirm-resolution.ts
│   │   ├── send-appeal.ts   record-consent.ts
│   │
│   ├── lib/
│   │   ├── agents/                 EVERY LLM CALL LIVES HERE
│   │   │   ├── intake.ts  router.ts  drafter.ts
│   │   │   ├── closure-auditor.ts   ★
│   │   │   ├── appeal.ts  cluster.ts  document.ts
│   │   │   ├── citation-guard.ts    ★ verbatim-match enforcement
│   │   │   ├── schemas.ts           Zod contracts
│   │   │   └── prompts/             *.v1.md — versioned, written to every row
│   │   │
│   │   ├── adapters/               THE ONLY PLACE THAT KNOWS WHAT CPGRAMS IS
│   │   │   ├── types.ts
│   │   │   ├── mock-cpgrams.ts              ✅ built
│   │   │   ├── cpgrams-official.stub.ts     🔲 NotImplementedError
│   │   │   ├── state-portal.stub.ts         🔲
│   │   │   ├── epfo.stub.ts                 🔲 proves the harness generalises
│   │   │   ├── language/openai.ts           ✅   bhashini.stub.ts  🔲
│   │   │   └── channel/web.ts               ✅   whatsapp.stub.ts · ivr.stub.ts  🔲
│   │   │
│   │   ├── ledger/
│   │   │   ├── append.ts            wraps ledger_append() — nothing else inserts
│   │   │   ├── canonical-json.ts    RFC 8785 (JCS)
│   │   │   ├── receipt.ts           export
│   │   │   └── verify.ts            shared server + browser (WebCrypto)
│   │   │
│   │   ├── i18n/                    six languages
│   │   └── sla.ts                   clocks, escalation — pure functions, no model
│   │
│   ├── components/                 ui/ · Verdict.tsx · Timeline.tsx
│   │                               · ConsentGate.tsx ★ · MockBadge.tsx · ReadAloud.tsx
│   └── content/
│       ├── jargon.<lang>.json      the jargon table
│       └── strings.<lang>.json
│
├── supabase/
│   ├── migrations/                 numbered, in the order from the data-model doc
│   └── seed/                       synthetic citizens, departments, replies, audits
│
├── evals/
│   ├── fixtures/auditor/           ~60 hand-labelled replies (labelled FIRST)
│   ├── fixtures/adversarial/       replies engineered to pass
│   └── run-*.ts
│
└── scripts/
    ├── check-adapter-boundary.sh   ★ CI: 'cpgrams' may appear only in lib/adapters/
    └── check-live-url.sh           incognito, mobile UA, no-auth verification
```

---

## Rules the structure enforces

**`lib/agents/` is the only place with a prompt string.** Grep for `You are` outside it
should return nothing. This is what makes agents independently testable
([`10-evals.md`](../03-agents/10-evals.md)).

**`lib/adapters/` is the only place that knows about CPGRAMS.** Enforced in CI by
`check-adapter-boundary.sh` — see
[`04-adapters.md`](../02-architecture/04-adapters.md#verifying-the-boundary-holds). Without
the check, the harness claim quietly becomes false.

**`actions/` is the only place that writes.** Agents return values; actions persist them and
append to the ledger **in the same transaction**. An agent that writes directly is a bug.

**`lib/ledger/verify.ts` runs in both runtimes.** The browser verifies the citizen's receipt
with WebCrypto, so verification never depends on our server saying "verified".

**`_dept/` is demo scaffolding, and named so.** The underscore keeps it off the citizen path.
Reviewers test the citizen experience
([`04-hackathon-brief.md`](../00-mission/04-hackathon-brief.md)); this exists only so a
grievance can receive a reply and the audit can fire live.

**`round-table/` ships with the repo.** The spec is part of the deliverable — it is the
evidence for *product thinking* and *end-to-end thinking*, and it is what Codex builds from.

---

**Next:** [`03-mock-data.md`](03-mock-data.md)
