# Agent — Appeal

> Part of the [Sunvai Round Table](../README.md). Priority **P0**.
> This agent removes the structural gate described in
> [failure mode 3](../00-mission/02-the-problem.md#failure-mode-3--the-appeal-is-gated-behind-a-question-most-citizens-are-never-asked).

## Why this is P0

CPGRAMS has a real appeal tier with a 30-day clock. It is reachable only if the citizen
rates the disposal **"Poor"** — a question roughly 70% of citizens are never asked. The
accountability mechanism exists behind a door most people are never shown, and most stop
after closure *"convinced the portal is decorative."*

**We do not merely permit the appeal. We have already written it.** The difference between
"you may appeal" and "here is your appeal, read it and press send" is the entire gap
between a right that exists and a right that gets used.

## Contract

```ts
appeal({
  narrative_original: string,
  reply_body: string,
  audit: AuditResult,             // verdict, citations, unaddressed[]
  filed_at, closed_at, sla_days,
  officialLang: Lang,
  citizenLang: Lang,
}) => {
  formalText: string;
  citizenLangText: string;        // faithful back-translation for the consent gate
  grounds: string[];              // the specific inadequacies cited
}
```

## Trigger — code, not the model

An appeal may be drafted only when:

- the audit verdict is `deflected`, `boilerplate`, `non_responsive`, or `partial`; **or**
- the citizen answered **"no, my problem was not fixed"** — regardless of the verdict.

The second condition matters most. **The citizen's answer overrides our audit.** If we
judged a reply adequate and the citizen says the pension still has not come, they get their
appeal. We are not the gatekeeper we replaced.

Drafting is automatic; **sending never is.** Status begins at `drafted` and only reaches
`sent` through the [consent gate](../01-product/01-citizen-journey.md#step-5--routed-visibly-then-consented).

## What the appeal must contain

1. **Reference** to the original grievance and registration number.
2. **The specific inadequacy, quoted** — drawn from `audit.citations` and
   `audit.unaddressed`. *"The reply states 'the matter has been forwarded to the concerned
   disbursing authority' but does not identify that authority, give a transfer reference, or
   state when payment will resume."*
3. **What remains unresolved**, factually — including, where true, that the underlying
   problem persists as reported by the citizen.
4. **Elapsed time and any SLA breach**, stated as fact, not grievance.
5. **The specific outcome sought.**

## Rules

**Cite, never characterise.** *"The reply does not state when payment will resume"* — not
*"the reply is evasive."* A quoted, checkable inadequacy is very hard for an appellate
officer to dismiss. An adjective is easy to dismiss.

**Refuse to draft abuse.** No threats, no allegations against named individuals, no claims
unsupported by the case record, no imputation of motive. If the citizen supplies such
material, it is excluded from the draft and they are told why. An appeal that reads as
abuse discredits the citizen and the tool at once.

**Never a generic appeal.** If `audit.unaddressed` is empty and the citizen gave no specific
reason, the agent asks the citizen one question rather than producing filler. A vague appeal
wastes an officer's time and teaches them to ignore appeals from this source — which would
directly harm every other Sunvai user.

**No legal claims.** *"This reply does not address my complaint"* is defensible.
*"This violates Section X"* is advice we are not qualified to give
([`../00-mission/05-non-goals.md`](../00-mission/05-non-goals.md)).

**Respect the volume we create.** Rate-limited per citizen and per office. The honest
framing, though, is worth stating plainly: **the load we add is legitimate load** — appeals
citizens were entitled to file and were structurally prevented from filing. If that volume
is uncomfortable, the discomfort is the finding. See
[`../02-architecture/05-scale-and-safety.md`](../02-architecture/05-scale-and-safety.md).

## Model and settings

Reasoning tier. `temperature: 0`. Same untrusted-input handling as the Auditor — the
department's reply is evidence, never instruction.

**Next:** [`07-agent-cluster.md`](07-agent-cluster.md)
