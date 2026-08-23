# India Nuances — the friction catalogue

> Part of the [Sunvai Round Table](../README.md). Judging criteria: *Usability* —
> *"designed for real Indian users, including people on mobile devices, slower connections
> or with limited digital experience."*

**The design target is the person with the least, not the most:** a 2G connection, a
shared family phone, limited reading ability, and a language that is neither English nor
Hindi. Every other user is a strictly easier case.

Each row below is a real friction, its consequence, and the **specific mechanism** in our
build that answers it. Nuances without mechanisms are decoration.

---

## 1. Literacy is not the same problem as language

Translation solves *language*. It does nothing for someone who cannot comfortably **read**
any script, including their own. India's grievance system has done real work on
translation and still reports that a multilingual interface is *"insufficient to overcome
fundamental accessibility challenges."*

**Mechanism:** voice is not only an *input* mode, it is an **output** mode. Every screen
has a read-aloud control, and the critical screens — the audit verdict, the consent gate,
the appeal draft — **auto-offer** speech rather than hiding it behind a button. Nothing
important is text-only. Icons always carry text labels; text labels always carry audio.

**Test:** navigate the entire journey with the screen ignored, using audio alone. If a step
becomes impossible, that step is broken.

---

## 2. The phone is shared and the session is gone

The device belongs to the household. Browsers get cleared. The tab was closed three weeks
ago. Assuming a persistent logged-in session is a middle-class assumption.

**Mechanism:** no login wall at entry. Return by **phone number + grievance number**, no
password. Cases filed on a device are listed locally so returning costs zero typing.
Nothing sensitive renders without the return code, so a shared phone does not leak a
neighbour's grievance.

---

## 3. The person filing is often not the person aggrieved

A son files for his father's pension. A CSC operator files for a villager — CPGRAMS is
integrated with 5 lakh+ Common Service Centres and ~2.5 lakh Village Level Entrepreneurs
precisely because this is the norm, not the exception.

Most software treats this as fraud to be prevented. It is the **majority path**.

**Mechanism:** **assisted filing as a first-class mode.** *"I am filing for someone else"*
is on the first screen, not buried. When chosen:
- The aggrieved person's name and relationship are captured.
- **Consent from the aggrieved person is recorded as a ledger event**, including how it was
  obtained (in person / on call).
- **Both** contacts can receive updates, so the citizen is not dependent on the helper
  remaining reachable.
- The helper's identity is in the ledger — accountability runs in both directions.

---

## 4. 2G, patchy signal, and expensive data

**Mechanism:**
- First paint **under 100KB**. No hero video, no heavy font stack, no client-side
  framework bloat on the landing route.
- Voice captured **locally first**; upload queued and retried when the connection returns.
  The UI says *"Saved on your phone. Will send when the network comes back."* — never a
  silent failure.
- Optimistic UI with honest reconciliation: show the action taken, mark it *pending*, never
  fake success.
- Audio compressed aggressively before upload; TTS cached per phrase, not regenerated.
- Every network-dependent screen has a defined offline state. **No infinite spinners** —
  a spinner with no timeout is the single most common way Indian public-service sites fail
  their users.

---

## 5. Fear of retaliation

A citizen complaining about a local official may live fifty metres from them. Fear is a
rational reason not to file, and no UI improvement touches it.

**Mechanism:**
- **Who can see what is stated plainly before filing**, in their language — not in a
  privacy policy.
- Clusters are shown as **counts and patterns, never as a list of complainants' names.**
- We aggregate by **office, never by named official** — this protects citizens from
  retaliation and protects us from defaming an individual. See
  [`03-trust-and-antigaming.md`](03-trust-and-antigaming.md).
- Where a grievance is against a named local officer, the citizen is told which parts of
  their text will be visible to that office.

---

## 6. Bureaucratic language is a second foreign language

*"Disposed"*, *"nodal officer"*, *"subordinate organisation"*, *"the matter has been
forwarded to the concerned authority"* — these are opaque to fluent English speakers and
impenetrable otherwise. Worse, **"Disposed" reads like a positive outcome** to a citizen
who has never been told what it means.

