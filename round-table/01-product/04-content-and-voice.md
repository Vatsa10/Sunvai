# Content, Voice and Language

> Part of the [Sunvai Round Table](../README.md). Every string an agent writes into this
> product follows this document.

---

## Tone

We are talking to someone who has already been let down by a government system, possibly
several times, and who has good reason to think we are another decorative portal.

**We sound like:** a competent friend who has read the file and will tell you the truth.

**We do not sound like:** a government form, a customer-service bot, a startup, or an
activist.

| Do | Don't |
|---|---|
| *"They marked this closed. We don't think it's solved."* | *"Your grievance status has been updated to Disposed."* |
| *"9 days left for them to reply."* | *"SLA compliance window: 21 days."* |
| *"That is not an answer."* | *"The response appears to be suboptimal."* |
| *"Has your pension started coming?"* | *"Please rate your satisfaction 1–5."* |
| *"Saved on your phone. We'll send it when the network comes back."* | *(a spinner)* |
| *"We were wrong about 8 of these."* | *(silence)* |

**Four rules:**

1. **Short sentences. One idea each.** Everything must survive being read aloud by a
   screen reader or a TTS voice at speed.
2. **Name the actor.** *"The department did X"*, not *"X was done."* Passive voice is how
   accountability disappears.
3. **Never celebrate.** No confetti, no "Great job!", no exclamation marks. The user is not
   having a nice time. Warmth is in clarity, not enthusiasm.
4. **Never hedge into meaninglessness.** If the auditor is uncertain, say *"we are not
   sure"* and show the confidence — do not soften a clear verdict into mush.

---

## Language policy

CPGRAMS accepts all **22 Eighth Schedule languages** via Bhashini. We cannot match that
breadth well in six days, and a half-working language is worse than an absent one — it
looks inclusive while failing the person who selects it.

**Ship these six, done properly:**

| Language | Script | Why |
|---|---|---|
| हिन्दी | Devanagari | Largest reach; pension/welfare grievance base |
| English | Latin | Reviewers, and the official language of most replies |
| বাংলা | Bengali | Large base, distinct script |
| தமிழ் | Tamil | Distinct script, strong regional-identity signal |
| తెలుగు | Telugu | Large base, distinct script |
| मराठी | Devanagari | Large base, shares script with Hindi — tests that we handle same-script/different-language correctly |

