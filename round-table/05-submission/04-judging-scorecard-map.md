# Judging Scorecard Map

> Part of the [Sunvai Round Table](../README.md).
> Every criterion from the brief, mapped to exactly where we address it — and, more usefully,
> **the question a sharp judge asks and the answer we give.**
>
> This is also the honest self-audit. Where we are weak, it says so.

---

## 1. Problem — *"Is this a real and important user problem?"*

**Where:** [`02-the-problem.md`](../00-mission/02-the-problem.md) — seven failure modes, each
with a citation.

**Evidence we lead with:**
- 2.6 lakh closures in May 2026 vs 78,830 feedbacks collected — **≈70% never asked** ⚠️
- 44% resolution rate against 63% reported satisfaction (Feb 2026)
- Parliamentary Standing Committee, Dec 2021: ministries closing grievances *"without
  providing any reasons"*
- IMPRI: *"disposal-at-all-costs"*, no *"consequence architecture"*
- The appeal gate: unlocks only on a "Poor" rating most citizens are never asked for

**Judge asks:** *"Isn't this already being fixed?"*
**We answer:** Intake is. Outcome isn't — and we can show the split, capability by
capability ([`03-competitive-landscape.md`](../00-mission/03-competitive-landscape.md)).

**Strength: strong.** The numbers are public, recent, and the gap is structural rather than
anecdotal.

---

## 2. Working build — *"Does the main journey actually work?"*

