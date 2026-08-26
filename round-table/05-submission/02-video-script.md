# Video Script — two minutes

> Part of the [Sunvai Round Table](../README.md).
> Brief: **no longer than two minutes.** First minute — demo as a citizen. Second minute —
> how you built it and why you made those choices. Both teammates may present.

**Hard rules:** 2:00 maximum · screen recording, real product, no mockups · the URL visible
early · no real personal data on screen · no government logos.

---

## The structural bet

Most submissions will open by explaining the problem. **We open inside the moment of
failure**, because our problem is one every Indian viewer recognises in four seconds and
needs no setup.

The single most important decision in this script: **minute two credits DARPG before it
claims anything.** We say *Samadhan Didi* out loud, and we read DARPG's own August 2026
factsheet language back to the room — *"resolution quality"*, *"closure without effective
resolution"* — before we say a word about what we built.

**We are not the first to say disposal is not resolution. The government said it first.**
The finals are attended by invited government officials; presenting their stated policy as
our discovery is the fastest available way to lose that room. The claim we *can* make is
narrower and much stronger: **DARPG named this in August. It is in no spec and no portal.
Here it is working, and the evidence is in the citizen's hands, not the department's.**

---

## MINUTE ONE — the citizen *(0:00–1:00)*

### 0:00–0:08 — Cold open, no preamble

*Screen: Kamla's case. The word* **Disposed** *large on screen.*

> "Kamla is 58. Her pension stopped three months ago. She complained.
> Nineteen days later, the government marked it **Disposed**.
>
> This is what they wrote."

*Cut to the raw reply:* **"The matter has been forwarded to the concerned disbursing
authority."**

> "Her pension still hasn't come. Nobody ever asked her."

### 0:08–0:30 — The audit ★

*Screen: the verdict renders.*

> "That's where Sunvai starts.
>
> We read what the department wrote, against what she actually asked for."

*Verdict on screen:* 🔴 **Deflected**

> "**That is not an answer.** It doesn't say why the payment stopped, who's responsible now,
> or when she'll be paid. It moves her file somewhere else and closes it here.
>
> And we show our work —"

*Tap* **"see how we judged this"** *— reasoning and quoted spans appear.*

> "— every quote is verbatim from their reply. If our system can't quote it, it isn't
> allowed to claim it."

### 0:30–0:42 — The question nobody asks

*Screen: the voice prompt, in Hindi.*

> "Then we ask her the question the system never does.
>
> Not 'rate your satisfaction.' **'Has your pension started coming?'**"

*Tap* **नहीं**.

> "Today, about seventy percent of closed complaints — nobody is ever asked."

### 0:42–0:55 — Appeal and cluster

*Screen: the appeal, already written.*

> "Her appeal is already drafted — quoting the exact inadequacy.
>
> She reads it in her own language, and sends it."

*Consent gate, then the cluster page.*

> "And she finds out she's not alone. **Forty-six others**, same office, same problem.
> Thirty-eight closed without resolution. **Zero paid.**"

### 0:55–1:00 — The receipt

*Screen: receipt downloads, dragged onto* `/verify`*, turns green. One date edited. Turns red.*

> "And she keeps a receipt nobody can quietly change."

---

## MINUTE TWO — how and why *(1:00–2:00)*

### 1:00–1:22 — The credit ★ *the most important 22 seconds*

> "We were going to build voice-first complaint filing. **DARPG shipped that in May** —
> Samadhan Didi, twenty-two languages, on Bhashini. So we looked at what happens *after*
> closure. The government had got there first."

*Screen: the PIB factsheet of 9 Aug 2026, the phrase highlighted.*

> "Three weeks ago, DARPG: **'validation of grievance redressal to assess resolution
> quality'** — **'closure without effective resolution.'** That's this product, named by the
> government, not by us."

### 1:22–1:34 — So what is ours

*Screen: split — the 154-page NextGen spec, searched, zero hits; beside it pgportal.gov.in
showing* `Version 7.0.01092019.0.0`*, last updated 21-08-2026.*

> "Except those words appear nowhere in DARPG's own 154-page spec, and the live portal still
> runs version seven.
>
> **The idea isn't ours. The working thing is** — and the part they didn't name: the evidence
> ends up in **her** hands, not the department's."

### 1:34–1:40 — What we do not claim

> "So, two things we don't claim. We didn't discover that disposal isn't resolution — the
> minister said that in 2025. And we're not the first to name closure-quality auditing.
> We're showing you it running."

### 1:40–1:52 — The design decision that matters

> "One thing to judge us on. **Our AI's verdict is not the score.** Once departments know a
> model reads their replies, some will write for the model. So the number we publish comes
> from **the citizen's answer**. A perfect reply still scores zero if the pension never came."

*Screen:* `/numbers`, part two — **Disposal 94.0% · True resolution 39.4%**, under the heading
that says these come from a synthetic corpus.

