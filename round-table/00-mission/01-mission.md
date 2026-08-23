# Mission

> Part of the [Sunvai Round Table](../README.md). Read with
> [`02-the-problem.md`](02-the-problem.md) and [`03-competitive-landscape.md`](03-competitive-landscape.md).

---

## The thesis

**Indian public services do not fail at the form. They fail at the close.**

For two decades, every attempt to improve government service delivery has attacked the
same target: make it easier to *ask*. Simpler forms. Fewer fields. More languages. Voice
input. Chatbots. Common Service Centres. All of it real, all of it useful, and by 2026 all
of it substantially done — see [`03-competitive-landscape.md`](03-competitive-landscape.md).

Meanwhile the thing that actually destroys citizens' trust has gone untouched:

> You ask. You wait. Twenty-one days later a line of text appears that says
> *"matter forwarded to concerned department."* The status changes to **Disposed**.
> A dashboard somewhere ticks up. Nothing about your life has changed, and no one will
> ever ask you whether it did.

That is not a usability problem. It is an **accountability vacuum**, and no amount of
front-door polish reaches it.

## What Sunvai is

**The accountability layer that begins the moment your grievance is closed.**

Five things, in order of importance:

1. **It audits the closure.** An agent reads the department's reply against what you
   actually complained about, and tells you — in your language, out loud — whether that
   reply *substantively addresses your problem* or is deflection, boilerplate, or silence
   dressed as a response.
2. **It asks you.** Every citizen, every closure, proactively, by voice, in their language:
   *"They said this. Did your problem actually get fixed?"* Not a star rating. A question
   about reality. Today roughly 70% of closures are never checked with anyone.
3. **It writes your appeal.** When the audit finds the reply inadequate, the appeal is
   pre-drafted — citing the specific inadequacy, referencing the original grievance,
   ready to review and send. The single largest friction in the accountability path
   removed.
4. **It shows you that you are not alone.** Grievances sharing a root cause are grouped
   across citizens. Five hundred separate tickets about one broken thing become one
   visible pattern with five hundred people behind it.
5. **It remembers, verifiably.** Every state change, promise, closure and re-open is
   written to a tamper-evident hash-chained ledger. The citizen holds a receipt they can
   verify themselves. No one can quietly backdate an SLA or rewrite what they told you.

## The north star metric

Everything in this product serves one number.

> ### CPGRAMS measures **disposal**. Sunvai measures **resolution**.

**Disposal rate** — the metric government reports — is the percentage of grievances
*marked closed*. It is currently excellent and says nothing.

**True resolution rate** — the metric we create — is the percentage of grievances where
**the citizen, asked afterward, confirms their problem was actually solved.**

That number does not exist in India today. Producing it, per department, per office,
publicly and verifiably, is the point of this product. Every feature either helps
measure it or helps improve it. If a proposed feature does neither, cut it.

## Design principles

**1. The agent never acts invisibly.**
No grievance, appeal, or outbound message is ever sent without the citizen seeing the
exact text — in the official language *and* back-translated into theirs — and consenting.
An AI that files documents to the government on your behalf without your comprehension is
a worse product than the form it replaced, no matter how few taps it takes.

**2. Legibility over brevity.**
The failure of the current system is not that it has too many screens. It is that its
screens mean nothing. "Under process" is short and useless. *"Sitting with the Assistant
Engineer, Ward 12, since 6 August. 4 days left on the clock."* is longer and worth
everything. When forced to choose, choose the one the citizen can act on.

**3. If it is not in the ledger, it did not happen.**
Every state transition writes an event. No side channels, no silent mutations, no admin
override that skips the log. This is what lets us make claims about the system's
behaviour that a judge — or a citizen — can check rather than trust.

**4. Honesty is a feature, built in the UI.**
Every mocked dependency is labelled *on the screen where it appears*, not in a footnote.
See [`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md).
This is partly because Honesty is a scored judging criterion, and mostly because a
product about government accountability that is cagey about its own limitations has
refuted itself.

**5. Neither side can game it.**
Officials cannot inflate resolution by closing tickets, because closure is audited and
the citizen is asked. Citizens cannot inflate grievance counts by spamming, because
identity is bound and clusters are verified rather than self-declared. See
[`../01-product/03-trust-and-antigaming.md`](../01-product/03-trust-and-antigaming.md).

**6. Build for the person with the least, not the most.**
The design target is a 2G connection, a shared family phone, limited reading ability, and
a language that is not English or Hindi. Everything else is a strictly easier case. See
[`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md).

## What success looks like

**For the hackathon:** a reviewer opens a public URL on a phone, plays the role of a
citizen whose grievance was just closed with boilerplate, watches the system tell them
*why that reply is inadequate*, taps once to appeal, sees their case join 46 others with
the same root cause, downloads a receipt and verifies its hash — and understands in under
four minutes that they have seen a new category of thing, not a nicer form.

**For India, if this were real:** a published, per-department true resolution rate that
nobody can massage, and an appeal path that opens automatically instead of hiding behind
a question no one is asked.

---

**Next:** [`02-the-problem.md`](02-the-problem.md) — the evidence.
