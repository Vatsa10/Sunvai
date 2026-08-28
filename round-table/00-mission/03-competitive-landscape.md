# Competitive Landscape — read this before proposing any feature

> Part of the [Sunvai Round Table](../README.md).
> **This is the most operationally important document in the folder.** It exists because of
> two near-misses: we nearly built something the Government of India shipped twelve weeks
> ago, and we nearly pitched as our own discovery a position the government has been
> stating publicly since July 2025.
>
> **Read both. The second one is the one that decides how the video opens.**

---

## The near-miss

Our first design put voice-first, multilingual, AI-routed grievance *filing* at the centre
of the product. Research on 22 Aug 2026 killed it:

> **On 30 May 2026, DARPG launched *Samadhan Didi*** — an AI-enabled voice chatbot on
> CPGRAMS, built with **Bhashini**, the government's AI language platform.
>
> The citizen **speaks their complaint in any of the 22 Eighth Schedule languages**. The
> system **classifies the complaint, identifies the relevant ministry / department /
> category, asks follow-up questions, and files it to the correct authority** — the entire
> interaction in the citizen's native language, with no English or Hindi proficiency
> required. Launched by Dr Jitendra Singh, MoS for Personnel, Public Grievances and
> Pensions. Built on grievance-classification models trained on CPGRAMS data, inside
> secure government infrastructure. More regional languages to follow in phases.

That is a voice intake agent, a router agent, and a clarifying-questions loop — three of
the four things we had planned to demo as our innovation.

**Discovering this on 22 August was worth more than any feature we could have built.**
Discovering it on 12 September, on stage in Bengaluru, in front of invited government
officials, would have ended the project.

---

## What CPGRAMS already has — treat all of this as table stakes

| Capability | Status | Detail |
|---|---|---|
| **Voice grievance filing, 22 languages** | ✅ Shipped | Samadhan Didi, 30 May 2026 |
| **AI department/category classification** | ✅ Shipped | Trained on CPGRAMS data |
| **AI clarifying follow-up questions** | ✅ Shipped | Part of Samadhan Didi flow |
| **Submissions in all 22 scheduled languages** | ✅ Shipped | Eighth Schedule |
| **Officials' replies translated to citizen's language** | ✅ Shipped | Bhashini for GROs |
| **Speech-to-text, text-to-speech, transliteration** | ✅ Shipped | Bhashini stack |
| **Assisted filing at scale** | ✅ Shipped | 5 lakh+ CSCs, ~2.5 lakh VLEs |
| **Single portal across all ministries/states/UTs** | ✅ Shipped | Core CPGRAMS, 24×7 |
| **21-day disposal timeline** | ✅ Shipped | Aug 2024 Comprehensive Guidelines |
| **Fast average disposal** | ✅ Shipped | 13 days (May 2026), 15 days (Oct 2025) |
| **Formal appeal tier** | ✅ Shipped | 30-day disposal, trackable by reg. number |
| **Feedback Call Centre** | ✅ Shipped | 78,830 feedbacks, May 2026 |
| **Root cause analysis mandate** | ✅ On paper | Aug 2024 Guidelines |
| **Officer training** | ✅ Shipped | ~38,693 officers, Sevottam |
| **Monthly public performance reporting** | ✅ Shipped | DARPG, per ministry and state |

### The operating rule this produces

> **If a feature appears in the table above, it is not a differentiator.**
> Build it if our users need it. Never pitch it. Never let it lead the video, the summary,
> or a screen's headline. Anyone in the judging room close to DARPG will recognise it
> instantly, and a submission that presents shipped government capability as its own
> innovation reads as *"they did not do the research."*

---

## The second near-miss: our thesis is already the government's stated position

Research on 26 Aug 2026 found something that changes how this must be pitched, and it
matters more than the Samadhan Didi finding. **We are not the first to say that disposal is
not resolution. The Government of India said it first, on the record, repeatedly.**

> **Dr Jitendra Singh, 9 July 2025** — National Workshop on Effective Redressal of Public
> Grievances / NextGen CPGRAMS. The headline on the release: *"Grievance Redressal Must
> Ensure Citizen Satisfaction, Not Just Disposal."* He called for **"a fundamental shift"**,
> for **"setting up a human interface after grievance disposal"**, and for
> **"identification of recurring grievance patterns to flag deeper policy issues"** —
> *"If a complaint is coming from different parts of the country, it is time to question the
> underlying rules or procedures."*