**Disclose the rest honestly** on the how-this-works page: *"CPGRAMS supports 22 languages
through Bhashini. We ship six, properly. A production Sunvai would run on Bhashini rather
than duplicate it."* See
[`../00-mission/03-competitive-landscape.md`](../00-mission/03-competitive-landscape.md#bhashini-vs-openai--an-honest-note).

### The three-language problem

Every screen involves up to three languages at once, and conflating them is the most
common way multilingual government products fail:

1. **The citizen's language** — everything they read or hear.
2. **The official language of the department** — usually English, sometimes Hindi. What
   actually gets filed.
3. **The original text of the department's reply** — must always be viewable **raw**.

**Rule:** the citizen always sees their language *and* can always reach the original in one
tap. We never replace the source; we sit beside it. On the
[consent gate](01-citizen-journey.md#step-5--routed-visibly-then-consented), both are shown
**simultaneously**, not behind a toggle — the citizen must be able to see exactly what is
being sent in the language it is being sent in.

### Voice

- **Input:** free-form speech, any of the six, code-mixed accepted (Hinglish is how people
  actually talk — never correct it, never reject it).
- **Output:** read-aloud on every screen; **auto-offered** on the audit verdict, the consent
  gate and the appeal draft.
- **Never** auto-play audio without a tap. Data costs money and a shared phone may be in a
  room with other people.
- TTS output is cached per phrase — regenerating identical audio wastes the user's data.

---

## The jargon table

Applied automatically to incoming department text. Each term renders as a human sentence,
tappable to reveal the original. **This single feature does more for comprehension than
translation alone**, because the words are opaque even in English.

| Official term | What we say |
|---|---|
| **Disposed** | Closed. The department has marked this finished. *(Note: this does not mean solved.)* |
| **Under process** | Someone has it. Nothing has been decided yet. |
| **Pending** | Nobody has acted on it yet. |
| **Nodal Officer** | The person responsible for your complaint at that office. |
| **Grievance Redressal Officer (GRO)** | The officer whose job is to answer complaints at that office. |
| **Subordinate organisation** | A smaller office that works under the main department. |
| **Matter forwarded to concerned department** | They sent it somewhere else and stopped tracking it here. |
| **Noted for future action** | They have written it down. Nothing is scheduled. |
| **Appropriate action is being taken** | They have not said what they are doing. |
| **The matter does not pertain to this office** | They say this is not their job. |
| **You may approach the State Government** | They are telling you to start again somewhere else. |
| **Appeal** | Ask a more senior officer to look at how your complaint was handled. |
| **Appellate Authority** | The senior officer who reviews complaints that were handled badly. |
| **Registration Number** | Your complaint's ID number. Keep it — it is how you find your case again. |
| **PG Case No.** | The same thing as a registration number. |
| **Closed with remarks** | Closed, with a note explaining why — read the note. |
| **Reminder sent** | Someone asked them again. Nothing else changed. |

> **The most important row is the first.** *"Disposed"* sounds like a good outcome to a
> citizen who has never been told otherwise. Making that word honest is a meaningful part
> of what this product does.

Full machine-readable table lives at `content/jargon.<lang>.json` — see
[`../04-build/02-repo-structure.md`](../04-build/02-repo-structure.md).

---

## Naming and visual identity

**Product name: Sunvai (सुनवाई)** — *a hearing*. Both "being listened to" and "a hearing"
in the procedural sense. The whole product in one word.

### Rules that come from the brief

The brief prohibits presenting the prototype as an official government product or using
government logos in a way that suggests approval. This is a **design constraint, not a
disclaimer**:

- ❌ No Ashoka emblem, no ministry or department logos, no `.gov.in`-style domain.
- ❌ No saffron-white-green masthead lockup that reads as an official banner.
- ❌ No copy containing "official", "authorised", "in partnership with", or "Government of".
- ✅ A persistent, quiet line in the header: **"An independent civic tool. Not a government
  service."** — in the citizen's language.

We may **name** CPGRAMS, DARPG and departments factually — that is description, not
endorsement.

### Visual direction

Serious, calm, high-contrast, fast. Closer to a public utility bill than to a consumer app.
Generous type, plenty of whitespace, almost no colour — colour reserved for **verdicts**,
which is the only place it carries meaning.

Accessibility floor (non-negotiable, from
[`02-india-nuances.md`](02-india-nuances.md#11-elderly-users-and-low-vision)):
body text ≥18px · contrast ≥7:1 · touch targets ≥48px · **no meaning by colour alone** —
every verdict carries an icon *and* a word · persistent text-size control · full journey
completable by audio.

---

## Writing for a channel we have not built

All copy must survive **without layout**, because the production channel for our users is
WhatsApp or a voice call, not a browser
([`02-india-nuances.md`](02-india-nuances.md#9-whatsapp-and-the-feature-phone-are-the-real-channel)).

**Practical test for every string:** does it still make sense as a single plain-text line
in a WhatsApp message, with no heading above it and no button beside it?

- ❌ *"Tap below to continue"* — there is no below.
- ✅ *"Reply YES if your pension has started coming."*
- ❌ A table conveying essential meaning.
- ✅ The same facts as sentences.

---

## Strings we will get asked about

Pre-written, because these are the moments where a bad sentence costs trust.

**When the auditor is uncertain:**
> *"We are not confident about this one. The department's reply is short and we cannot tell
> whether it solves your problem. Read it yourself below — and tell us if it did."*

**When we were wrong:**
> *"We said this was not solved. You told us it was. We have recorded that we got this one
> wrong."*

**When something is mocked:**
> *"This is demo data. In a real version this would come from the department's own system.
> [What's real and what's not]"*

**When a network action fails:**
> *"That didn't send. It is saved on your phone. We will try again when the network comes
> back."*

**Before anything is filed:**
> *"This is exactly what we will send. Nothing else. Read it, or listen to it, first."*

**On the public number:**
> *"94% of these complaints were closed. 39% of the people who filed them say their problem
> was actually solved. These are synthetic cases — the page says so above the numbers."*

---

**Next:** [`../02-architecture/01-system-overview.md`](../02-architecture/01-system-overview.md) — how it is built.
