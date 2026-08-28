# The Problem — with evidence

> Part of the [Sunvai Round Table](../README.md). This document backs the thesis in
> [`01-mission.md`](01-mission.md). Judging criterion #1 is *"Is this a real and important
> user problem?"* — this is the document that answers it.

**Verification status:** all figures below were researched on 22 Aug 2026 from the sources
linked at the bottom. Figures marked ⚠️ are derived by us from published numbers rather
than published directly, and are labelled as such wherever they appear in the product.

---

## The system in one line

**CPGRAMS** (Centralised Public Grievance Redress and Monitoring System) is India's
flagship grievance portal — a single front end connected to all central ministries,
departments, states and UTs, available 24×7. It works at real scale: **26,45,869
grievances in 2024 alone**, and **1,15,52,503 resolved between 2020 and 2024**.

It is not a failing system. It is a system that has optimised the wrong half.

---

## Failure mode 1 — Disposal is not resolution

This is the root pathology; the other six are its symptoms or its enablers.

Departments are measured on **disposal**. So departments dispose. The documented
behaviour is a *"disposal-at-all-costs"* strategy to keep dashboards clean, closing cases
with generic responses — **"matter forwarded to concerned department"**, **"noted for
future action"** — marked **resolved**.

This is not an activist's characterisation. The **Parliamentary Standing Committee on
Personnel, Public Grievances, Law and Justice** (Sushil Kumar Modi, report to Rajya Sabha,
10 December 2021) found that departments were disposing grievances *by redirecting
complainants elsewhere or returning cases to the originating agency without resolution*,
and that **"in many cases, the Ministries did not provide any reasons for closure of
grievances."**

The numbers show the gap directly. **February 2026: a 44% resolution rate against 63%
reported citizen satisfaction.** Satisfaction is measured on the small, self-selected
sample that the Feedback Call Centre reaches (see failure mode 2); resolution is measured
on everything. The two numbers describe different populations, and the flattering one is
the one that gets reported.

> **Sunvai's answer:** the [Closure Auditor](../03-agents/05-agent-closure-auditor.md)
> reads every reply against the original grievance and classifies it — Resolved,
> Partial, Deflected, Boilerplate, or Non-responsive — with quoted evidence.

---

## Failure mode 2 — Roughly 70% of closures are never checked with anyone ⚠️

**May 2026:**

| | |
|---|---|
| Grievances redressed, central ministries | 1,78,423 |
| Grievances redressed, States/UTs | 84,365 |
| **Total closures** | **≈ 2,62,788** |
| Feedbacks collected by Feedback Call Centre | 78,830 |
| **⚠️ Feedback coverage (derived)** | **≈ 30%** |

Around **1.8 lakh citizens in a single month** had their grievance closed and were never
asked whether it worked.

This is not merely a measurement gap. It is a **structural trap**, because of failure
mode 3.

> **Sunvai's answer:** proactive verification of **100%** of closures, by voice, in the
> citizen's language, at zero marginal human cost. See
> [`../01-product/01-citizen-journey.md`](../01-product/01-citizen-journey.md) step 6.

---

## Failure mode 3 — The appeal is gated behind a question most citizens are never asked

CPGRAMS has a real appeal tier. Under the **August 2024 Comprehensive Guidelines**,
appeals must be disposed within 30 days, and appeal status is trackable by registration
number. On paper, accountability exists.

But: **the option to file an appeal is enabled only if the citizen rates the disposal
"Poor."**

Combine that with failure mode 2 and the trap closes:

```
Grievance closed
   │
   ├── Citizen never contacted (≈70%) ──────► no rating ──► no appeal option ──► case ends
   │
   └── Citizen reached by Feedback Call Centre (≈30%)
          │
          ├── rates anything above "Poor" ───► no appeal option ──► case ends
          │
          └── rates "Poor" ─────────────────► appeal unlocked
```

The mechanism designed to catch bad closures is reachable only through a door that most
citizens are never shown. Commentary on the appeal path is blunt about the consequence:
most citizens **stop after initial closure, convinced the portal is decorative** — when
the appeal is precisely where the system grows teeth, moving the file from the desk that
failed them to a senior officer.

> **Sunvai's answer:** we ask everyone (fixing mode 2), and when the audit finds the
> reply inadequate, [the appeal is pre-drafted](../03-agents/06-agent-appeal.md) rather
> than merely permitted.

---

## Failure mode 4 — Systemic problems are shredded into individual tickets

Multiple complaints about the same systemic issue are **treated as separate cases**. Five
hundred residents complaining about one collapsed drainage line generate five hundred
grievances, routed separately, disposed separately, each with its own boilerplate reply.

The pattern that would justify actual intervention is invisible **by construction** — not
hidden, just never assembled. And a single citizen has no way to know that 499 others are
shouting the same thing into the same void.

> **Sunvai's answer:** the [Cluster Agent](../03-agents/07-agent-cluster.md) groups
> grievances by root cause across citizens, turning isolated frustration into visible,
> countable evidence.

---

## Failure mode 5 — No consequence architecture

The sharpest structural critique, from IMPRI's analysis: CPGRAMS lacks a
**"consequence architecture."** Formal mechanisms exist — nodal officers, appeal
provisions — but **actual consequences for poor handling remain limited.**

Compounding it:
- The system has **no independent oversight** and operates entirely within the executive
  branch.
- **"Officials monitoring grievances are often from the same administrative cadre"** as
  those being complained about.
- **Monthly reports emphasise disposal numbers over qualitative assessment** — the
  reported metric rewards the pathology in failure mode 1.

