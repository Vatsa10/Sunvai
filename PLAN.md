# Sunvai — end-to-end implementation plan

> Working copy. The original lives in `~/.claude/plans/`; this is the one that gets updated as
> the build moves.

## Status — 23 Aug, end of day 1

| | |
|---|---|
| Day 1 — foundations + auditor | ✅ done |
| Day 2 — the spine, end to end | ✅ done |
| Day 3 — Door B with voice | ✅ done (read-aloud not yet wired into the pages) |
| Day 4 — proof, honesty, depth | 🟡 mostly done — `_dept/` panel outstanding |
| Day 5 — evals, languages, submission assets | ⬜ not started |
| **Deploy to Vercel** | ⬜ **not done — was meant to happen on day 1** |

**Runnable checks, all passing:**

```
pnpm tsx scripts/check-ledger-parity.ts <chain.json>   Postgres hashes == browser hashes
pnpm tsx scripts/check-citation-guard.ts               paraphrase and tidied whitespace rejected
pnpm tsx scripts/check-journey.ts                      all ten acceptance steps
bash scripts/check-adapter-boundary.sh                 the vendor stays inside lib/adapters/
```

**Simulated corpus numbers** (synthetic, not measurements): disposal 94.0% · true resolution
39.4%. The seeded corpus's internal disagreement now lives in the `simulated_corpus_rate` view
and is shown only under the "What we simulated" heading on `/numbers`.

**Measured numbers** come from `evals/results.json` alone — 74 hand-labelled cases — and are
read at render time by `/`, `/numbers` and `/how-this-works`. `our_error_rate` now excludes
seeded rows (`model <> 'seed'`), so it reports real model runs at whatever honest n exists.

✅ Resolved: the video script and the 250-word summary now quote **39.4%**, labelled synthetic.
That figure is what the seed produces; do not retype it from memory anywhere else.

**Two design-doc corrections, both found by a check rather than by reading:**

1. A receipt is a *slice* of one global chain, so its entries are usually not adjacent
   (seq 7 → seq 20). Verifying consecutive receipt entries as if they were adjacent was wrong.
   Verification now checks every entry's own hash always, and linkage only where the receipt
   holds both sides of it. What a slice cannot prove is that nothing was removed from the gaps
   — disclosed on `/how-this-works`, not papered over.
2. Six call sites imported the concrete mock adapter directly, which is exactly the coupling
   that "adding a department is one file" denies. Selection moved behind
   `src/lib/adapters/index.ts`; `check-adapter-boundary.sh` now enforces it.

**Next:** deploy to Vercel and verify it opens in incognito, on a phone, on mobile data, with
no login — before building anything else.

---

## Context

`round-table/` holds 33 design docs and zero code. Deadline is **28 Aug 2026, 20:00 IST**;
today is 23 Aug. Solo, full-time. This plan turns the corpus into a shipped submission.

Two things changed after watching the organiser's rules video (Varun Mayya, 21 Aug):

1. **CPGRAMS is on the official list of 10 platforms** (IRCTC · Income Tax · CPGRAMS · GST ·
   EPFO · MCA · National Cyber Crime · UMANG · Parivahan Sewa · RTI Online). The corpus
   recorded the brief as "examples, not a fixed list" — wrong. On-list is a scored advantage:
   the judges have used the platform. **RTI Online is also on the list**, which makes the
   RTI escalation path a free credibility beat rather than scope creep.
2. **The slide says "A COMPLETE PROOF OF CONCEPT — rebuild the platform end-to-end."** The
   corpus puts Door B (intake) last and first-to-cut. Under that framing, a post-closure-only
   layer reads as a plugin. **Door B ships in full, with voice.** Decision confirmed by the user.

Also from the video, and shaping priorities: **"IDEAS OVER CODE"** (interfaces and
interactions are what is judged; implementation depth is deferred to post-selection),
**"PROVIDE INSTANT LOGINS"**, **"SKIP THE BELLS & WHISTLES"** (no 3D/Three.js), scale is
explicitly not judged, and the summary is **exactly 250 words**.

Stack is unchanged from `04-build/01-stack.md`: **Next.js 15 App Router · Supabase Postgres ·
OpenAI · Vercel**, built with Codex.

**Outcome:** a public URL where a reviewer, with no login, completes the 10-step acceptance
test in `01-product/01-citizen-journey.md` — plus a ≤2:00 video, a 250-word summary, and an
honesty page that is a built feature rather than a caveat.

---

## The spine, in one line

Reviewer opens a closed grievance → **the auditor says the department's reply is not an
answer, and quotes it** → reviewer answers "did it actually get fixed?" → the appeal is
already drafted → consent → sent → receipt downloads and verifies in the browser, and goes
red when edited.

Everything else is illustration. The order below never gets renegotiated mid-build.

---

## Day plan

### Day 1 (23 Aug) — Foundations + the auditor working on one case

- `create-next-app` (TS, App Router, Tailwind), repo layout exactly as
  `04-build/02-repo-structure.md`. **`round-table/` stays in the repo** — the spec shipping
  with the code is itself product-thinking evidence.