That is, in one paragraph: post-closure follow-up, and cross-citizen pattern clustering.
Two of our four agents, named by the minister, fourteen months ago.

> **17 June 2026** — press conference on *12 Years of Personnel and Pension Reforms*. The
> government has **"developed an AI-HI hybrid grievance redressal model"** — *"AI plus HI,
> Human Intelligence. AI alone may not be giving the optimal results"* — built **"after the
> government found that disposal of grievances alone did not always translate into citizen
> satisfaction"**, because **"complainants often remained dissatisfied despite their
> grievances being formally disposed of."**

> **PIB factsheet, 9 August 2026** — among the listed NextGen CPGRAMS features:
> **"AI-enabled validation of grievance redressal to assess resolution quality and identify
> cases involving disposal through transfer or closure without effective resolution."**

Read that last quote slowly. *Resolution quality.* *Disposal through transfer.* *Closure
without effective resolution.* That is our Closure Auditor, described almost word for word,
by DARPG, three weeks ago.

### What is actually ours

Here is the other half of what we verified, and it is the whole of our claim:

- Those phrases — "resolution quality", "closure without effective resolution", "disposal
  through transfer" — appear **nowhere** in DARPG's own 154-page *Updated Detailed
  Functional Requirement Specification for NextGen CPGRAMS*. The capability is named in a
  press factsheet and specified in no engineering document we can find.
- **pgportal.gov.in still reports version `7.0.01092019.0.0`**, page last updated
  21-08-2026. CPGRAMS 8.0 / NextGen is announced; it is not live.

So the honest position is not *"nobody thought of this."* It is:

> **DARPG named closure-quality auditing as the next frontier in August 2026. It is in no
> spec and no portal. Here it is working, today — and with the evidence in the citizen's
> hands rather than the department's.**

That is a stronger claim than novelty, and unlike novelty, it is true. It also puts us
alongside the officials in the room instead of talking past them. **Nobody in that room
needs to be told that disposal is not resolution. They said it first. What they have not
seen is it running.**

---

## What is not yet built — our surface area

Nothing below is claimed as our idea. Each row is a capability that is **announced,
mandated, or simply absent — but not shipped to citizens** as of 26 Aug 2026, verified
against the live portal and DARPG's own spec. Cross-referenced to the failure modes in
[`02-the-problem.md`](02-the-problem.md).

