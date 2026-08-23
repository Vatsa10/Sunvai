# Stack

> Part of the [Sunvai Round Table](../README.md).
> Chosen for a six-day build ending 28 Aug 2026, and for being explainable in the
> second minute of a two-minute video.

---

## The stack

| Layer | Choice | Why this one |
|---|---|---|
| **Framework** | Next.js 15, App Router, TypeScript | Server Actions remove an API layer we would otherwise hand-write; RSC keeps first paint small, which our users need |
| **Hosting** | Vercel | A live public URL in one command. **Deployment protection must be OFF** — see below |
| **Database** | Supabase Postgres | RLS, Realtime, Storage, pgvector, cron in one box. Every one of those is load-bearing here, not incidental |
| **AI** | OpenAI (reasoning, fast, vision, embeddings, STT, TTS) | Required by the brief; behind [`LanguageProvider`](../02-architecture/04-adapters.md#languageprovider) so it is swappable |
| **Built with** | **Codex** | Required by the brief, and genuinely how this is built — see below |
| **Styling** | Tailwind | Fast, and trivial to hold the [accessibility floor](../01-product/04-content-and-voice.md) with tokens |
| **Validation** | Zod | Agent contracts are schema-validated at the boundary |
| **Vectors** | pgvector | Already in Supabase; no second datastore for [clustering](../03-agents/07-agent-cluster.md) |
| **Scheduled work** | Supabase `pg_cron` | SLA ticks, escalation, outreach, recomputes. Lives beside the data |
| **Hashing** | `pgcrypto` server-side, WebCrypto client-side | The [ledger](../02-architecture/03-ledger.md) verifies in the browser with no library |

**No state management library, no ORM, no component library, no auth provider.** Each would
cost hours and buy nothing this build needs. Supabase's client plus Server Actions is
sufficient, and every dependency omitted is a dependency that cannot break at 19:00 on the
28th.

---

## On Codex — and why this is not decoration

The brief requires Codex to be *"a meaningful part of how you build it, not something added
only for the submission."* Reviewers will be able to tell, and the second minute of the
video is where this gets explained.

**Where Codex does the real work:**

- **The docs in this folder are the spec Codex builds from.** Every document here is written
  to be loaded as agent context — that is why they cross-link, why the contracts are
  explicit, and why [`09-prompts-and-contracts.md`](../03-agents/09-prompts-and-contracts.md)
  exists as a single implementable file. This corpus *is* the Codex workflow.
- **Schema and migrations** from [`02-data-model.md`](../02-architecture/02-data-model.md).
- **The adapter implementations** — mechanical, interface-driven, exactly the shape of task
  that benefits from a precise spec and a fast generator.
- **The eval harness and fixtures** ([`10-evals.md`](../03-agents/10-evals.md)) — the labels
  are ours; the runner is generated.
- **The six-language content tables** — jargon, UI strings.

**Where a human decides:** the pivot away from voice-intake after finding Samadhan Didi; the
separation of audit from metric; the choice to publish our own error rate; every prompt in
[`09-prompts-and-contracts.md`](../03-agents/09-prompts-and-contracts.md).

> The honest line for the video: *"The judgement calls are ours. The corpus in `round-table/`
> is the spec, and Codex builds from it — which is why the architecture is consistent
> enough that adding a department is one file."*

---

## Model selection

Tiers, not specific IDs — pin exact model IDs in code at build time, not in a document that
will age.

| Job | Tier | Setting |
|---|---|---|
| [Closure audit](../03-agents/05-agent-closure-auditor.md), [appeals](../03-agents/06-agent-appeal.md) | **Reasoning** | `temperature: 0`, structured output |
| Routing, drafting, cluster confirmation | **Fast** | `temperature: 0`, structured output |
| Intake conversation | **Fast**, streaming | `temperature: 0.3` |
| Documents | **Vision** | `temperature: 0` |
| Clustering | `text-embedding-3-small` | 1536 dims |
| Speech in / out | Transcription + TTS | Cache TTS per phrase — our users pay for data |

Only Intake is above `temperature: 0`. Everywhere else, output that varies between runs is
output we cannot defend when challenged.

---

## Environment

```bash
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only — never in a NEXT_PUBLIC_ var
LEDGER_PEPPER=                  # for phone_hash
NEXT_PUBLIC_DEMO_MODE=true      # drives global mock labelling
```

`NEXT_PUBLIC_DEMO_MODE` is belt-and-braces. Per-surface mock badges read from
[`adapter.isMock`](../02-architecture/04-adapters.md) so the label cannot be forgotten;
this flag is the site-wide banner on top of that.

---

## Deployment rules — the ones that silently fail

The brief says the live link must open **without requesting access**, and that *"reviewers
will not download a mobile app."* These are the ways a good build dies at submission:

1. **Vercel Deployment Protection must be OFF** for production. It is on by default for some
   accounts, and it produces exactly the "requesting access" failure the brief warns about.
   **Verify in an incognito window on a phone, on mobile data, not on your laptop.**
2. **The Supabase project must not be paused.** Free-tier projects pause after inactivity.
   Between the 28 Aug submission and the review window closing 1 Sep, nobody may be touching
   it. **Set a cron ping.**
3. **A custom domain, if used, must fully resolve** before submission.
4. **No `robots.txt` or auth middleware** blocking the reviewer.
5. **Rate limits must not lock a reviewer out** mid-journey.

**Verification is a build task with an owner and a checkbox**, not a formality. See
[`04-build-order.md`](04-build-order.md).

---

## Budget guards

Reviewers will use this. An exhausted API key during the 28 Aug – 1 Sep review window is a
silent, total failure.

- **Hard spend cap** on the OpenAI key.
- **Audits are cached by `(grievance_id, reply_id)`** — a reviewer re-opening a demo case
  costs nothing after the first run.
- **Pre-computed audits for all seeded demo cases**, committed as fixtures. The headline demo
  path runs even if the API is unreachable, and the UI says when it is serving a cached
  verdict.
- Per-IP rate limit on live agent calls, generous enough for a full review pass.

> **The demo must survive an OpenAI outage.** The three seeded cases render fully from
> fixtures. Live agent calls are for the reviewer who files something new — the part of the
> journey we can afford to have degrade.

---

**Next:** [`02-repo-structure.md`](02-repo-structure.md)
