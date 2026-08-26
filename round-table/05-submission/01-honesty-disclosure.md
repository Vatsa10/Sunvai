# Honesty Disclosure

> Part of the [Sunvai Round Table](../README.md).
> **Honesty is a scored judging criterion:** *"Are limitations, mock data and dependencies
> clearly disclosed?"*
>
> This document is also the source content for the live `/how-this-works` page. It is a
> **feature we build**, not a caveat we bury — and a product about government
> accountability that is cagey about its own limits has refuted itself.

---

## What actually works

Real, running code. A reviewer can do all of this. "Real" here means the mechanism runs — it
does not mean the data is real, and it does not by itself make any figure a measurement. Which
figures are measured, and which are simulated, is set out row by row below and enforced on
`/numbers`.

| Works | Detail |
|---|---|
| **Closure audit** | Real LLM call, real reasoning, real verbatim citations against the stored reply |
| **Citation guard** | Genuine string matching. Verdicts with unverifiable quotes are withheld, not published |
| **The ledger** | Real SHA-256 hash chain, real append-only enforcement at the database level |
| **Receipt verification** | Runs **client-side in your browser**. Tamper with a receipt and it genuinely fails |
| **Confirmation → metric** | The true resolution rate is computed from citizen answers, live — never from a model verdict. In this prototype those citizens are synthetic, and `/numbers` says so above the figure |
| **How often the auditor is right** | Measured: 74 closure replies labelled by hand *before* the prompt was written, scored by real model calls. Published in full, including the gate we fail. `evals/results.json` is the only source the site reads accuracy from |
| **Our error rate against real citizens** | **Not measurable yet, and we no longer claim it.** It needs a real model verdict and a real citizen's answer on the same case; a prototype with synthetic citizens has none. The view now excludes seeded rows, so it reports n = 0 and `/numbers` says n = 0 rather than showing a number. An earlier build filled that gap with arithmetic over the synthetic corpus and called it "how often we are wrong" — it measured nothing, and it is gone |
| **Appeal drafting** | Real generation, grounded in the audit's citations |
| **Clustering** | Real embeddings, real similarity, real derived membership |
| **RLS** | Enforced by Postgres. A citizen cannot read another's grievance |
| **Voice in / out** | Real transcription and synthesis |
| **Routing** | Real classification with visible reasoning |

---

## What is mocked, and why