**Mechanism:** the [jargon table](04-content-and-voice.md#the-jargon-table) — every term
rendered as a human sentence, inline, tappable to reveal the original. Applied to
*incoming* department text automatically. This single feature does more for comprehension
than translation alone.

---

## 7. The document is a blurry photo, sideways, in a regional script

A rejected claim, a pension order, a receipt — photographed at an angle, in bad light,
possibly in Devanagari or Telugu.

**Mechanism:** the [Document Agent](../03-agents/08-agent-document.md) reads it, extracts
what is needed, and — critically — **tells the citizen it is unreadable *before*
submission** with a specific instruction (*"the number at the bottom is cut off — take it
again including the last line"*). Today this class of failure surfaces three weeks later
as a rejection.

---

## 8. Names do not transliterate consistently

*Mohammed / Mohammad / Md. / Muhammed.* *Krishnan / Krishnan Nair / K. Nair.* Indian names
vary across every document a citizen owns, and **identity mismatch is a leading cause of
rejection** across Indian public services.

**Mechanism:** fuzzy, transliteration-aware matching when linking a citizen to an existing
case; never a hard string equality check on a name. Where a mismatch is detected, we
surface it as a *warning to fix before filing*, not an error after.

---

## 9. WhatsApp and the feature phone are the real channel

For a very large number of our users, the actual interface is WhatsApp or a voice call —
not a browser.

**Mechanism:** channel is an **adapter**, not an assumption. `WebChannel` is built;
`WhatsAppChannel` and `IVRChannel` are defined interfaces with stub implementations,
**clearly disclosed as unbuilt** ([`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md)).
Building them needs Meta Business approval and a telecom number we cannot obtain in six
days; designing for them costs nothing and is the honest answer to *"how does this reach
the people who need it most?"*

All content is therefore written to survive **without layout** — plain sentences that work
equally as a web card, a WhatsApp message, or spoken audio. See
[`04-content-and-voice.md`](04-content-and-voice.md).

---

## 10. Distrust is the baseline, and it is earned

A citizen whose complaint was closed with boilerplate has excellent reason to believe the
next digital promise is also decorative. Commentary on CPGRAMS notes that most citizens
stop after closure *"convinced the portal is decorative."*

**Mechanism:** we do not ask to be trusted. We show our work.
- Department text is shown **raw first**, translation second.
- The audit verdict always links to **its reasoning and quoted evidence**.
- The [ledger](../02-architecture/03-ledger.md) is verifiable **by the citizen**, not by us.
- We disclose our own error rate and log every case where our auditor disagreed with the
  citizen.

---

## 11. Elderly users and low vision

Pension and welfare grievances skew old. Small type and thin grey text are common on
Indian government portals and are effectively an access barrier.

**Mechanism:** base font ≥18px, minimum contrast 7:1 (AAA) for body text, touch targets
≥48px, no critical information conveyed by colour alone (every verdict carries an icon and
a word, not just red or green), and a text-size control that persists.

---

## 12. Deadlines and clocks are invisible until they have passed

The 21-day clock exists but the citizen experiences it as silence.

**Mechanism:** the SLA clock is **always visible, in days remaining, in plain words**, and
escalation happens automatically with the citizen informed that it happened. Time pressure
should be felt by the department, not the citizen.

---

## Anti-nuance: things that look like empathy and are not

- **Translating the interface but not the department's reply.** The reply is the part that
  matters.
- **Adding a language picker with 22 entries, 16 of which are machine-translated badly.**
  Ship fewer, well. See [`04-content-and-voice.md`](04-content-and-voice.md#language-policy).
- **Illustrations of villages and farmers.** Decoration is not accessibility.
- **A chatbot that is friendly but cannot do anything.** Warmth without capability reads
  as condescension.
- **Asking for feedback with five stars.** *"Did your pension start coming?"* is the
  question. A rating is a proxy that lets everyone avoid the answer.

---

**Next:** [`03-trust-and-antigaming.md`](03-trust-and-antigaming.md) — why neither side can game this.
