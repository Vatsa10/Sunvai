# The Citizen Journey

> Part of the [Sunvai Round Table](../README.md). This is the journey a hackathon reviewer
> must be able to complete end to end on a phone. Judging criterion: *"Does the main
> journey actually work?"*

---

## Two doors, one loop

Most of our users **have already filed** and already been let down. Forcing them to file
again would be absurd, and it would also bury our differentiator behind a flow the
government already does well. So there are two entry points, and they converge fast.

```
   DOOR A — "Track something I already filed"     DOOR B — "I have a new problem"
   (the differentiator, leads the demo)            (table stakes, kept short)
              │                                              │
              │  paste registration number                   │  speak it
              ▼                                              ▼
      ┌──────────────────┐                         ┌──────────────────┐
      │  Import & watch  │                         │  Intake → Route  │
      │                  │                         │  → Draft → File  │
      └────────┬─────────┘                         └────────┬─────────┘
               │                                            │
               └──────────────────┬─────────────────────────┘
                                  ▼
                      ┌────────────────────────┐
                      │   THE WATCH  (step 5)  │  legible timeline, SLA clock
                      └───────────┬────────────┘
                                  │  department closes it
                                  ▼
                      ┌────────────────────────┐
                      │   THE AUDIT  (step 6)  │  ◄── THE PRODUCT
                      └───────────┬────────────┘
                                  ▼
                      ┌────────────────────────┐
                      │  DID IT WORK? (step 7) │  asked of 100%, by voice
                      └───────────┬────────────┘
                     resolved ◄───┴───► not resolved
                        │                    │
                        ▼                    ▼
                    step 10            steps 8–9: appeal + cluster
```

**Demo order is Door A.** The reviewer should meet the audit within 60 seconds of landing.
Door B exists so the journey is genuinely complete and so we can honestly say we cover
intake — not because it is where our value is.

---

## Step 0 — Arrival

**No login wall.** A reviewer who hits a signup screen has already scored us down on
usability, and a citizen on a shared phone will simply leave.

The landing page is one screen, mobile-first, under 100KB on first paint:

- **Language picker first**, before anything else, as flags-free plain script:
  `हिन्दी · English · తెలుగు · বাংলা · मराठी · தமிழ்` (see
  [`04-content-and-voice.md`](04-content-and-voice.md) for the shipped set).
- One sentence of what this is, in their language: *"Your complaint was closed. Was it
  actually solved? We check."*
- **Two buttons, unequal weight.** Primary: *"Check a complaint I already filed."*
  Secondary: *"Make a new complaint."*
