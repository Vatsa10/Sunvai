# Agent — Router

> Part of the [Sunvai Round Table](../README.md). Priority **P1**.

## Job

Decide which department and which office should receive this grievance — **and show the
citizen why**, so they can correct it before anything is filed.

Misrouting is [failure mode 6](../00-mission/02-the-problem.md#failure-mode-6--structural-misrouting-recreates-the-bureaucracy):
central → state → local transfer chains that recreate the bureaucracy the portal was meant
to remove, with the citizen's practical wait restarting each time.

## Contract

```ts
route({
  narrative: string,
  facts: IntakeFacts,
  taxonomy: DepartmentNode[],     // from adapter.taxonomy() — never hardcoded
}) => {
  departmentId: string;
  officeId: string | null;
  reasoning: string;              // citizen-facing, ONE sentence, their language
  confidence: number;
  alternatives: { departmentId: string; officeId: string | null; why: string }[];
  jurisdiction_note?: string;     // e.g. "this is a municipal matter, not a central one"
}
```

## Rules

**Show the reasoning, always.** *"This looks like EPFO, Regional Office Hyderabad, because
you mentioned a PF withdrawal and your employer is in Telangana."* One sentence, their
language. A routing decision the citizen cannot see is one they cannot correct.

**"That's not right" is always available.** On every routing screen, always reroutable, and
the override is a ledger event. The citizen frequently knows better than the taxonomy —
they have usually been sent somewhere wrong before.

**Report low confidence honestly.** Below threshold, present the top alternatives as a
choice rather than guessing: *"This could be either of these. Which sounds right?"* A
confident wrong route costs the citizen weeks.

**Flag jurisdiction explicitly.** Where the matter is plainly municipal or state, say so
*before filing* — *"This is your municipal corporation's responsibility, not a central
department's. Filing it centrally usually means it gets forwarded and closed."* This is
pre-empting the deflection rather than waiting to audit it, and it is the one place where
we prevent a bad closure instead of catching one.

**The taxonomy comes from the adapter.** Never hardcoded in the agent
([`../02-architecture/04-adapters.md`](../02-architecture/04-adapters.md)) — that is what
lets a new department be one file.

## Model and settings

Classification tier. `temperature: 0`. Taxonomy supplied in-context; for a full national
taxonomy, retrieve candidate branches by embedding first, then classify within them.

## Honest positioning

AI department classification is **shipped** (Samadhan Didi, trained on CPGRAMS data). Our
addition is narrow and real: **showing the reasoning, allowing override, and flagging
jurisdiction before filing.** Claim that, not the classification.

**Next:** [`04-agent-drafter.md`](04-agent-drafter.md)
