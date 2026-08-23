# Mock Data

> Part of the [Sunvai Round Table](../README.md).
> **Everything in this system is synthetic.** The brief prohibits real Aadhaar, PAN,
> passwords, OTPs, payment details and health information, and prohibits scraping personal
> information. That applies to seed data, fixtures, screenshots and the demo video.

---

## Non-negotiable rules

1. **No real identifiers.** No real phone numbers, Aadhaar, PAN, UAN, account numbers, or
   addresses. Not even ones "that look fake" — a plausible-looking number may belong to
   someone.
2. **Phone numbers** use the reserved-for-fiction Indian range `+91 90000 0xxxx`, and are
   stored only as [`phone_hash`](../02-architecture/02-data-model.md#citizens).
3. **Reference numbers** carry a visible `DEMO/` prefix: `DEMO/2026/0000472`. A reviewer
   glancing at a screenshot must be able to tell it is synthetic.
4. **No real officials.** Offices are real institutional types; **no individual is ever
   named**, in seed data or anywhere else
   ([`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#what-we-deliberately-do-not-do)).
5. **Documents are generated**, never photographs of real paperwork.
6. **Every mock surface is labelled in the UI** from
   [`adapter.isMock`](../02-architecture/04-adapters.md), not from a hardcoded flag.

---

## The reply corpus — the most important fixture

The demo only works if the replies are **realistically bad**. A mock that produces polite,
complete replies has nothing for the [Closure Auditor](../03-agents/05-agent-closure-auditor.md)
to find, and the whole submission collapses into a nicer form.

So the corpus is written from the **documented** pathology
([`../00-mission/02-the-problem.md`](../00-mission/02-the-problem.md)), not from imagination:

| Class | Pattern | n |
|---|---|---|
| **Deflection** | *"The matter has been forwarded to the concerned department."* / *"You may approach the State Government."* — no transfer reference, no named recipient, case closed | 12 |
| **Boilerplate** | *"Noted for future action."* / *"Appropriate action is being taken."* | 12 |
| **No reason at all** | Status flips to Disposed with an empty or single-word remark — which the Parliamentary Committee found in many cases | 6 |
| **Non-responsive** | Case-specific, confident, answers a different question than the one asked | 10 |
| **Partial** | Answers half; silent on the rest | 8 |
| **Genuinely good** | States what was done, why, and by when | 10 |
| **Adversarial** | Specific dates, correct subject, confident tone, zero substance | 8 |

The **genuinely good** replies are not filler. Without them we cannot measure our
false-accusation rate, which is the number that matters most in
[`10-evals.md`](../03-agents/10-evals.md).

**Written in English and Hindi**, matching real reply behaviour, with a subset in Bengali,
Tamil, Telugu and Marathi to exercise the six-language path.

---

## The three demo cases

Surfaced as one-tap chips on the landing page, so a reviewer with no registration number is
never stuck. Each teaches a different part of the product.

### 1. Kamla — pension stopped · `DEMO/2026/0000472` — **the headline**

58, Bihar, Hindi. Pension stopped three months ago. Filed via a CSC operator — exercising
[assisted filing](../01-product/02-india-nuances.md#3-the-person-filing-is-often-not-the-person-aggrieved).
Closed in 19 days: *"The matter has been forwarded to the concerned disbursing authority."*

→ Verdict **Deflected**, high confidence · citizen confirms **still not resolved** · appeal
drafted · joins a **46-member cluster**.

**This is the video's first minute.** It carries the audit, the confirmation, the appeal and
the cluster in one continuous story.

### 2. Arif — PF rejection · `DEMO/2026/0000518` — **the subtle one**

31, Hyderabad, English. Asked *why* his withdrawal was rejected. The reply restates the
rejection code and closes the case. Literate, online, persistent — and still stuck.

→ Verdict **Non-responsive**. Demonstrates that this is **judgement, not keyword matching**
— the reply is specific, well-formed, and useless. Worth showing to any judge who suspects
the auditor is a regex.

### 3. Meera — road repair · `DEMO/2026/0000631` — **the disagreement**

24, Pune, Marathi. Closed with *"work order issued."*

→ Verdict **Resolved** — and **the citizen says nothing has been done.**

**This case exists to make us look wrong, deliberately.** It demonstrates the two-layer
design working exactly as intended: the audit was too soft, the citizen's answer overrode
it, the appeal was generated anyway, and the disagreement is counted in our published
[error rate](../02-architecture/02-data-model.md#derived-the-north-star).

> A demo dataset in which the product is always right is a demo dataset a judge should
> distrust. This case is the most persuasive thing in the build.

---

## Volume for the public numbers page

**~2,800 synthetic grievances** across ~8 departments and ~20 offices, spanning May–August
2026, distributed to produce a realistic and unflattering headline:

> **Disposal rate 94% · True resolution rate 41%**

Skew is intentional and varied: some offices genuinely good, some genuinely bad, a couple
with high disposal and low resolution — the exact signature the metric is designed to expose.

**Clusters:** ~6, of which 3 clear the [public visibility
gate](../03-agents/07-agent-cluster.md#membership-is-derived-never-declared) and 3 do not —
so the gate is visible as a working mechanism, not a claim.

**Confirmations** cover ~85% of closures, not 100%, because some citizens will never answer.
Overclaiming perfect coverage would be its own small dishonesty, and the gap is worth showing.

---

## Pre-computed audits

Every seeded case ships with its audit **committed as a fixture**, generated once and
reviewed by us.

Two reasons. **The demo survives an OpenAI outage** during the 28 Aug – 1 Sep review window
— the headline path renders entirely from fixtures. And **verdicts on demo cases are stable**,
so what we show in the video is exactly what a reviewer sees.

Live agent calls are reserved for the reviewer who files something new. When a cached verdict
is served, the UI says so.

---

## Generation

`supabase/seed/` — deterministic, seeded RNG, committed, reproducible with
`pnpm seed:reset`. Replies are hand-written, never model-generated: model-written boilerplate
is subtly different from bureaucratic boilerplate, and the auditor would be learning to
detect the wrong thing.

**The 60 eval fixtures were labelled before the auditor prompt was written**
([`10-evals.md`](../03-agents/10-evals.md)) — labelling after seeing model output produces a
set that agrees with the model by construction.

---

**Next:** [`04-build-order.md`](04-build-order.md)
