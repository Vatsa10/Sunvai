# Hackathon Brief — extracted constraints

> Part of the [Sunvai Round Table](../README.md). Source: *Builder brief — Build What
> Moves India*, `buildwhatmovesindia.com/brief`. This is a faithful extraction, not a
> paraphrase; where we interpret, it is marked **[our reading]**.

---

## The challenge

Pick **one real problem you have faced** on an Indian public-service website or digital
service. Build a simpler, clearer, more useful way to solve it. Travel, taxes, pensions,
certificates, payments, grievances or any other public need. IRCTC, EPFO and the Income
Tax portal are named as *examples, not a fixed list*.

**Our pick:** public grievance redressal — specifically the accountability gap after
closure. See [`01-mission.md`](01-mission.md).

---

## Timeline — hard dates

| Date | Event |
|---|---|
| **28 Aug 2026, 20:00 IST** | **Submission deadline. No grace period after the form closes.** |
| 28 Aug – 1 Sep 2026 | Reviewed by the team with OpenAI |
| ~1 Sep 2026 | Top **250** shortlisted; every entrant emailed the result |
| 1–7 Sep 2026 | One week of mentorship — WhatsApp group, five mentors from engineering, tech and the OpenAI team |
| **7 Sep 2026** | Improved build resubmitted, same format, same email addresses |
| 8–12 Sep 2026 | **10 finalists** announced; top 250 honoured on a public page |
| **12 Sep 2026** | Finals live in **Bengaluru** — founders, creators, mentors, invited government officials. Winners same day |

Use the **same email address at every step** — it is how entries are tracked, and an entry
cannot be moved to another address.

---

## What must be true of the build

- **Built with Codex or powered by an OpenAI model.** Codex must be *"a meaningful part of
  how you build it, not something added only for the submission."*
- **A complete citizen journey**, solving the real problem start to finish.
- **Mock data, accounts and backend behaviour** wherever production access would be unsafe
  or unavailable.
- **Reviewers will test the citizen experience, not an admin panel.**

The prototype must:

1. Solve **one clearly defined** user problem.
2. Let a reviewer complete the **main journey from start to finish**.
3. Be **easier to understand or use** than the current experience.
4. Be designed for **real Indian users — mobile devices, slower connections, limited
   digital experience.**
5. Use **mock or synthetic data** wherever personal information, payments, OTPs or
   government systems would normally be involved.

**Show the complete citizen journey.** A static design is not enough — *"the interface and
interactions should work from start to finish, while mocked data and dependencies should
be clearly identified."*

---

## Six questions a strong build answers

The brief says a strong submission makes these obvious. Treat them as a checklist for the
video, the summary and the landing page.

1. **Who is facing the problem?** → [personas](02-the-problem.md#who-is-hurt-concretely)
2. **What is difficult about the current experience?** → [seven failure modes](02-the-problem.md)
3. **What did you change?** → [the five things Sunvai does](01-mission.md#what-sunvai-is)
4. **Why is your version better?** → [positioning](03-competitive-landscape.md#positioning-statement)
5. **What works today, and what is still mocked?** → [`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md)
6. **How could the idea work safely at a larger scale?** → [`../02-architecture/05-scale-and-safety.md`](../02-architecture/05-scale-and-safety.md)

---

## Prohibitions — any one of these is disqualifying

> **Please do not:**
> - Try to **access, test or interfere with a live government system.**
> - **Reverse-engineer private systems** or use **undocumented private APIs.**
> - **Scrape personal or restricted information.**
> - Use **real Aadhaar numbers, PAN details, passwords, OTPs, payment details, health
>   information** or other sensitive data.
> - Present your prototype as an **official government product.**
> - Use **government logos** in a way that suggests approval or partnership.
> - Submit an **old project with only small changes.**
> - Include **code, assets or data you do not have permission to use.**

**[our reading]** The first two are the ones most likely to be violated by accident and
they directly shape our architecture. An agent that drives the real CPGRAMS in a headless
browser — however clever — is disqualifying, not innovative. This is why we build a
**mock CPGRAMS behind an adapter interface** and document exactly where official
integration would attach. See [`../02-architecture/04-adapters.md`](../02-architecture/04-adapters.md)
and [`05-non-goals.md`](05-non-goals.md).

The logo rule shapes visual design: **no Ashoka emblem, no ministry logos, no tricolour
lockup that mimics an official masthead.** See [`../01-product/04-content-and-voice.md`](../01-product/04-content-and-voice.md).

---

## What to submit

| Item | Requirement |
|---|---|
| **Live public link** | Opens in a browser **without requesting access**. Reviewers will **not download a mobile app.** Include mock consumer login credentials if the project requires them. |
| **Video** | **No longer than two minutes.** First minute: demo the project **as a citizen**. Second minute: **how you built it and why you made those choices.** Both teammates may present. |
| **Project summary** | **Under 250 words** — what it is and why it is better than the current solution. |
| **Partner's email** | Registered email if a team of two; blank if solo. Both teammates register and submit each other's email. |

> **Make sure every link works without requesting access.**

**[our reading]** "Without requesting access" is a real failure mode — a Vercel deployment
with protection enabled, a Google Doc set to request-access, or a Supabase project paused
for inactivity all fail this silently. Verification is a build task, not a formality. See
[`../04-build/04-build-order.md`](../04-build/04-build-order.md).

---

## Judging criteria — verbatim

| Criterion | The question asked |
|---|---|
| **Problem** | Is this a real and important user problem? |
| **Working build** | Does the main journey actually work? |
| **Usability** | Is the experience simpler, clearer and more accessible? |
| **Product thinking** | Are the choices thoughtful and well explained? |
| **End-to-end thinking** | Does the solution address the **backend, infrastructure and processes, not just the interface**? |
| **Honesty** | Are limitations, mock data and dependencies clearly disclosed? |

Mapped to where we address each: [`../05-submission/04-judging-scorecard-map.md`](../05-submission/04-judging-scorecard-map.md).

**[our reading]** on the two most under-read criteria:

- **End-to-end thinking** is where a beautiful frontend loses. It explicitly asks about
  backend, infrastructure and *processes*. This is why the ledger, the adapter interface
  and [`05-scale-and-safety.md`](../02-architecture/05-scale-and-safety.md) are core
  deliverables rather than documentation garnish.
- **Honesty is scored.** That makes a well-designed disclosure surface a **feature to
  build**, not a caveat to bury. Every mock gets labelled on the screen where it appears.

---

## Prizes and what selection means

Top 10: a year of Codex Pro and a Codex Micro. Top 3: a MacBook on top. Winner: a trip to
San Francisco (subject to visa) plus all of the above.

Selection **does not guarantee** that a government body will adopt or implement a build.
The initiative is *"meant to start a useful conversation about better public digital
experiences."*

**[our reading]** That last line is a design hint. A build that is *legible as policy* —
that shows what a better system would measure and why — is aimed at the stated purpose.
Hence the north star metric being a *public number that does not currently exist*, rather
than a feature.

---

**Next:** [`05-non-goals.md`](05-non-goals.md) — what we refuse to build.