- Supabase project. Migrations **1–9** verbatim from `02-architecture/02-data-model.md`:
  extensions (`pgcrypto`, `vector`) → enums → citizens/departments/offices →
  grievances/replies/audits/confirmations/appeals/attachments → clusters →
  `events` + `ledger_append()` + `events_no_update`/`events_no_delete` rules → RLS → views
  (`true_resolution_rate`, `our_error_rate`) → seed.
- **Deploy to Vercel on day one** and verify in incognito, on a phone, on mobile data.
  Deployment Protection **OFF**. This is the single most common silent submission failure —
  it gets checked today and again on the 27th.
- `lib/adapters/types.ts` + `MockCPGRAMSAdapter` with the three demo cases seeded
  (Kamla `DEMO/2026/0000472` · Arif `DEMO/2026/0000518` · Meera `DEMO/2026/0000631`).
- `lib/agents/schemas.ts` (Zod, verbatim from `03-agents/09-prompts-and-contracts.md`),
  `closure-auditor.ts`, `citation-guard.ts`, `prompts/closure-auditor.v1.md`.

**Exit test:** run the auditor against Kamla's seeded reply from a script; verdict
`deflected`, ≥1 citation, every citation a verbatim substring of `replies.body`.

### Day 2 (24 Aug) — The spine, end to end, ugly

- Landing `/` — language picker, two doors, **three demo chips** labelled DEMO DATA.
  No login wall (this *is* the "instant logins" answer, and better than one — say so).
- `/case/[id]` the Watch — timeline, SLA clock in days-remaining plain words, jargon
  translated inline from `content/jargon.<lang>.json`, raw department text shown **first**.
- `/case/[id]/audit` — verdict, plain-language reasoning, **"see how we judged this"**
  revealing quoted spans highlighted in the reply.
- "Did your problem actually get fixed?" → `confirmations` row → ledger event.
- `lib/agents/appeal.ts` → `/case/[id]/appeal` → **consent gate** (both languages
  simultaneously, never behind a toggle) → `adapter.appeal()` → ledger.
- `actions/` is the only place that writes; state change + `ledger_append()` in one
  transaction, every time.

**Exit test:** Kamla's case, cold public URL, on a phone, start to finish.
**If the build stopped here there is still a submission.**

### Day 3 (25 Aug) — Door B in full, with voice

The day the video's "rebuild it entirely" gets answered.

- `/file` — one mic button. `OpenAILanguageProvider` (STT/TTS/translate) behind the
  `LanguageProvider` interface. Live editable transcript; captured locally and queued when
  offline, with an honest pending state and no infinite spinner.
- `lib/agents/intake.ts` — ≤4 follow-ups, never re-asks an answered fact, `narrative` stays
  in the citizen's language and becomes `narrative_original` (never overwritten — the
  auditor judges against it, not our own draft).
- `lib/agents/router.ts` — visible one-sentence reasoning, **"That's not right"** override
  as a ledger event, jurisdiction warning *before* filing.
- `lib/agents/drafter.ts` + the numbers-in-source guard: any date/amount/reference in the
  draft that is not in the source **blocks** the consent gate.
- Consent gate → `adapter.file()` → the new case lands in the same Watch as Door A.
- `lib/agents/document.ts` (vision) — attachment read, specific retake instruction, Aadhaar/PAN
  deliberately never extracted. **P2, first thing to cut** if Day 3 overruns.

**Exit test:** speak a new grievance in Hindi, reach a filed case, audio-only, on a phone.

### Day 4 (26 Aug) — Proof, honesty, depth

- **Receipt export + `/verify`** — one `lib/ledger/verify.ts` running in Node and browser
  (WebCrypto), JCS canonical JSON. Ships with the **tampered-receipt negative case**: a
  verifier that always says verified is a decoration.
- `/numbers` — split into "What we measured" (the eval) and "What we simulated" (the
  corpus: disposal 94.0% vs true resolution 39.4%), with `our_error_rate` over real runs only.
- `/how-this-works` — the honesty surface: what works, what is mocked, what is specified but
  unbuilt, and the **eight volunteered limitations** from `05-submission/01-honesty-disclosure.md`.
- `MockBadge` rendered from `adapter.isMock`, never hardcoded.
- `/cluster/[id]` — the "46 others · 38 closed without resolution · 0 paid" moment.
  **Render it as a map** of offices — the video's own examples name a map, and it is the
  cheapest way to make the idea land visually without touching 3D.
- `_dept/` scaffolding: a list, a text box, one button. It is not graded (the video says the
  admin side is assumed) — it exists so a reviewer can reply and watch the audit fire live.
- Read-aloud on every screen. Accessibility floor held in code: ≥18px, 7:1 contrast, ≥48px
  targets, no meaning by colour alone.

### Day 5 (27 Aug) — Evals, languages, submission assets

