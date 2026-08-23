# Agent — Drafter

> Part of the [Sunvai Round Table](../README.md). Priority **P1**.

## Job

Write the formal grievance text that will actually be filed — in the department's official
language, in the register that gets a case taken seriously — from the citizen's own account.

## Contract

```ts
draft({
  narrative: string,          // citizen's words, their language
  facts: IntakeFacts,
  department: Department,
  officialLang: Lang,         // usually 'en', sometimes 'hi'
  citizenLang: Lang,
}) => {
  formalText: string;         // what gets filed
  citizenLangText: string;    // faithful back-translation for the consent gate
  subject: string;            // ≤120 chars
}
```

## Rules

**Never add facts.** Not a date, not an amount, not a legal reference, not an inference the
citizen did not make. A grievance containing a fabricated detail can be dismissed on that
basis, and the citizen carries the consequence. If a fact is missing, it stays missing —
[Intake](02-agent-intake.md) should have asked, or it was not needed.

**Never soften and never inflate.** Neither a polite erasure of the actual complaint nor
manufactured outrage. The register is factual and firm.

**Structure it the way a case officer reads.** What happened → when → what was already tried
→ what is being asked for. Reference numbers surfaced prominently. A specific, dated,
numbered complaint is harder to dispose of with boilerplate than a paragraph of narrative —
which means good drafting is itself a small defence against
[failure mode 1](../00-mission/02-the-problem.md#failure-mode-1--disposal-is-not-resolution).

**State the outcome sought explicitly.** *"I request that my pension be reinstated and
arrears released"* gives the office something specific to answer — and gives the
[Closure Auditor](05-agent-closure-auditor.md) something specific to check the reply
against. A complaint with no stated ask is nearly impossible to audit.

**`citizenLangText` must be a faithful back-translation of `formalText`** — not a friendly
paraphrase of it. The [consent gate](../01-product/01-citizen-journey.md#step-5--routed-visibly-then-consented)
is only meaningful if what the citizen reads is what is actually being sent. Both are shown
**simultaneously**, never behind a toggle.

**No legal claims.** We describe what happened and what is requested. We never assert a
statutory right or cite a provision — see
[`../00-mission/05-non-goals.md`](../00-mission/05-non-goals.md).

## Model and settings

Fast tier. `temperature: 0` — a formal document should not vary between runs.

## Guard

Automated check before the consent gate: every date, amount and reference number in
`formalText` must appear in `narrative` or `facts`. **A number in the draft that is not in
the source is a hallucination**, and it blocks the gate rather than warning about it.

**Next:** [`05-agent-closure-auditor.md`](05-agent-closure-auditor.md) — the core.
