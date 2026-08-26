# Project Summary — under 250 words

> Part of the [Sunvai Round Table](../README.md).
> Brief: *"A project summary under 250 words explaining what it is and why it is better
> than the current solution."*

---

## Submission text — 238 words (including the title line)

> **Sunvai — the accountability layer for public grievances**
>
> India's grievance portal, CPGRAMS, has spent two years fixing its front door. Filing is
> now easy: 22 languages, 5 lakh service centres, and an AI voice chatbot, Samadhan Didi,
> launched May 2026. That is solved.
>
> What happens after you file is not. Departments are measured on *disposal*, so they
> dispose — closing cases with "matter forwarded to concerned department" and marking them
> resolved. In May 2026, roughly 2.6 lakh grievances were closed; the feedback call centre
> reached about 79,000 people. The rest were never asked whether anything changed. And the
> appeal that would hold someone accountable unlocks only if you rate the closure "Poor" — a
> question most citizens are never asked.
>
> Sunvai begins where the current system ends. When your grievance is closed, we read the
> department's reply against what you actually asked, and tell you — in your language, out
> loud, quoting their exact words — whether it answers you. We ask every citizen whether
> their problem was really fixed. When it wasn't, your appeal is already written. Your case
> joins everyone with the same root cause. All of it enters a hash-chained record you can
> verify in your own browser.
>
> CPGRAMS publishes a disposal rate. We publish a true resolution rate — from citizens, not
> from our AI — beside our auditor's accuracy on 74 replies labelled before the prompt
> was written. The demo corpus is synthetic and labelled so: disposal 94.0%, resolution 39.4%.
>
> The government fixed the front door. This is the back half.

---

## Why it is built this way

**Names Samadhan Didi in the third sentence.** Anyone close to DARPG knows it shipped. Naming
it first converts our biggest competitive risk into evidence that we did the research — and
makes the positioning inarguable rather than defensive.

**Leads with numbers, not adjectives.** 2.6 lakh closures against 79,000 feedbacks is the
entire argument, and it is checkable. No superlatives appear anywhere.

**"From citizens, not from our AI"** pre-empts the sharpest question a technical judge will
ask: *what stops departments writing for your model?* Answering it inside 250 words signals
that the design is deliberate.

**Publishes how often our own auditor is wrong.** The most credible sentence available, because
nobody inflates their own failure rate — and it is now a measured figure (74 hand-labelled
replies) rather than the disagreement rate over the synthetic corpus, which measured nothing.

**Ends on the positioning line**, which is the same line that closes the video and heads the
landing page. One sentence, everywhere.

## Rules if this is edited

- **Stay under 250.** Current: **238**, including the title line.
  Counted as whitespace-separated tokens of the block quote below, after stripping the `> `
  markers and dropping standalone em-dashes (` — `), which are punctuation and not words.
  To reproduce exactly — the block quote is the lines from the title line to the closing line:

  ```sh
  awk 'NR>=11 && NR<=34' 03-summary-250-words.md | sed 's/^> //' | grep -o '[^ ][^ ]*' | grep -vx '>' | grep -vx '—' | grep -c .
  ```

  Plain `wc -w` on the same text reports **245**, because it counts the 7 standalone em-dashes.
  Either number is under the ceiling; quote the 238 and say how it was counted, so the next
  person does not re-derive a third figure. Re-count after any edit — the ceiling is hard.
- Never remove the Samadhan Didi sentence.
- Never remove "from citizens, not from our AI."
- Never add "revolutionary", "seamless", "AI-powered", or "blockchain".
- Keep the closing line verbatim.

---

**Next:** [`04-judging-scorecard-map.md`](04-judging-scorecard-map.md)