- `evals/fixtures/auditor/` — ~60 replies, **labelled before the prompt is tuned**, plus the
  adversarial set. Gates: false-accusation <5%, deflected+boilerplate recall >85%,
  citation-guard pass >98%, adversarial catch >70%. **The numbers go in the README, including
  the unflattering ones.**
- Languages: **hi/en/mr done properly**, the other three disclosed as unshipped. Never
  half-ship a language.
- **Video** to `05-submission/02-video-script.md`. Rehearse to 1:52. Minute two says
  *Samadhan Didi* out loud — naming what the government already shipped is the strongest
  product-thinking evidence available, and hiding it invites a judge to find it themselves.
- **Summary at exactly 250 words** (the video's wording; the corpus draft is 242 — pad to
  248–250). Keep the closing line verbatim.
- Pre-computed audit fixtures committed; **verify the demo works with the OpenAI key removed.**
- Full submission-day checklist from `04-build/04-build-order.md`, run today not tomorrow.

### Day 6 (28 Aug, until 20:00) — Buffer and submit

Bug-fix only, no new surfaces. Re-verify the live URL on a second device you do not own.
Submit the four items: live link · ≤2:00 video · 250-word summary · partner email left blank
(solo). Submit by **18:00**, not 19:55 — the deadline has no grace period.

---

## The cut line

Cut from the bottom, without renegotiating:

```
   Document agent                       ← first to go
   Cluster map → a plain count on the case screen
   Six languages → three (hi/en/mr)
   _dept/ live-reply panel → pre-seeded replies only
   Voice OUTPUT (read-aloud) → text only
   ─────────────── DO NOT CUT BELOW THIS LINE ───────────────
   Voice INPUT on Door B          (the "rebuild it entirely" answer)
   Receipt verification + the tampered case
   /numbers with our own error rate
   /how-this-works
   Consent gate
   Appeal drafting
   Confirmation ("did it actually get fixed?")
   Closure Auditor + citation guard
   The Watch
   A public URL that opens without login
```

---

## Non-negotiables, carried from the corpus

- **Never touch a live government system.** No API, no scraping, no test submissions.
  Disqualifying. Everything external sits behind an adapter; `scripts/check-adapter-boundary.sh`
  fails CI if the string `cpgrams` appears outside `lib/adapters/`.
- **All data synthetic.** `DEMO/` prefix on every reference number, `+91 90000 0xxxx` phones
  stored only as `phone_hash`, no real officials named — including in the video.
- **No government logos, no Ashoka emblem, no tricolour masthead.** Persistent line:
  *"An independent civic tool. Not a government service."*
- **The agent never acts invisibly.** Nothing reaches `adapter.file()` or `adapter.appeal()`
  without the citizen seeing the exact text in their own language and consenting.
- **Audit ≠ metric.** The published resolution rate comes from `confirmations` — the
  citizen's yes/no — never from a model verdict. This is the anti-Goodhart separation and it
  is the single strongest thing to be judged on.
- **If it is not in the ledger, it did not happen.** Never say "blockchain".
- Meera's case is the one we **deliberately get wrong**, and it feeds the published error rate.

---

## Files that matter

| Path | What |
|---|---|
| `src/lib/agents/closure-auditor.ts` + `citation-guard.ts` | ★ the product |
| `src/lib/agents/prompts/*.v1.md` | versioned; version written to every `audits` row |
| `src/lib/adapters/mock-cpgrams.ts` | the only file that knows what CPGRAMS is |
| `src/lib/ledger/append.ts` · `canonical-json.ts` · `verify.ts` | one verify, two runtimes |
| `src/actions/*.ts` | the only place that writes |
| `supabase/migrations/1..9` | schema, RLS, `ledger_append()`, views |
| `src/components/ConsentGate.tsx` | the most important screen in the product |
| `evals/fixtures/auditor/` | labelled before tuning, or you are tuning on vibes |

## Docs to patch as we go

- `00-mission/04-hackathon-brief.md` — replace "examples, not a fixed list" with the 10
  platforms; add the video as a second source alongside the PDF.
- `04-build/04-build-order.md` — Door B moves above the cut line; record why.

---

## Verification

**Per-phase exit tests** are stated inline above; each is run on a phone against the live
public URL, not on localhost.

**Automated, pre-deploy** — the nine-step end-to-end check from `03-agents/10-evals.md`:
public URL with no login and <100KB first paint · demo case renders verdict + citations ·
every citation string-matches the reply · confirmation moves the metric · appeal draft has
≥1 ground · consent gate shows both languages at once · **receipt verifies and a tampered
receipt fails** · cluster page shows counts and no identity · every mock surface renders its
badge from `adapter.isMock`.

**Eval gates** (`pnpm eval:auditor`) must pass before the numbers go in the README, and the
numbers go in whether or not they flatter us.

**Submission-day, on the 27th:** incognito · phone · mobile data · a second device you do not
own · Deployment Protection off · Supabase not paused with a cron ping through 1 Sep ·
demo path works with the OpenAI key removed · hard spend cap set · video ≤2:00 and opens
without login · summary exactly 250 words · `check-adapter-boundary.sh` green.