| Gap | Evidence it is missing | Our feature |
|---|---|---|
| **Automated audit of closure quality** | Named by DARPG 9 Aug 2026; in no FRS, on no live portal | [Closure Auditor](../03-agents/05-agent-closure-auditor.md) |
| **Proactive verification of every closure** | ≈30% feedback coverage ⚠️; ~1.8 lakh unchecked closures in May 2026 | [Journey step 6](../01-product/01-citizen-journey.md) |
| **Ungated appeal path** | The gate is stated by the portal itself — primary quote below | [Appeal Agent](../03-agents/06-agent-appeal.md) |
| **Cross-citizen root-cause clustering** | Called for by the minister, 9 Jul 2025; not a citizen-facing feature | [Cluster Agent](../03-agents/07-agent-cluster.md) |
| **Citizen-held, tamper-evident record** | The record of a closure lives with the department, not the citizen | [Ledger](../02-architecture/03-ledger.md) |
| **A published true resolution rate** | Only disposal rate is reported; reports "emphasise disposal numbers over qualitative assessments" | [North star metric](01-mission.md#the-north-star-metric) |

**Notice the shape.** Every *shipped* capability is on the **intake** side. Every gap is on
the **outcome** side. The front door was rebuilt first; the turn towards outcomes has been
announced but has not yet reached citizens.

That is not a criticism — intake genuinely had to come first, and Samadhan Didi is good
work. It is simply where the remaining work is, and where a working prototype is currently
worth more than another statement of intent.

---

## The appeal gate — the primary source, verbatim

Quote this and nothing weaker. It is the portal's own description of its own behaviour:

> *"CPGRAMS also provides appeal facility to the citizens if they are not satisfied with the
> resolution by the Grievance Officer. After closure of grievance if the complainant is not
> satisfied with the resolution, he/she can provide feedback. **If the rating is 'Poor' the
> option to file an appeal is enabled.**"*
>
> — [pgportal.gov.in](https://pgportal.gov.in/), page last updated **21-08-2026**

The appeal is real, and the tier above it is real — there is a **Nodal Appellate Authority
with a 30-day norm**, and a **Directorate of Public Grievances**. We attack the *gate*,
never the tier. The citizen who is never asked for a rating simply never reaches machinery
that genuinely exists.

**And DARPG's own spec agrees the gate should go.** The NextGen FRS replaces the five-point
rating with a **Satisfied / Not-Satisfied binary that offers the appeal on both branches**.
So the framing is:

> *"The gate is real today, and the government's own next-generation specification agrees it
> should go. We built what that spec describes, and put the record in the citizen's hands."*

**Never** frame this as *"the government does not care about appeals."* It is false, it is
checkable, and it will lose the room.

**And never quote an appeal rate.** No appeal rate is published anywhere. Inventing or
estimating one is an unforced fatal error in a room containing the people who would know.
The safe line: **CPGRAMS publishes disposal every month, and has never published how many
citizens appealed.**

---

## Bhashini vs. OpenAI — an honest note

CPGRAMS uses **Bhashini** for speech and translation. We use **OpenAI models**, because
the hackathon brief requires the prototype to be built with Codex or powered by an OpenAI
model.

**Do not pitch this as a technical advantage.** We have run no comparative benchmark and
cannot honestly claim one. The correct framing, in the video and the docs:

> *"Language handling is not where we compete. A production Sunvai would run on Bhashini —
> it is the right sovereign stack for Indian languages and the government already
> operates it. We use OpenAI models here because that is what this hackathon is built on,
> and because our differentiating work — auditing whether a bureaucratic reply actually
> answers a citizen's complaint — is a reasoning task, not a translation task."*

That framing is accurate, shows we understand the ecosystem, and converts a constraint
into evidence of judgement. See [`../02-architecture/04-adapters.md`](../02-architecture/04-adapters.md)
for the language-provider interface that makes swapping to Bhashini a config change.

---

## Adjacent players

| Who | What they do | Overlap |
|---|---|---|
| **CPGRAMS / DARPG** | The system itself — and the author of our thesis | A layer on top, not a replacement; we credit them first |
| **Samadhan Didi** | AI voice intake | **Direct overlap on intake — ceded** |
| **Bhashini** | Language infrastructure | Complementary; we would run on it in production |
| **State grievance portals** | Parallel systems, varying quality | Future adapters; out of scope for the demo |
| **Consumer helpline / RTI** | Adjacent redressal paths | Out of scope; noted in [`05-non-goals.md`](05-non-goals.md) |
| **Private complaint startups** | Consumer-facing, not government | Different market |

---

## Positioning statement

Memorise this. It goes in the video, the 250-word summary, and the landing page.

> **The government fixed the front door, and named the back half. This is the back half,
> running.**
>
> Sunvai is not a better way to file a grievance — DARPG already shipped that in May. It is
> not our idea that disposal is not resolution — that is the government's own stated
> position. Sunvai is what happens **after** your grievance is closed: we audit the reply,
> ask you whether your problem was actually fixed, write your appeal when it was not, show
> you the 46 others with the same complaint, and enter all of it in a hash-chained record
> that you, not the department, can verify in your own browser.

---

## Maintenance

This landscape is moving fast — three of the capabilities in the table above shipped
within the last 24 months, one within the last 12 weeks.

**Re-verify before the 28 Aug submission and again before the 7 Sep resubmission.** DARPG
has already *announced* closure-quality validation (factsheet, 9 Aug 2026). If it reaches
the live portal between now and then, we need to know before a judge does — and the
correct response is to say so on stage and pitch the citizen-held evidence, not to pretend
otherwise. Check the portal version string; it is the cheapest tell.

Check: [pgportal.gov.in](https://pgportal.gov.in/) · [darpg.gov.in](https://darpg.gov.in/)
· PIB releases tagged CPGRAMS · DARPG monthly reports.

---

**Next:** [`04-hackathon-brief.md`](04-hackathon-brief.md) — the constraints we are building under.
