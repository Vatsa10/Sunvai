# Project Summary — under 250 words

> Part of the [Sunvai Round Table](../README.md).
> Brief: *"A project summary under 250 words explaining what it is and why it is better
> than the current solution."*

---

## Submission text — 250 words (including the title line)

> **Sunvai — the accountability layer for public grievances**
>
> India's grievance portal, CPGRAMS, has spent two years fixing its front door. Filing is
> now easy: 22 languages, 5 lakh service centres, and an AI voice chatbot, Samadhan Didi,
> launched May 2026. That is solved.
>
> What happens after you file is not — yet. Departments are measured on *disposal*, so they
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

**Ends on the positioning line**, which heads the landing page. One sentence, everywhere.

> **Note for review:** the video's closing line was widened on 26 Aug to *"The government
> fixed the front door, **and named the back half**. This is the back half, **running**."*
> This summary still ends on the shorter form, because the word ceiling is exactly 250 and
> the longer line does not fit without re-cutting prose that is deliberately balanced. Both
> are true and neither claims invention; if a reviewer wants them identical, that is a
> re-cut of the whole final paragraph, not a word swap.

**Credits DARPG, does not claim discovery.** *"What happens after you file is not — yet"* is
the one-word reframe this summary can afford. It is deliberate: **we did not discover that
disposal is not resolution.** Dr Jitendra Singh said it on 9 Jul 2025 (*"Citizen
Satisfaction, Not Just Disposal"*), the AI-HI hybrid model was announced on 17 Jun 2026
*"after the government found that disposal of grievances alone did not always translate into
citizen satisfaction"*, and the PIB factsheet of 9 Aug 2026 names *"AI-enabled validation of
grievance redressal to assess resolution quality."* The summary therefore claims only what
is ours: a working implementation, and the evidence in the citizen's hands. **The word
"yet" is doing that work.** See
[`../00-mission/03-competitive-landscape.md`](../00-mission/03-competitive-landscape.md).

## Rules if this is edited

- **Exactly 250.** The rules slide says *exactly* 250. Current: **250**, including the title
  line. **There is no headroom left: any word added must be paid for by a word removed.**
  Counted as whitespace-separated tokens of the block quote, after stripping the `> ` markers,
  the bare `>` lines between paragraphs, and standalone em-dashes, which are punctuation
  rather than words.

  Do **not** count by line numbers. A previous edit of this file documented the range
  `NR>=11 && NR<=34`, which silently dropped the closing sentence and certified 238 as the
  answer — a line range is wrong the moment anyone adds a paragraph above it. Count between
  delimiters the document already carries: the `## Submission text` heading and the `---` rule
  that follows it, taking only the quoted lines between them.

  ```sh
  awk '/^## Submission text/,/^---$/' 03-summary-250-words.md | grep '^>' | sed 's/^> //' | grep -o '[^ ][^ ]*' | grep -vx '>' | grep -vx '—' | grep -c .
  ```

  Actual output of that command against this file, as it stands:

  ```
  250
  ```

  Plain `wc -w` over the same text reports **258**, because it counts the 8 standalone
  em-dashes as words. 250 is the figure to quote. Re-count after any edit — the target is
  exact, and there is no room left.
- Never remove the Samadhan Didi sentence.
- Never remove the word "yet". It is the whole of the credit to DARPG inside the 250, and
  without it this reads as a discovery claim in front of officials who published the thesis
  first.
- Never quote an appeal rate. None is published. Inventing or estimating one is fatal.
- Never say CPGRAMS has no appeal or no oversight — a Nodal Appellate Authority with a
  30-day norm exists. The sentence here attacks the **gate**, which is quoted verbatim from
  pgportal.gov.in, and that is the only safe target.
- Never remove "from citizens, not from our AI."
- Never add "revolutionary", "seamless", "AI-powered", "blockchain", "immutable" or
  "tamper-proof". "Hash-chained record you can verify in your own browser" is the accurate
  phrasing and is already in the text.
- Keep the closing line verbatim.

---

**Next:** [`04-judging-scorecard-map.md`](04-judging-scorecard-map.md)
