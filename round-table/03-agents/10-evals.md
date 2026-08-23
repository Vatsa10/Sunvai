# Evals — how we know it works

> Part of the [Sunvai Round Table](../README.md).
> A product that judges other people's work must be able to show its own accuracy.
> **Evidence before assertions.**

---

## What is actually being claimed

Sunvai's central claim is: *"this department's reply does not address your complaint."*

That is a claim about a real institution's conduct. If we cannot say how often we are wrong,
we should not be making it — and the first competent judge to ask *"how accurate is your
auditor?"* will get an honest number or will correctly stop believing us.

---

## Eval 1 — the labelled fixture set (offline)

**~60 closure replies, hand-labelled before the prompt was written.**

Writing labels first is the whole point. Labelling after seeing model output produces a set
that agrees with the model by construction.

| Slice | n | Why |
|---|---|---|
| `resolved` — genuinely good replies | 10 | We must not accuse good work |
| `deflected` | 12 | The documented pathology |
| `boilerplate` | 12 | Including replies with **no reason given at all** |
| `non_responsive` | 10 | The hardest class — answers a question not asked |
| `partial` | 8 | Boundary cases |
| Ambiguous by design | 8 | Should come back `undetermined` |

Cross-cut: all six languages, and both short (<30 word) and long replies.

**Targets.** Not aspirations — gates.

- **False-accusation rate < 5%** — a genuinely `resolved` reply judged negative. This is the
  metric that must be lowest, because a false accusation is the failure that ends the
  project's credibility.
- Recall on `deflected` + `boilerplate` **> 85%** — these are lexically distinctive; if we
  cannot catch them, the product does not work.
- `undetermined` correctly used on ambiguous cases **> 60%** — a model that never says "I
  don't know" is not calibrated.
- **Citation guard pass rate > 98%.**

Run: `pnpm eval:auditor`. Committed to the repo. Results in the README.

---

## Eval 2 — the adversarial set

**The eval that predicts what happens in the real world.**

Once departments know an LLM reads their replies, some will write for the LLM. So we write
those replies ourselves, first: **case-specific detail, confident tone, correct structure,
no actual substance.**

> *"With reference to your grievance dated 6 August 2026 regarding non-receipt of pension,
> the matter has been examined in detail by this office and appropriate action has been
> initiated with the concerned authority. The grievance is accordingly closed."*

Specific date. Correct subject. Sounds thorough. Says nothing — no reason, no responsible
party, no timeline.

**Target: > 70% of adversarial replies caught** as `boilerplate` or `non_responsive`.

We report this number even when it is bad, because it is the honest measure of how this
degrades under pressure — and because the two-layer design means a miss here is caught by
the citizen's own answer rather than corrupting the metric.

---

## Eval 3 — disagreement with citizens ⭐ the one that counts

Offline evals measure agreement with **our** labels. This one measures agreement with
**reality**.

Every case where the audit verdict and the citizen's confirmation disagree is logged,
counted and **published on the public page**:

| Direction | Meaning |
|---|---|
| Auditor said `resolved`, citizen said unresolved | **We were too soft** — we let a bad closure pass |
| Auditor said `deflected`/`boilerplate`/`non_responsive`, citizen said resolved | **We were too harsh** — we accused unfairly |

Query: [`our_error_rate`](../02-architecture/02-data-model.md#derived-the-north-star).

**Why publishing this is the strongest move in the product:** nobody fakes their own error
rate upward. A visible, non-zero, self-reported error rate is the most credible thing on the
page — and it is the direct answer to a judge who assumes we tuned the demo to flatter
ourselves
([`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md#threat-3--us-gaming-the-demo)).

**"Too harsh" is the number we watch hardest.** Being too soft disappoints a citizen. Being
too harsh damages someone who did their job.

---

## Eval 4 — bias and skew monitoring

Continuous, not a one-off.

| Watch | Concern |
|---|---|
| Verdict distribution **per department** | Are we systematically harsher on one office? |
| Verdict distribution **per language** | Does a Tamil-language complaint get judged differently from an English one? |
| Verdict distribution **by reply length** | Are we mistaking brevity for evasion? A short reply can be a good reply. |
| `undetermined` rate per language | A spike means translation or transcription is failing upstream, not that those replies are ambiguous |

Skew is **reported, not corrected silently**. Quietly rebalancing verdicts to make the
distribution look fair would be exactly the dashboard-management pathology we exist to
expose.

---

## Eval 5 — the other agents

Lighter, but present. Each agent is a pure function of its inputs
([`01-orchestration.md`](01-orchestration.md#handoff-contracts)), so all of these replay
against fixtures.

| Agent | Test | Gate |
|---|---|---|
| **Router** | 40 labelled grievances → expected department | >85% top-1; correct dept in `alternatives` >95% |
| **Drafter** | Numbers-in-source check across the fixture set | **100%** — zero fabricated dates, amounts or references |
| **Appeal** | Every draft cites ≥1 audit citation; abuse prompts refused | 100% |
| **Intake** | Never re-asks an answered fact; ≤4 questions | 100% |
| **Cluster** | Same-root-cause pairs merge; same-category-different-problem pairs do not | >80% precision — **precision over recall**, a false cluster is a false public claim |
| **Document** | Unreadable images always yield a specific retake instruction | 100% |

The Drafter's 100% gate is not optional. A fabricated number in a filed grievance can get
the case dismissed on that basis, and the citizen carries the consequence.

---

## Eval 6 — the journey (end-to-end)

The reviewer acceptance test from
[`../01-product/01-citizen-journey.md`](../01-product/01-citizen-journey.md#what-the-reviewer-must-be-able-to-do),
run as an automated check before every deploy:

1. Public URL loads with **no login**, first paint <100KB
2. Demo case opens; audit verdict renders with citations
3. Reasoning panel opens; every citation string-matches the reply
4. Confirmation records and updates the metric
5. Appeal draft appears with ≥1 ground
6. Consent gate shows both languages simultaneously
7. Receipt downloads; **verify passes**; a tampered receipt **fails**
8. Cluster page shows counts and **no citizen identity**
9. Every mock-sourced surface renders a mock badge from `adapter.isMock`

**Step 7's negative case matters most.** A verifier that always says "verified" is a
decoration. The test must prove it can say no.

---

## What we do not eval, and admit

- **Whether the department actually fixed the problem.** We only know what the citizen tells
  us. Self-reported, unverified, and sometimes wrong — we say so on the public page.
- **Language quality across all six languages.** We are not qualified to assess Tamil or
  Bengali output rigorously in six days. Disclosed
  ([`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md)).
- **Real-world routing accuracy** against the true CPGRAMS taxonomy — we cannot test against
  a system we are prohibited from touching.
- **Whether appeals actually succeed.** No production data exists. Unknowable here, and we
  do not imply otherwise.

Stating these plainly costs nothing and is the difference between a prototype that is
honest about its evidence and one that is quietly overclaiming.

---

**Next:** [`../04-build/01-stack.md`](../04-build/01-stack.md) — building it.
