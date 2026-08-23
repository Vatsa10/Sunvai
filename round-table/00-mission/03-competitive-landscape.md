# Competitive Landscape — read this before proposing any feature

> Part of the [Sunvai Round Table](../README.md).
> **This is the most operationally important document in the folder.** It exists because
> we nearly built something the Government of India shipped twelve weeks ago.

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

## What nobody has built — our entire surface area

Every item below was verified as absent in the current system. Cross-referenced to the
failure modes in [`02-the-problem.md`](02-the-problem.md).

| Gap | Evidence it is missing | Our feature |
|---|---|---|
| **Automated audit of closure quality** | Departments close with "matter forwarded"; ministries often gave no reasons for closure at all | [Closure Auditor](../03-agents/05-agent-closure-auditor.md) |
| **Proactive verification of every closure** | ≈30% feedback coverage ⚠️; ~1.8 lakh unchecked closures in May 2026 | [Journey step 6](../01-product/01-citizen-journey.md) |
| **Ungated appeal path** | Appeal unlocks only on a "Poor" rating most citizens are never asked for | [Appeal Agent](../03-agents/06-agent-appeal.md) |
| **Cross-citizen root-cause clustering** | Systemic issues "treated as separate cases" | [Cluster Agent](../03-agents/07-agent-cluster.md) |
| **Tamper-evident citizen-verifiable record** | No independent oversight; monitors from the same cadre | [Ledger](../02-architecture/03-ledger.md) |
| **A published true resolution rate** | Only disposal rate is reported; reports "emphasise disposal numbers over qualitative assessments" | [North star metric](01-mission.md#the-north-star-metric) |

**Notice the shape.** Every shipped capability is on the **intake** side. Every gap is on
the **outcome** side. The government optimised the front door for two years and has not
yet turned around.

That is not a criticism — intake genuinely had to come first, and Samadhan Didi is good
work. It is simply where the remaining opportunity is, and it is unoccupied.

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
| **CPGRAMS / DARPG** | The system itself | We are a layer on top, not a replacement |
| **Samadhan Didi** | AI voice intake | **Direct overlap on intake — ceded** |
| **Bhashini** | Language infrastructure | Complementary; we would run on it in production |
| **State grievance portals** | Parallel systems, varying quality | Future adapters; out of scope for the demo |
| **Consumer helpline / RTI** | Adjacent redressal paths | Out of scope; noted in [`05-non-goals.md`](05-non-goals.md) |
| **Private complaint startups** | Consumer-facing, not government | Different market |

---

## Positioning statement

Memorise this. It goes in the video, the 250-word summary, and the landing page.

> **The government solved the front door. Nobody has built the back half.**
>
> Sunvai is not a better way to file a grievance — DARPG already shipped that in May.
> Sunvai is what happens **after** your grievance is closed: we audit the reply, ask you
> whether your problem was actually fixed, write your appeal when it was not, show you
> the 46 others with the same complaint, and record all of it where nobody can change it.

---

## Maintenance

This landscape is moving fast — three of the capabilities in the table above shipped
within the last 24 months, one within the last 12 weeks.

**Re-verify before the 28 Aug submission and again before the 7 Sep resubmission.** If
DARPG ships closure auditing between now and then, we need to know before a judge does.

Check: [pgportal.gov.in](https://pgportal.gov.in/) · [darpg.gov.in](https://darpg.gov.in/)
· PIB releases tagged CPGRAMS · DARPG monthly reports.

---

**Next:** [`04-hackathon-brief.md`](04-hackathon-brief.md) — the constraints we are building under.