> "CPGRAMS measures disposal. **We measure resolution.** Nobody publishes that number in
> India. Both figures here are from a synthetic corpus of 2,800 cases — the page says so, and
> no office on it is real."

*Cursor scrolls up to part one: what we measured.*

> "Seventy-four replies, hand-labelled before we wrote the prompt. It never accused a
> department that had answered. It caught 87.5% of the replies we wrote to fool it. One test
> it fails — and we left it failing, on screen, in the demo."

### 1:52–1:56 — Build and architecture

> "Next.js, Supabase, OpenAI models, built with Codex from a spec in the repo. The ledger's a
> hash chain, verified **in your browser**, not our server. **CPGRAMS is mocked**, behind an
> adapter — the brief says don't touch live government systems."

### 1:56–2:00 — Close

> "What we'd need next isn't technical. It's an access agreement.
>
> **The government fixed the front door, and named the back half. This is the back half,
> running.**"

---

## Production notes

**Do:** real screen recording on a phone frame · read the actual bureaucratic reply aloud,
it lands harder than any description · let the receipt turn red on screen, it needs no
narration · show Hindi UI, not English, in minute one.

**Don't:** open with a logo animation · explain the problem before showing it · say
"revolutionary", "seamless", "blockchain", "immutable" or "tamper-proof" (it is a hash chain
in Postgres, and a receipt is a non-contiguous slice that cannot prove nothing was removed
from the gaps) · open on voice — voice intake is Samadhan Didi's, not ours, and it must
never be the first thing in this video · claim we invented any of this · **quote an appeal
rate** — none is published anywhere, and inventing one is an unforced fatal error; the safe
line is *"CPGRAMS publishes disposal every month and has never published how many citizens
appealed"* · say CPGRAMS has no escalation or no oversight — there is a Nodal Appellate
Authority with a 30-day norm and a Directorate of Public Grievances; **attack the gate, not
the tier** · show a slide deck · exceed 2:00 by even three seconds.

**Pace — read this before recording.** Counted, not estimated (spoken lines only,
`awk '/^## MINUTE ONE/,/^## MINUTE TWO/' 02-video-script.md | grep '^>' | sed 's/^> //' | wc -w`):
**minute one ≈ 189 words, minute two ≈ 332.** Comfortable narration is ~160 wpm. **This
script as written does not fit 2:00 read straight through, and it never did** — the previous
version was 370 words in minute two. Minute one survives because long stretches are visual
and silent; minute two does not.

Minute two is now four beats instead of three — **credit · what's ours · what we do not
claim · design and build** — and every beat was compressed to pay for the two new ones, so
it is 38 words shorter than before while carrying more.

**Do a timed read-aloud pass before recording.** If it runs long, cut in this order:
1. The architecture beat, down to *"built with Codex from a spec in the repo"*.
2. The eval sentence about 87.5%, keeping *"one test it fails, and we left it failing."*
3. The closing *"access agreement"* line.

**Never cut**, at any length: the **credit beat** (1:00–1:22) or the ***what we do not
claim*** beat (1:34–1:40). Running to 2:00 with those intact beats running to 1:50 without
them — a submission that presents government policy as its own discovery, in a room
containing the officials who set it, loses on a criterion no edit can recover.

**If two presenters:** one takes minute one as the citizen's story, one takes minute two as
the builder. Hand over at exactly 1:00 — the split matches the brief's own structure.

---

## What we do not claim — the standing list

Anyone rehearsing or re-cutting this video is bound by these. Each corresponds to a claim
that would be false in front of the officials attending the finals.

| We do **not** claim | Because |
|---|---|
| That we discovered disposal is not resolution | Dr Jitendra Singh, 9 Jul 2025: *"Citizen Satisfaction, Not Just Disposal"* |
| That we are first to name closure-quality auditing | PIB factsheet, 9 Aug 2026, names it as a NextGen CPGRAMS feature |
| That post-closure follow-up is our idea | The minister called for *"a human interface after grievance disposal"* |
| That cross-citizen clustering is our idea | Same speech: *"identification of recurring grievance patterns to flag deeper policy issues"* |
| That AI grievance work is unexplored | The government's own **AI-HI hybrid model**, announced 17 Jun 2026 |
| That voice or multilingual intake is ours | Samadhan Didi, 30 May 2026, 22 languages, Bhashini |
| That CPGRAMS has no appeal, escalation or oversight | Nodal Appellate Authority, 30-day norm; Directorate of Public Grievances |
| Any appeal rate, in any form | None is published. Inventing or estimating one is fatal |
| That the ledger is immutable or tamper-proof | Hash chain in Postgres; a receipt is a non-contiguous slice |

**What we do claim, and all we claim:** DARPG named this in August 2026; it is in no
engineering spec and on no live portal; here it is working, and the evidence is in the
citizen's hands rather than the department's.

---

**Next:** [`03-summary-250-words.md`](03-summary-250-words.md)