**Where:** [`01-citizen-journey.md`](../01-product/01-citizen-journey.md#what-the-reviewer-must-be-able-to-do)
— a 10-step acceptance test, automated pre-deploy ([`10-evals.md`](../03-agents/10-evals.md)).

**Design decisions that protect this:**
- **Three demo chips on the landing page** — a reviewer with no registration number is never
  stuck. Most hackathon demos die in the first 15 seconds on "what do I type?"
- **No login wall.**
- **Pre-computed audit fixtures** — the headline path works even if OpenAI is unreachable
  during the 28 Aug – 1 Sep window.
- Phase 1 of [`04-build-order.md`](../04-build/04-build-order.md) *is* the demo. Everything
  after is upside.

**Judge asks:** *"Is the AI part actually running, or is this scripted?"*
**We answer:** file a new grievance, or reply from `_dept/` and watch the audit fire live.

**Strength: depends entirely on execution.** The plan protects it; the build must deliver.

---

## 3. Usability — *"Is the experience simpler, clearer and more accessible?"*

**Where:** [`02-india-nuances.md`](../01-product/02-india-nuances.md) — twelve frictions, each
with a specific mechanism · [`04-content-and-voice.md`](../01-product/04-content-and-voice.md).

**Concrete, not claimed:**
- The [jargon table](../01-product/04-content-and-voice.md#the-jargon-table) — *"Disposed"*
  currently reads as good news to a citizen who was never told otherwise
- Voice as **output**, not just input — the full journey is completable by audio alone
- SLA shown as **days remaining in plain words**, never "SLA compliance window"
- Accessibility floor: ≥18px, 7:1 contrast, ≥48px targets, no meaning by colour alone
- <100KB first paint; explicit offline states; **no infinite spinners**

**Judge asks:** *"You ship six languages, CPGRAMS has 22."*
**We answer:** deliberately — six done properly beats 22 half-working, and in production this
runs on Bhashini rather than duplicating it. Disclosed, not hidden.

**Strength: good**, provided the accessibility floor is actually held in code.

---

## 4. Product thinking — *"Are the choices thoughtful and well explained?"*

**Our strongest criterion.** Three decisions carry it:

**a. The pivot.** We found Samadhan Didi (30 May 2026), and changed the product rather than
competing with a shipped government capability. Named out loud at 1:00 in the video.

**b. Audit ≠ metric.** The resolution rate comes from the **citizen's answer**, never our
model — because once departments know an LLM reads their replies, some will write for it.
This anticipates Goodhart's law in the design rather than discovering it in production.
([`03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#1b-write-replies-that-pass-the-auditor-without-solving-anything))

**c. We publish our own error rate.** Both directions. One of three demo cases is
**deliberately one we get wrong**.

Supporting: killing the word "blockchain" while keeping the mechanism; refusing to name
individual officials; refusing to scrape.

**Judge asks:** *"What did you decide not to build?"*
**We answer:** [`05-non-goals.md`](../00-mission/05-non-goals.md) — three tiers, with reasons.

**Strength: strongest.**

---

## 5. End-to-end thinking — *"Does the solution address the backend, infrastructure and processes, not just the interface?"*

**Where this criterion is usually lost**, and where a beautiful frontend loses to a plainer
one.

| Dimension | Where |
|---|---|
| **Backend** | [Schema + RLS](../02-architecture/02-data-model.md) — cross-citizen isolation enforced by Postgres, not application code |
| **Infrastructure** | [Hash-chained ledger](../02-architecture/03-ledger.md), append-only at the database level, verified client-side |
| **Integration** | [Adapter interface](../02-architecture/04-adapters.md) with the real path named — API Setu, DigiLocker, Bhashini, DEPA consent artefacts |
| **Process** | SLA clocks, automatic escalation, **outreach to 100% of closures**, ungated appeals. These are *process changes* expressed in software |
| **Scale** | [Sized against real volume](../02-architecture/05-scale-and-safety.md) — 26 lakh/yr, ~2.1 crore ledger rows |
| **Failure** | Every degradation path named and visible; silent failure is the pathology we exist to fight |
| **Safety** | Six named risks with mitigations, plus what we cannot fix technically |
| **Evals** | [Six eval suites with gates](../03-agents/10-evals.md), including an adversarial set |

**Judge asks:** *"What breaks at national scale?"*
**We answer:** the ledger's single head — it shards by department. Specified, deliberately
unbuilt, and we say why. Knowing where a design breaks and choosing not to fix it yet is
stronger than pretending it doesn't.

**Strength: strong** — this is why the ledger and adapters are core deliverables, not
documentation garnish.

---

## 6. Honesty — *"Are limitations, mock data and dependencies clearly disclosed?"*

**Where:** [`01-honesty-disclosure.md`](01-honesty-disclosure.md) — built as the live
`/how-this-works` page.

**Structural, not remembered:** mock badges render from
[`adapter.isMock`](../02-architecture/04-adapters.md), so nobody can ship real data with a
stale badge or remove a badge while still on mocks.

**Eight limitations we volunteer**, including the sharpest one: *a hash chain proves history
wasn't edited; it does not prove we never wrote a false entry.* We name the fix (anchoring),
and confirm it is unbuilt.

**Judge asks:** *"What's the weakest part of this?"*
**We answer:** that anchoring gap, and that "resolved" is self-reported by the citizen and
unverified. Both are on the disclosure page before anyone asks.

**Strength: strongest, jointly with product thinking.**

---

## Where we are weak — stated plainly

Because pretending otherwise in our own scorecard would be the least credible thing in the
folder.

| Weakness | Honest position |
|---|---|
| **Door B (intake) is shallow by design** | Deliberate — it is table stakes. But a judge who tests only Door B sees a worse Samadhan Didi. **Mitigation: the landing page pushes Door A first, and the demo chips make it the path of least resistance.** |
| **Everything is mocked** | Unavoidable and required by the brief, but a reviewer cannot see this working against a real system. Mitigated by making the mock reproduce documented failure, and by naming the real integration path. |
| **"Resolved" is self-reported** | We cannot verify a pension arrived. Better than a satisfaction rating from 30% of people — but not verification, and we never call it that. |
| **Six languages, not 22** | A real gap against CPGRAMS. Disclosed, with the reasoning. |
| **The auditor is the whole product and it is one prompt** | Mitigated by evals, the citation guard, the adversarial set, and the audit-≠-metric separation. Still the concentration of risk, and we say so. |
| **We cannot prove appeals succeed** | No production data exists. We never imply otherwise. |

---

## The scorecard in one table

| Criterion | Primary evidence | Self-assessment |
|---|---|---|
| Problem | Seven cited failure modes; ≈70% never asked | **Strong** |
| Working build | 10-step acceptance test; demo chips; fixture fallback | **Execution-dependent** |
| Usability | Twelve frictions with mechanisms; audio-only completable | **Good** |
| Product thinking | The pivot; audit ≠ metric; published error rate | **Strongest** |
| End-to-end | Ledger, adapters, RLS, process changes, scale analysis | **Strong** |
| Honesty | Structural mock badges; eight volunteered limitations | **Strongest** |

---

**Back to:** [`../README.md`](../README.md)
