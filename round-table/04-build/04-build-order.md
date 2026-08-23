# Build Order

> Part of the [Sunvai Round Table](../README.md).
> Sequenced so that **whenever you stop, what exists is demonstrable.** Capacity-agnostic:
> the cut line below tells you what to drop, in what order, when hours run short.

**Deadline: 28 Aug 2026, 20:00 IST. No grace period.**

---

## The ordering principle

Build the **spine of the headline demo first**, end to end, ugly. Then deepen. Then widen.

The failure mode to avoid is building intake first because it comes first in the journey —
intake is [table stakes](../00-mission/03-competitive-landscape.md), it is the largest
surface, and a build that runs out of time there has produced a worse Samadhan Didi and
nothing else.

> **Door A before Door B. The audit before the intake. Always.**

---

## Phase 0 — Foundations *(must complete before anything else)*

- Next.js + Supabase project, deployed to a **public URL on day one**
- **Verify the URL opens in incognito, on a phone, on mobile data, with no login** — this is
  the single most common silent submission failure
- Migrations 1–9 from [`02-data-model.md`](../02-architecture/02-data-model.md)
- `ledger_append()` + append-only rules + RLS
- `MockCPGRAMSAdapter` with the three demo cases seeded

**Exit test:** open the public URL on a phone and see a seeded grievance with its real,
bad reply.

## Phase 1 — The spine ★ *(the submission lives or dies here)*

- Landing page: language picker, two doors, **three demo chips**
- Door A: import by reference → the Watch (timeline, SLA clock, jargon translation)
- **[Closure Auditor](../03-agents/05-agent-closure-auditor.md) + [citation
  guard](../03-agents/05-agent-closure-auditor.md#the-citation-guard)**
- Verdict screen: reasoning, quoted citations, **"see how we judged this"**
- **"Did your problem actually get fixed?"** → confirmation recorded
- [Appeal agent](../03-agents/06-agent-appeal.md) → draft → **consent gate** → send

**Exit test:** Kamla's case, start to finish, on a phone, from a cold public URL.

**If only Phase 1 exists, we still have a submission.** Everything after this is upside.

## Phase 2 — Proof and honesty

- **Receipt export + `/verify`** — including the **tampered-receipt negative case**
- `/numbers` — disposal vs. true resolution, **plus our own error rate**
- `/how-this-works` — the honesty surface
  ([`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md))
- Mock badges driven by `adapter.isMock`
- Read-aloud on every screen

**Exit test:** download a receipt, edit one date in a text editor, drop it on `/verify`,
watch it go red.

## Phase 3 — Depth

- [Clusters](../03-agents/07-agent-cluster.md) + cluster page + the "46 others" moment
- Six languages, wired through
- The `_dept/` scaffolding so a reviewer can reply and watch the audit fire **live**
- Auditor evals ([`10-evals.md`](../03-agents/10-evals.md)) — the numbers go in the README

## Phase 4 — Door B

- Voice [intake](../03-agents/02-agent-intake.md) → follow-ups →
  [routing with reasoning](../03-agents/03-agent-router.md) →
  [drafting](../03-agents/04-agent-drafter.md) → consent gate → file
- [Document agent](../03-agents/08-agent-document.md)

**Deliberately last.** It is the table-stakes half. Shallow here is fine; shallow in Phase 1
is fatal.

## Phase 5 — Submission

- **Video** ([`../05-submission/02-video-script.md`](../05-submission/02-video-script.md))
- **250-word summary** ([`../05-submission/03-summary-250-words.md`](../05-submission/03-summary-250-words.md))
- Pre-computed audit fixtures committed; **verify the demo works with the API key removed**
- Final link check: incognito, phone, mobile data, **and a second device**

---

## The cut line

Cut from the bottom. In this order, without renegotiating:

```
   Document agent                      ← first to go
   Six languages → three (hi/en/mr)
   Door B entirely (Door A is the demo)
   Cluster page → a static count on the case screen
   _dept/ scaffolding → pre-seeded replies only
   ─────────────── DO NOT CUT BELOW THIS LINE ───────────────
   Receipt verification
   Public numbers page + our error rate
   Consent gate
   Appeal drafting
   Confirmation ("did it actually get fixed?")
   Closure Auditor + citation guard
   The Watch
   A public URL that opens without login
```

Everything below the line is the argument. Everything above it is illustration.

---

## Submission-day checklist

Run this on the **27th**, not the 28th.

- [ ] Public URL opens in incognito, on a phone, on mobile data — **no access request**
- [ ] Vercel **Deployment Protection is OFF** for production
- [ ] **Supabase project is not paused**; a cron ping keeps it warm through 1 Sep
- [ ] Demo path works **with the OpenAI key removed** (fixtures)
- [ ] OpenAI **hard spend cap** set
- [ ] Mock badge visible on every mock-sourced surface
- [ ] No real identifiers anywhere — seed, fixtures, screenshots, **video**
- [ ] No government logos; the "independent civic tool" line is present
- [ ] Video **≤ 2:00**, hosted, opens without login
- [ ] Summary **< 250 words**
- [ ] `check-adapter-boundary.sh` passes
- [ ] Eval numbers in the README, **including the ones that are unflattering**
- [ ] Tested on a **second device you do not own**

---

## Time hazards

| Hazard | Mitigation |
|---|---|
| Perfecting voice intake | It is Phase 4 for a reason. Set a hard timebox and honour it. |
| Six languages consuming two days | Ship three well. Disclose the rest. Never half-ship a language. |
| The `_dept/` panel growing into a product | It is scaffolding. It gets a list, a text box and one button. |
| Prompt-tuning without an eval set | Build the fixtures **first**, or you are tuning on vibes and will not know when you have made it worse. |
| Discovering the deploy is access-gated on the 28th | Phase 0 verifies it, and the 27th verifies it again. |

---

## After the 28th

If shortlisted: one week of mentorship, resubmission by **7 Sep**, finals in Bengaluru **12
Sep**.

**Re-verify [`03-competitive-landscape.md`](../00-mission/03-competitive-landscape.md)
before resubmitting.** Samadhan Didi shipped twelve weeks before this deadline. If DARPG
ships closure auditing in the interval, we need to know before a judge does.

---

**Next:** [`../05-submission/01-honesty-disclosure.md`](../05-submission/01-honesty-disclosure.md)