| Mocked | Why | What production would use |
|---|---|---|
| **CPGRAMS itself** | The brief prohibits accessing, testing or interfering with live government systems | Official DARPG integration via [API Setu](../02-architecture/04-adapters.md#the-production-integration-path) |
| **All citizens, grievances, replies** | No real personal data, ever | Real cases, with consent |
| **Identity / login** | No real Aadhaar, PAN or OTP | DigiLocker or Aadhaar e-KYC, consented |
| **Department replies** | We cannot obtain real ones | The department's own system |
| **Registration numbers** | `DEMO/` prefixed, visibly synthetic | Real references |
| **Documents** | Generated, never real paperwork | DigiLocker, no uploads |
| **The department view (`_dept/`)** | Demo scaffolding so a reply can exist to audit | The department's existing CPGRAMS workflow |
| **Outreach delivery** | In-app only | SMS / WhatsApp / IVR |

> **The mock reproduces the failure, not the success.** Our mock CPGRAMS deliberately
> generates the *documented* bad replies — deflection, boilerplate, closure with no reason.
> A mock that produced polite complete replies would have nothing for the auditor to find,
> and the demo would be a lie by omission. Sources for every pattern:
> [`../00-mission/02-the-problem.md`](../00-mission/02-the-problem.md).

---

## What is specified but **not built**

Named honestly, because an interface with no implementation is a design decision, not a
feature.

| Not built | Status | Why not |
|---|---|---|
| `CPGRAMSOfficialAdapter` | Stub implementing the interface | Requires an access agreement with DARPG — a **policy** step, not a technical one |
| `StatePortalAdapter`, `EPFOAdapter` | Stubs | Prove the harness generalises; building a second vertical costs the depth that wins the first |
| `WhatsAppChannel`, `IVRChannel` | Stubs | Need Meta Business verification and a telecom number, unobtainable in six days |
| `BhashiniLanguageProvider` | Stub | What production would use; the brief requires OpenAI here |
| **Ledger anchoring** | Specified, unbuilt | Head publication, third-party witness, RFC 3161 timestamping — see below |
| **Ledger sharding** | Specified, unbuilt | One chain is correct at demo scale; premature sharding would be the wrong use of six days |
| **Audit triage pre-filter** | Specified, unbuilt | A cost optimisation that only matters at national volume |

---

## Limitations we volunteer

The ones a good judge would find. Better said by us.

**1. A hash chain proves history was not *edited*. It does not prove we never wrote a false
entry.** With one operator and no anchoring, we are still the root of trust. The fix is
[anchoring](../02-architecture/03-ledger.md#anchoring--the-production-answer) — specified,
unbuilt, and honestly the single biggest gap between this prototype and a system that
deserves institutional trust.

**2. Our auditor is wrong sometimes, and we publish how often.** Both directions — too harsh
and too soft — on `/numbers`. One of our three demo cases is **deliberately one we get
wrong**.

**3. "Resolved" is self-reported by the citizen.** We know what they tell us. We do not
independently verify that a pension arrived. Self-reported ground truth is still vastly
better than the current alternative, which is asking roughly 30% of people a satisfaction
rating — but it is not verification, and we do not call it that.

**4. We cannot assess language quality in all six languages rigorously.** We are not
qualified to judge Tamil or Bengali output to a standard we would defend in six days.

**5. Routing is tested against our taxonomy, not the real one.** We are prohibited from
touching the live system, so real-world routing accuracy is unmeasured.

**6. We do not know whether appeals succeed.** No production data exists. We do not imply
otherwise anywhere in the product.

**7. Deleting a grievance still leaves its ledger events.** Hashes, not content — but it is
a genuine tension between the right to erasure and tamper-evidence, and we state it rather
than hide it.

**8. Voice intake is not our contribution.** DARPG shipped
[Samadhan Didi](../00-mission/03-competitive-landscape.md) on 30 May 2026. We build intake
so the journey is complete, not because it is new.

---

## How this appears in the product

Disclosure that lives only in a document is not disclosure.

1. **Per-surface mock badges**, rendered from
   [`adapter.isMock`](../02-architecture/04-adapters.md) — structural, so nobody can ship
   real data with a stale badge or remove the badge while still on mock data.
2. **A persistent site line:** *"An independent civic tool. Not a government service."* — in
   the citizen's language.
3. **`/how-this-works`** — this document, in plain language, linked from every screen.
4. **`/numbers` is split structurally into "What we measured" and "What we simulated"** — the
   eval results and the real-run error rate (at whatever honest n exists, currently zero) come
   first; the synthetic corpus and everything derived from it sits under a heading that says
   so before any figure appears. A number on this site is measured or labelled simulated;
   there is no third category.
5. **The reasoning panel** on every verdict — the citizen can always see how we judged.
6. **`DEMO/` prefixes** on every reference number, visible in screenshots.

---

## What we will not claim

Stated so nobody drifts into it under deadline pressure:

- ❌ That this is affiliated with, endorsed by, or built with any government body
- ❌ That our audit is authoritative or legally binding
- ❌ That our language handling is better than Bhashini — **we have run no benchmark**
- ❌ That we know a department is bad — we know what a **reply** said
- ❌ That any real citizen has been helped by this
- ❌ That the resolution rate shown is real — **it is computed from synthetic data**

---

## The line for the video

> *"Everything you just watched runs. The audit is a real model call with real citations you
> can check. The receipt verification runs in your browser. What's mocked is CPGRAMS itself —
> because the brief says don't touch live government systems, and honestly, scraping a
> government portal is not an architecture that could ever ship. So it's behind an adapter,
> and the real integration path is documented. And one of our three demo cases is one our own
> auditor gets wrong — because a demo where the product is always right is a demo you
> shouldn't trust."*

---

**Next:** [`02-video-script.md`](02-video-script.md)
