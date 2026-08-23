# Non-Goals — the refusal list

> Part of the [Sunvai Round Table](../README.md).
> Scope discipline is a scored criterion (*"Solve **one** clearly defined user problem"*).
> This document exists so that "wouldn't it be cool if…" has a place to die.

---

## Tier 1 — Disqualifying. Never build these.

Violating any of these ends the submission. See [`04-hackathon-brief.md`](04-hackathon-brief.md#prohibitions--any-one-of-these-is-disqualifying).

### ❌ Any contact with a live government system
No API calls, no browser automation, no headless scraping, no "just hitting the public
endpoint to see what it returns," no test submissions to the real CPGRAMS. Not in code,
not in a local script, not in a throwaway experiment.

The temptation is real: an agent that actually drives pgportal.gov.in would demo
spectacularly. **It is explicitly prohibited and it is also bad engineering** — it could
never ship, it breaks the moment the DOM changes, and it answers the *"how does this work
at scale"* question with "it doesn't."

Our answer instead: a **mock CPGRAMS behind an adapter interface**, with the real
integration path documented. See [`../02-architecture/04-adapters.md`](../02-architecture/04-adapters.md).

### ❌ Real personal data of any kind
No real Aadhaar, PAN, phone numbers, addresses, OTPs, payment details or health
information — **including in test fixtures, seed data, screenshots and the demo video.**
Every identifier is synthetic and visibly so. See [`../04-build/03-mock-data.md`](../04-build/03-mock-data.md).

### ❌ Anything implying government endorsement
No Ashoka emblem. No ministry or department logos. No `.gov.in`-mimicking domain. No
tricolour masthead that reads as an official lockup. No copy that says or implies "official."
The product must be unmistakably an **independent civic tool**. See
[`../01-product/04-content-and-voice.md`](../01-product/04-content-and-voice.md).

### ❌ Scraping personal or restricted information
Including public-but-personal data about officials. Named officers in the demo are
synthetic.

### ❌ Unlicensed code, assets or data
Every dependency, font, icon and image is permissively licensed and attributed.

---

## Tier 2 — Out of scope for this build. Good ideas, wrong time.

These are not bad. They are **not this submission**, and each would dilute the one thing
we are proving. Several belong in
[`../02-architecture/05-scale-and-safety.md`](../02-architecture/05-scale-and-safety.md)
as *"where this goes next"* — which is the correct place to get credit for an idea without
paying to build it.

| Not building | Why not |
|---|---|
| **A general "all government portals" harness** | The architecture is general and the adapters prove it. The *demo* is one vertical. Breadth here reads as unfocused and fails "one clearly defined problem." |
| **EPFO / IRCTC / Income Tax / certificate journeys** | Adapter stubs only. Building a second vertical costs the depth that wins the first. |
| **RTI, Consumer Helpline, state portals** | Adjacent redressal systems. Named in the architecture as future adapters; not built. |
| **An officer/admin panel** | The brief says reviewers test the **citizen** experience, not an admin panel. We need a minimal department-side surface *to make the demo work* — see the note below — and nothing more. |
| **Real authentication** | No Aadhaar e-KYC, no DigiLocker OAuth, no SMS OTP. Mock identity, clearly labelled. Real auth is an integration, not an idea, and it burns days. |
| **Payments** | Nothing in this product requires money to move. |
| **A native mobile app** | *"Reviewers will not download a mobile app."* Mobile web only. |
| **WhatsApp / IVR channel** | The right production channel for our users and specified architecturally as a channel adapter — but building it needs Meta Business approval and a phone number we cannot get in six days. Shown as an interface, disclosed as unbuilt. |
| **Offline-first sync engine** | We degrade gracefully on slow connections and queue voice uploads. A full CRDT sync layer is a project of its own. |
| **Blockchain, any actual chain** | We use a hash-chained append-only table — tamper-evident, verifiable, ~40 lines. A real chain adds cost, latency and a word we would spend credibility defending. See [`../02-architecture/03-ledger.md`](../02-architecture/03-ledger.md). |
| **Fine-tuning a model** | Prompt engineering plus a good eval set is faster, cheaper and more explainable in a two-minute video. |
| **Forking an open-source govtech stack** | Two days of archaeology, and you cannot explain your own architecture on camera. Build thin; cite the standards. |
| **Predicting the outcome of a grievance** | We audit what a department *said*. We do not forecast what it will *do*. Overreach we cannot substantiate. |
| **Naming or scoring individual officials** | Aggregate by **office**, never by person. See [`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md). |
| **Legal advice** | We say "this reply does not address your complaint." We never say "you have a legal right to X." |

> **On the department-side surface:** the demo needs *some* way for a grievance to receive
> an official reply, or there is nothing to audit. Build the **smallest possible**
> department view — a list, a text box, a "mark disposed" button — treat it as demo
> scaffolding rather than product, and keep it off the main citizen path. It exists so the
> reviewer can play both roles and watch the audit fire live.

---

## Tier 3 — Scope creep watchlist

Plausible, adjacent, and each one costs a day we do not have. If one becomes essential,
it must **displace** something already planned, not extend the plan.

- Gamification, badges, streaks, leaderboards for citizens
- Social feed, comments, public shaming of departments
- A civic-issue map with pins
- Push notifications requiring service-worker infrastructure
- Multi-tenant support for NGOs or municipalities
- An analytics dashboard beyond the single public resolution-rate view
- Grievance drafting for systems we do not model
- Anything beginning "we could also let the user…"

---

## The test

Before building anything not already specified in this folder, answer both:

> **1. Does this help measure the true resolution rate, or help improve it?**
> **2. Is it already shipped by CPGRAMS?** (Check [`03-competitive-landscape.md`](03-competitive-landscape.md).)

If the answer to 1 is *no*, or the answer to 2 is *yes* and you were planning to lead with
it — **it does not go in.** Write it in Tier 2 of this document instead, where it earns
credit as demonstrated judgement rather than costing a day.

---

**Next:** [`../01-product/01-citizen-journey.md`](../01-product/01-citizen-journey.md) — the journey we must demo.