Best-practice grievance systems internationally run **three tiers**: frontline providers,
local administrative complaint-handling, and an **independent authority such as an
ombudsman answerable to the legislature.** India has the first two.

The 2021 Parliamentary Committee recommended empowering the appellate authority to
**impose penalties and rewards** based on assessment of grievance-handling officials.
That recommendation has not produced a visible consequence mechanism.

> **Sunvai's answer:** we cannot create a statutory ombudsman. We can create the thing an
> ombudsman would need first — **an independent, tamper-evident record and an honest
> resolution metric**, per office, that no department controls. See
> [`../02-architecture/03-ledger.md`](../02-architecture/03-ledger.md).

---

## Failure mode 6 — Structural misrouting recreates the bureaucracy

Municipal complaints filed centrally get transferred central → state → local,
*"recreating the multi-layered bureaucracy the system aimed to eliminate."*

The Parliamentary Committee found that **in several cases the complainant was asked to
approach the state government and the grievance was disposed — not forwarded** to the
concerned state government. The citizen is sent back to the start, and the case is
counted as successfully handled.

Each transfer also tends to restart the citizen's practical wait while the disposal clock
tells a tidier story.

> **Sunvai's answer:** the [Router](../03-agents/03-agent-router.md) shows its reasoning
> and jurisdiction at filing time, and "you should approach X instead" is explicitly
> classified as **Deflected**, not Resolved, by the Closure Auditor.

---

## Failure mode 7 — The access gap that language alone does not close

CPGRAMS has done serious work here (see [`03-competitive-landscape.md`](03-competitive-landscape.md)),
but the residual barriers are documented: low digital literacy excluding rural
communities, elderly citizens and economically disadvantaged groups; dependence on
internet access and smartphone proficiency; limited awareness in rural areas; and the
finding that a **multilingual interface is insufficient to overcome fundamental
accessibility challenges.**

The distinction that matters for our design: **translation solves language. It does not
solve literacy, connectivity, device-sharing, or fear.** See
[`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md).

> **Sunvai's answer:** voice-first throughout including *output*, assisted filing as a
> first-class path, and 2G-tolerant design. These are **table stakes, not our pitch.**

---

## Who is hurt, concretely

The abstraction "citizen" hides who this actually costs. Our three design personas:

**Kamla, 58, Bihar — a pension that stopped.**
Three months of no payment. Filed with help from a CSC operator. Closed in 19 days:
*"The matter has been forwarded to the concerned disbursing authority."* Still no
pension. Nobody called. She does not know an appeal exists. She believes she has
already tried everything.

**Arif, 31, Hyderabad — a PF withdrawal rejected.**
Filed a grievance about a rejection reason he could not decipher. Reply: a restatement of
the same rejection code. Marked Resolved. He is literate, online, and persistent — and
still has no idea what to do next, because the reply answered a question he did not ask.

**Meera, 24, Pune — the 47th complaint about the same road.**
Her grievance was closed with *"work order issued."* So were the other 46. No work has
started. Each of them believes they are complaining alone.

Failure modes 1 and 2 hurt all three. Mode 3 traps all three. Mode 4 is why Meera's
neighbourhood has no leverage. Mode 5 is why nobody's day is worse for having failed them.

---

## The one-slide summary

| What is already good | What is still broken |
|---|---|
| Filing is easy, in 22 languages, by voice | Closure is unverified |
| 5 lakh CSCs for assisted access | ≈70% of closures never checked with anyone ⚠️ |
| 21-day clock, 13–15 day average disposal | Appeal gated behind an unasked question |
| A formal appeal tier exists | No consequence for bad handling |
| Massive scale, real volume | Systemic issues invisible as patterns |
| Disposal rate is published monthly | **No resolution rate is published** |

Sunvai works exclusively on the right-hand column.

---

## Sources

- [IMPRI — *Beyond Digital-Box Ticking: A Critical Analysis of India's CPGRAMS*](https://www.impriindia.com/insights/policy-update/beyond-digital-box-ticking-a-critical-analysis-of-indias-cpgrams/) — disposal-at-all-costs, pendency, digital divide, misrouting, consequence architecture, international comparison
- [PRS India — *Strengthening of Grievance Redressal Mechanisms*](https://prsindia.org/policy/report-summaries/strengthening-of-grievance-redressal-mechanisms) — Parliamentary Standing Committee, 10 Dec 2021
- [Deccan Herald — parliamentary panel on reward/punishment for grievance officials](https://www.deccanherald.com/india/parliamentary-panel-recommends-reward-punishment-system-for-grievance-officials-1135144)
- [The Cavalier — CPGRAMS May 2026 monthly figures](https://www.cavalier.in/cds-ota-current-affairs/2026-06-23/cpgrams-grievance-redress-2026)
- [The Policy Edge — CPGRAMS monthly report, February 2026](https://www.policyedge.in/p/darpg-cpgrams-monthly-report-for-statesuts-february-2026) — 44% resolution, 63% satisfaction
- [Business Standard — redressal time cut from 30 to 21 days](https://www.business-standard.com/india-news/centre-decreases-public-grievances-redressal-time-from-30-to-21-days-124082601022_1.html)
- [Appeal process when a grievance is closed unresolved](https://vikramkushwaha.in/blog/cpgrams-appeal-grievance-closed/) — "Poor" rating gate

---

**Next:** [`03-competitive-landscape.md`](03-competitive-landscape.md) — what already exists,
and why it makes our position stronger.