- A quiet third link: *"How this works / What is real and what is mocked."* →
  [`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md).

**Demo affordance:** because a reviewer has no registration number, the page offers three
pre-seeded demo cases as one-tap chips — *Kamla's pension · Arif's PF · Meera's road* —
each clearly labelled **DEMO DATA**. This is the single highest-leverage usability
decision in the build: it removes the "what do I type?" dead end that kills most
hackathon demos in the first 15 seconds.

---

## DOOR A — Track something already filed

### Step 1 — Import

The citizen enters a registration number (or taps a demo chip). We fetch the case through
the [adapter](../02-architecture/04-adapters.md) — in this build, from our mock CPGRAMS.

What comes back is deliberately shown **raw first**: the actual status word, the actual
reply text, in the original bureaucratic English. Then, immediately below, the translation.

> **Why raw first:** the citizen must be able to see that we did not invent anything. Trust
> in an accountability tool is built by showing your work, not by hiding the source.

### Step 2 — Jargon, translated

Every bureaucratic term becomes a human sentence in the citizen's language, inline and
tappable for the original.

| They wrote | We say |
|---|---|
| Disposed | Closed. Marked finished by the department. |
| Under process | Someone has it. Nothing has been decided yet. |
| Nodal Officer | The person responsible for your complaint at that office. |
| Subordinate organisation | A smaller office under the main department. |
| Matter forwarded to concerned department | They sent it somewhere else and stopped tracking it. |

Full table in [`04-content-and-voice.md`](04-content-and-voice.md#the-jargon-table).

---

## DOOR B — File a new grievance

Kept deliberately tight. Four steps, all voice-first, all skippable to typing.

### Step 3 — Speak it
One large microphone button. *"क्या हुआ? बताइए।"* The citizen talks freely, at length, in
their own language. No form. The transcript appears in **their** language as they speak,
so they can see they were understood. Editable by voice or tap.

Handled by the [Intake Agent](../03-agents/02-agent-intake.md). Offline or on 2G, the
audio is captured locally and uploaded when the connection returns; the UI says so plainly.

### Step 4 — Four questions, then stop
The agent asks **at most four** targeted follow-ups — only for facts a grievance genuinely
needs to be actionable, and only for facts not already said: what happened, when, where,
what you already tried, what outcome you want. It stops as soon as it has enough. It never
asks something the citizen already answered.

Optionally, a photo of a document — the [Document Agent](../03-agents/08-agent-document.md)
reads it, extracts what matters, and **tells the citizen if it is unreadable before
submission**, not three weeks after.

### Step 5 — Routed, visibly, then consented
The [Router](../03-agents/03-agent-router.md) proposes a department and office **and shows
its reasoning**: *"This looks like EPFO, Regional Office Hyderabad, because you mentioned
a PF withdrawal and your employer is in Telangana."* Confidence is shown honestly. A
**"That's not right"** button is always present and always reroutes.

Then the consent gate — **the most important screen in the product**:

> **This is exactly what we will send. Nothing else.**
>
> The formal grievance text, in the official language, in full.
> Directly beneath it, back-translated into the citizen's language.
> A read-aloud button.
> **Send** / **Change something** / **Cancel**.

The agent never acts invisibly. This screen is why an AI filing documents on a citizen's
behalf is acceptable rather than frightening.

---

## THE SHARED LOOP

### Step 6 — The Watch

Not a status word. A **timeline with a clock**.

```
  ●  Filed                              6 Aug 2026
  │
  ●  Received by EPFO RO Hyderabad      7 Aug 2026
  │
  ●  Assigned — Assistant PF Commissioner, Section 3
  │                                     9 Aug 2026
  │
  ○  Reply due                          27 Aug 2026
     ████████████░░░░░  12 of 21 days used · 9 days left
```

Live via Supabase Realtime. Every entry is a
[ledger event](../02-architecture/03-ledger.md) — nothing appears here that is not
independently recorded. Read-aloud on every screen.

If the SLA is breached, the system **escalates automatically and tells the citizen it
did**, in their language. The escalation is itself a ledger event.

### Step 7 — THE AUDIT ◄ this is the product

The department closes the grievance. In every existing system, this is the end. Here it is
the beginning.

The [Closure Auditor](../03-agents/05-agent-closure-auditor.md) reads the department's
reply **against the original grievance** and returns one of five verdicts, with quoted
evidence and a confidence score:

| Verdict | Meaning |
|---|---|
| ✅ **Resolved** | Substantively addresses what was actually asked |
| 🟡 **Partial** | Addresses some of it; names what is left |
| 🔴 **Deflected** | *"Approach the state government"* / *"forwarded to concerned department"* — sent elsewhere, counted as done |
| 🔴 **Boilerplate** | Generic text, no reasons given, no engagement with the specifics |
| 🔴 **Non-responsive** | Answers a question that was not asked |

Presented plainly, read aloud, in their language:

> **They marked this Closed. We do not think it is solved.**
>
> You asked why your pension stopped in May.
> They wrote: *"The matter has been forwarded to the concerned disbursing authority."*
>
> **That is not an answer.** It does not say why the payment stopped, who is now
> responsible, or when you will be paid. It moves your file somewhere else and closes it
> here.
>
> *Verdict: Deflected · confidence high · [see how we judged this]*

The **"how we judged this"** link opens the auditor's reasoning and the exact quoted
spans. We show our work — always. An accountability tool that asks to be trusted blindly
has refuted itself.

### Step 8 — We ask. Everyone. ◄ the coverage fix

Independent of the audit, and this is the part today's system skips for ~70% of closures:

> **"Kamla ji — has your pension started coming?"**
> **हाँ** / **नहीं**

By voice, in her language, proactively, at zero marginal cost. Not a five-star rating —
a question about material reality. One tap or one word.

Two answers, both of which matter:
- The **citizen's ground truth** — the input to the true resolution rate.
- A **check on our own auditor.** When the citizen says "yes, it's fixed" and our auditor
  said Deflected, that disagreement is logged and feeds
  [`../03-agents/10-evals.md`](../03-agents/10-evals.md). We are not exempt from being
  wrong.

### Step 9 — The appeal writes itself ◄ the gate removed

Today: the appeal unlocks only if you rate the disposal "Poor" — a question ~70% of
citizens are never asked. See [failure mode 3](../00-mission/02-the-problem.md#failure-mode-3--the-appeal-is-gated-behind-a-question-most-citizens-are-never-asked).

Here, when the audit finds the reply inadequate **or** the citizen says the problem
persists, the [Appeal Agent](../03-agents/06-agent-appeal.md) has already drafted it:

- Cites the **specific inadequacy** the auditor found, quoted.
- References the original grievance and its registration number.
- States the outcome sought, in the department's own procedural language.
- Notes the elapsed time and any SLA breach as fact.

The citizen sees it, hears it, in both languages, and taps **Send** — same consent gate as
step 5. Nothing is filed without them seeing it.

### Step 10 — You are not alone

Her grievance joins a [cluster](../03-agents/07-agent-cluster.md):

> **46 other people have complained about the same thing.**
> Pension disbursement stoppage · Bihar · May–August 2026
> **38** were closed without resolution. **0** have been paid.
>
> [ See the pattern ]  [ Join this cluster ]

This is the step that converts one person's isolated, exhausting frustration into
**evidence**. It is also the piece that makes Sunvai read as public infrastructure rather
than a personal utility, and it directly attacks
[failure mode 4](../00-mission/02-the-problem.md#failure-mode-4--systemic-problems-are-shredded-into-individual-tickets).

Cluster membership is **verified, never self-declared** — see
[`03-trust-and-antigaming.md`](03-trust-and-antigaming.md).

### Step 11 — The receipt

At every meaningful point, the citizen can take away a **receipt**:

- Registration number, full event timeline, the audit verdict and its reasoning.
- A **hash chain** they can verify — in the browser, or by handing the file to anyone else.
- Downloadable and shareable. Works after they close the tab.

> *"The department cannot quietly change your dates, rewrite what they told you, or
> backdate your clock. If they do, this file will not verify — and you will be able to
> show that to anyone."*

Spec: [`../02-architecture/03-ledger.md`](../02-architecture/03-ledger.md).

### Step 12 — The public number

One public page. Not a dashboard — **one number, and how it is built**:

> **Disposal rate: 94.0%.  True resolution rate: 39.4%.**
> *Of the grievances closed in this synthetic demo dataset, this many citizens confirmed their
> problem was actually solved. The page labels both figures as simulated before showing them;
> the measured figures on the site are the eval results, and they sit in a separate section.*

Broken down **by office, never by named official**. This is the north star made visible,
and it is the number that does not exist in India today.

---

## Coming back

Our users do not have persistent sessions. The phone is shared, the browser gets cleared,
the tab was closed three weeks ago.

**Return path:** phone number + grievance number, no password. A magic-link-style code in
the demo, clearly labelled as mocked auth. Anything filed on this device stays listed
locally so a returning citizen sees their cases without typing anything.

---

## What the reviewer must be able to do

The acceptance test for [`../04-build/04-build-order.md`](../04-build/04-build-order.md):

1. Open the public URL on a phone. **No login.**
2. Tap a demo case. See a real closure with real bureaucratic text.
3. See it translated and de-jargoned.
4. **See the audit verdict with quoted evidence, and open the reasoning.**
5. Answer *"did this actually work?"* — by voice or tap.
6. See the appeal already drafted, in both languages, and send it.
7. See the cluster and the count of others.
8. Download the receipt and **verify the hash chain in the browser.**
9. See the public resolution-rate page.
10. Optionally: file a new grievance by voice, end to end, through the consent gate.

**Steps 1–8 must work flawlessly. Step 10 may be shallower.** If time runs out, depth on
the audit beats breadth on intake — every time.

---

**Next:** [`02-india-nuances.md`](02-india-nuances.md) — the friction we design against.
