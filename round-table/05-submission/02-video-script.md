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

The single most important decision in this script: **we say Samadhan Didi out loud, in the
second minute.** Naming what the government already shipped, and then showing that we built
somewhere else deliberately, is the strongest possible evidence of *product thinking* — a
scored criterion. Hiding it invites a judge to discover it themselves, which is fatal.

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

### 1:00–1:18 — The pivot ★ *the most important 18 seconds*

> "Here's the choice that shaped this build.
>
> We were going to build voice-first, multilingual complaint filing. Then we found that
> **DARPG shipped exactly that on the 30th of May** — Samadhan Didi, built with Bhashini.
> Twenty-two languages, AI routing, follow-up questions. It's good.
>
> So intake is solved. We went and looked at what **isn't**."

*Screen: the intake-vs-outcome table from the landscape doc.*

> "Every improvement of the last two years is on the front door. **Nothing is on what
> happens after your complaint is closed.** That's the whole gap, and that's where we built."

### 1:18–1:36 — The design decision that matters

> "One thing we want to be judged on.
>
> **Our AI's verdict is not the score.** Once departments know a model reads their replies,
> some will write for the model. So the number we publish comes from **the citizen's
> answer**, not ours. A department can write a perfect reply and still score zero if the
> pension never arrived."

*Screen:* `/numbers`, part two — **Disposal 94.0% · True resolution 39.4%**, under the heading
that says these come from a synthetic corpus.

> "CPGRAMS measures disposal. **We measure resolution.** That number doesn't exist in India
> today. These two figures come from a synthetic corpus of 2,800 cases — the page says so
> above them, and no office named on it is real."

*Cursor scrolls up to part one: what we measured.*

> "This is the measured half. Seventy-four closure replies we labelled by hand before we wrote
> the prompt. It never accused a department that had actually answered. It caught 87.5% of the
> replies we wrote to fool it. One test it fails, and we left it failing. One of our three demo
> cases is one we get wrong, on purpose."

### 1:36–1:52 — Build and architecture

> "Next.js, Supabase Postgres, OpenAI models, built with Codex from a written spec that
> ships in the repo.
>
> The ledger is a hash chain in Postgres — append-only, and verified **in your browser**, not
> by our server.
>
> Everything that touches the outside world is behind an adapter. **CPGRAMS is mocked** —
> the brief says don't touch live government systems, and scraping a government portal was
> never an architecture that could ship. Adding EPFO is one file. The audit, the ledger and
> the metric don't change, because none of them know what CPGRAMS is."

### 1:52–2:00 — Close

> "What we'd need next isn't technical. It's an access agreement, and somewhere for this
> number to live that nobody can massage.
>
> **The government fixed the front door. This is the back half.**"

---

## Production notes

**Do:** real screen recording on a phone frame · read the actual bureaucratic reply aloud,
it lands harder than any description · let the receipt turn red on screen, it needs no
narration · show Hindi UI, not English, in minute one.

**Don't:** open with a logo animation · explain the problem before showing it · say
"revolutionary", "seamless", or "blockchain" · show a slide deck · exceed 2:00 by even three
seconds.

**Pace:** ~150 words minute one (visuals carry it), ~190 minute two. Rehearse to 1:52 so the
upload isn't rejected on a rounding error.

**If two presenters:** one takes minute one as the citizen's story, one takes minute two as
the builder. Hand over at exactly 1:00 — the split matches the brief's own structure.

---

**Next:** [`03-summary-250-words.md`](03-summary-250-words.md)
