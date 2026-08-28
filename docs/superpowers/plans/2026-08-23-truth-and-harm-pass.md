# Sunvai — truth pass, harm pass, and the reframe

## Context

Sunvai is built and working: a layer over CPGRAMS that begins when a department **closes**
your grievance. It audits the closure reply against what the citizen actually asked (LLM
verdict, verbatim citations enforced by a citation guard), asks whether the problem was really
fixed, drafts an appeal, clusters cases by office, and records everything in a hash-chained
ledger the citizen verifies in their own browser.

Deadline: **28 Aug 2026, 20:00 IST**. Solo. Stack: Next.js 15 App Router · Supabase Postgres ·
OpenAI · Vercel. Live locally on port 3111; **not yet deployed**.

Field research (14 agents across Reddit/Quora/forums/news, plus three adversarial critics)
produced findings that make this plan necessary rather than optional:

1. **The headline honesty number is fabricated.** `/numbers` and the landing page render "we are
   wrong about 10.9% of the time", computed by `our_error_rate` over 2,800 seeded audit rows
   stamped `model='seed'` whose citizen answers come from `chance(0.88/0.55/0.13)` — constants
   chosen in `supabase/seed/run.ts`. The sentence above it says "Every time our verdict
   disagreed with what the citizen told us, we counted it." We counted nothing. In a submission
   whose premise is measurement integrity, this is the single most damaging thing in the repo.
   Meanwhile a **real** measurement exists — 60 hand-labelled cases, labelled before the prompt
   was tuned — and it is buried in `evals/README.md`.

2. **Lawful transfers are being called deflection.** CPGRAMS is *required* to transfer state
   subjects, sub judice matters, RTI matters and government-servant service matters. Our prompt
   classifies those `deflected` and our eval set contains zero of that class — so
   "0% false accusation" is an artifact of the fixture, not a property of the auditor. A Nodal
   Officer breaks this in thirty seconds from their own inbox.

3. **We tell citizens a clock is running when nothing was sent.** After "Send my appeal" the case
   page says *"the appellate officer has 30 days to reply, and the clock is now running."* There
   is also no check against the real 30-day appeal window — and our entire premise is reaching
   people who found out late, i.e. people who are time-barred. And the CPGRAMS appeal is the
   *wrong forum* for all three demo cases.

4. **The thesis is the government's own.** Jitendra Singh, 9 Jul 2025: *"Grievance Redressal Must
   Ensure Citizen Satisfaction, Not Just Disposal."* Again 17 Jun 2026 on the AI-HI hybrid model,
   built *"after the government found that disposal of grievances alone did not always translate
   into citizen satisfaction."* And a PIB factsheet dated **9 Aug 2026** lists among NextGen
   CPGRAMS features: *"AI-enabled validation of grievance redressal to assess resolution quality
   and identify cases involving disposal through transfer or closure without effective
   resolution."* Claiming novelty in front of invited DARPG officials is fatal. **But** the
   capability appears nowhere in DARPG's own 154-page NextGen FRS, and pgportal.gov.in still
   reports version 7.0. The correct posture: *DARPG named this in August; it is in no spec and no
   portal; here it is working, with the evidence in the citizen's hands.*

**Outcome:** every number on the site is either measured or labelled simulated; nothing tells a
citizen something untrue; the site survives a cold database; and the pitch stops claiming
novelty it does not have.

## Global Constraints

Binding on every task. A change that violates one of these is wrong even if the task text seems
to ask for it.

- **Never touch a live government system.** No API call, no scraping, no test submission.
  Disqualifying under the brief.
- **All data synthetic.** `DEMO/` prefix on every reference number, phones only as `phone_hash`,
  no real official named anywhere.
- **No government logos, no Ashoka emblem, no tricolour masthead.** The line *"An independent
  civic tool. Not a government service."* stays on every screen.
- **Audit ≠ metric.** The published resolution rate comes from `confirmations` — the citizen's
  yes/no — never from a model verdict. No task may weaken this separation.
- **Nothing reaches `adapter.file()` or `adapter.appeal()` without a consent gate** showing the
  exact text in the citizen's own language.
- **Never say "blockchain", "immutable" or "tamper-proof".** It is a hash chain in Postgres,
  verified in the browser. A receipt is a non-contiguous slice and cannot prove nothing was
  removed from the gaps — say so where it matters.
- **The adapter boundary holds.** `bash scripts/check-adapter-boundary.sh` must pass: no import
  or identifier outside `src/lib/adapters/` may name the vendor. Prose may.
- **Never quote an appeal rate.** None is published anywhere. Inventing one is unforced and fatal.
- **Never claim we invented this.** See Context item 4 for the required posture and the exact
  citations.
- **A number on screen is either measured or labelled simulated.** No third category.
- **Every task must leave these green:** `pnpm exec tsc --noEmit`, `pnpm build`,
  `bash scripts/check-adapter-boundary.sh`, `pnpm tsx scripts/check-citation-guard.ts`,
  `pnpm tsx scripts/check-ledger-parity.ts` (needs a chain file), and
  `pnpm tsx scripts/check-journey.ts` where the task touched the journey.
- **No new npm dependencies** unless the task says so explicitly.
- **Do not read, copy from, or reference the `Nirantar/` directory.** It is a third party's
  separate hackathon entry that happens to be checked out here. Everything is written fresh.
- Commit with a real message explaining *why*, not what. Co-author trailer:
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`

## Task 1: Add the lawful-transfer verdict and rebuild the eval set around it

**Why first:** this task changes what the auditor outputs and therefore what the eval numbers
are. Task 2 publishes those numbers, so they must be real before they are published.

**The problem.** `src/lib/agents/prompts/closure-auditor.v1.md` teaches that a reply which "sends
the citizen elsewhere and closes the case here" is `deflected`. In real CPGRAMS a large share of
closures are *mandated* transfers — the portal explicitly does not entertain: matters that are
sub judice, RTI matters, a government servant's own service matters, policy demands, requests for
employment or financial assistance, and matters belonging to a State Government. Transferring
those to the right authority is correct procedure, not evasion. Calling it deflection manufactures
false accusations at exactly the volume that would discredit the product.

**Do this:**

1. Add `transferred_lawfully` to the `audit_verdict` enum. Write a new migration
   `supabase/migrations/10_lawful_transfer.sql` — do **not** edit `02_enums.sql`, which is already
   applied. Postgres requires `alter type ... add value` outside a transaction block; make the
   migration safe to re-run (`if not exists`).
2. Add it to `AuditVerdictSchema` in `src/lib/agents/schemas.ts`.
3. Write `src/lib/agents/prompts/closure-auditor.v2.md`, based on v1, adding the verdict:

   ```
   transferred_lawfully — The matter genuinely belongs to another authority and the reply
                          says so, names where it went, and gives the citizen something to
                          follow — a transfer reference, the receiving office, or the
                          correct forum. Also use this where the subject is one CPGRAMS
                          does not entertain (sub judice, RTI matters, a government
                          servant's own service matter, a policy demand, a request for
                          employment or financial assistance) and the reply says which
                          forum does. This is correct procedure, not evasion.

                          The distinction from `deflected` is whether the citizen can act
                          on what they were told. "Forwarded to the concerned department"
                          with no recipient and no reference leaves them nowhere: that is
                          deflected. "Transferred to the Office of the Commissioner of
                          Police, Pune, vide ref. XYZ/2026/441, which is the competent
                          authority for this subject" is a lawful transfer.
   ```

   Keep every existing rule verbatim, including "on a tie, favour the department".
4. Point `AUDITOR_PROMPT_VERSION` in `src/lib/agents/closure-auditor.ts` at `closure-auditor.v2`.
5. In `src/lib/verdicts.ts`, add citizen-facing copy for the new verdict in all three languages.
   Tone: **not** a negative verdict. English headline: *"This one really does belong to another
   office — and they told you which."* Icon `→`, tone `muted`. It must not be styled like
   `deflected`.
6. In `src/lib/agents/appeal.ts`, `transferred_lawfully` must **not** be in the `INADEQUATE` set
   that triggers an appeal draft. The citizen answering "not fixed" still triggers one — that
   override stays.
7. Add a ninth fixture slice to `evals/build-fixtures.mjs`: **8 lawful-transfer cases** labelled
   `transferred_lawfully`. Write them from the real categories — a state-subject transfer naming
   the receiving office and a reference; a sub judice matter naming the court; an RTI matter
   directed to the RTI portal; a service matter directed to the correct grievance channel; a
   transfer to a subordinate organisation with a reference number; a policy demand explaining no
   individual redress lies; a request for financial assistance naming the scheme's channel; a
   matter transferred to a State Government's own grievance portal with a link. Each must name a
   recipient AND give something to follow, or it is not a lawful transfer.
8. Regenerate fixtures (`node evals/build-fixtures.mjs`) and re-run the eval
   (`pnpm eval:auditor`). **Publish whatever the numbers become**, including if false accusation
   stops being 0.0%. Do not tune the prompt to recover a number.
9. Update `evals/README.md` with the new results table, the new slice, and an honest note on what
   changed and why. Keep the existing write-up of the failing `undetermined` gate.
10. Re-run `pnpm seed` so the demo cases carry audits from the current prompt version.

**Verification:** `pnpm eval:auditor` produces `evals/results.json` with a
`transferred_lawfully` slice; `pnpm tsx scripts/check-journey.ts` still passes; typecheck and
build green. Report the before/after numbers in your report file.

## Task 2: The truth pass — measured numbers only, simulated ones labelled

**The problem.** `src/app/page.tsx` renders "We are wrong about X% of the time" from
`our_error_rate`, which is computed over seeded rows (`model='seed'`) whose citizen answers are
`chance()` constants from `supabase/seed/run.ts`. The claim "Every time our verdict disagreed
with what the citizen told us, we counted it" is false. `/numbers` mixes the same simulated
figures with real ones under one heading.

**Do this:**

1. New migration `supabase/migrations/11_real_error_rate.sql`. Replace the `our_error_rate` view
   so it counts **only real model runs** — `where a.model <> 'seed'` — and add a separate view
   `simulated_corpus_rate` carrying the seeded-corpus figures under a name that cannot be
   mistaken for a measurement. Keep `true_resolution_rate` and `headline_numbers` as they are;
   they are labelled at the point of use in step 3.
2. **Landing page** (`src/app/page.tsx`): delete the fabricated error-rate section. Replace it
   with the real measurement, read from `evals/results.json` at build/render time rather than
   hardcoded — one source of truth. Copy, with the real numbers substituted:

   > **We tested this on 60 closure replies we labelled before we wrote the prompt.**
   > It never accused a department that had actually answered. It caught 87.5% of replies we
   > wrote specifically to fool it. There is one test it fails, and we left it failing.

   Link to `/how-this-works`. If `evals/results.json` is missing, render nothing rather than a
   placeholder — never a fabricated fallback.
3. **`/numbers`** (`src/app/numbers/page.tsx`): restructure into two clearly separated parts.
   - **"What we measured"** — the eval results from `evals/results.json`, plus `our_error_rate`
     over real runs only, showing its honest small n.
   - **"What we simulated"** — disposal vs true resolution, the office table, everything derived
     from the 2,800-case corpus, under a heading that says plainly it is a synthetic corpus shaped
     to match the published national picture, and that no office named is real.
   The existing `MockNote` is not sufficient — the separation must be structural, not a footnote.
4. **`src/app/how-this-works/page.tsx`**: the eval table currently hardcodes numbers. Read them
   from `evals/results.json` too.
5. Fix the **41% vs 39.2%** conflict: `round-table/05-submission/02-video-script.md` and
   `03-summary-250-words.md` quote 41%. Replace with the figure the seed actually produces, and
   add one line to each noting the corpus is synthetic.
6. `README.md` says `Implementation | ⬜ Not started` above a working application. Rewrite the
   status table to reflect reality, and add the eval results.
7. `src/app/how-this-works/page.tsx` refers to "The /_dept view"; the route is `/dept`.

**Verification:** grep the repo for `10.9`, `41%` and any other hardcoded metric and show that
each surviving instance is either read from `evals/results.json` or sits under a
"simulated" heading. Build green.

## Task 3: The harm pass — stop telling citizens things that are not true

Four separate harms, one task because they share the case page and the appeal path.

1. **The false clock.** `src/app/case/[id]/page.tsx` renders, after sending:
   *"✔ Sent. The appellate officer has {30} days to reply, and the clock is now running."*
   Nothing was sent anywhere. Replace with copy that says plainly the appeal was recorded here and
   that nothing reached any government system, because there is no connection to one — and say it
   in the citizen's language, on that screen, not on `/how-this-works`. Keep it short and
   non-apologetic.
2. **The 30-day appeal window.** CPGRAMS appeals must be filed within 30 days of closure.
   `mayDraftAppeal` in `src/lib/agents/appeal.ts` takes no date and applies no gate, and our whole
   premise is reaching people who found out late — so a large share are time-barred. Add
   `closedAt` and a clock to the signature; past the window, do not present a live appeal. Instead
   say the window has closed and name what is still open. Thread it through
   `src/actions/case-actions.ts` and the case page.
3. **The remedy forum is wrong for all three demo cases.** Add a per-case "what to actually do
   next" that names the correct forum:
   - **Kamla** (state treasury, DoPPW): a central DoPPW appeal has no purchase on a state
     treasury's disbursement. The live routes are CPENGRAMS if she is a central pensioner,
     otherwise the state pension cell or the treasury DDO.
   - **Arif** (EPFO rejection): the ladder is EPFiGMS → the RPFC → the EPF Appellate Tribunal. A
     CPGRAMS appeal burns weeks on the wrong forum.
   - **Meera** (PWD work order dated 31 Aug, closed 14 Aug): appealing before the stated target
     date is the appeal that gets dismissed in one line. The right action is to wait for the
     target date and then escalate locally on non-compliance.
   Model this as data, not prose: add a `next_step` concept to the case (a short heading, a body,
   and optionally a named forum) seeded per demo case in `supabase/seed/demo-cases.ts`, rendered
   on the case page under a heading like "What to do next". Where a case has no seeded next step,
   render nothing — never a generic invention.
4. **Half-Hindi.** The case page — the page that matters — is largely hardcoded English while the
   landing page offers Hindi and Marathi. Move the case page's own strings into
   `src/lib/i18n/strings.ts` and translate them for `hi` and `mr`. Cover at minimum: "Where this
   stands", "Their word for it", "What that means", "What they did not answer", "Quoted from their
   reply", "What to do next", "You are not the only one", the appeal section, and the consent gate.
   Machine-quality Hindi is acceptable; leaving it English is not.

**Verification:** `pnpm tsx scripts/check-journey.ts` passes. Add a check to that script (or a
new small one) asserting that an appeal on a case closed more than 30 days ago does not present
as live. Switch the case page to `?lang=hi` and confirm no English label remains in the main flow.

## Task 4: Robustness — survive a cold database and a bored visitor

The first click a judge makes must not be a stack trace.

1. **Error boundaries.** There is no `error.tsx`, `not-found.tsx` or `loading.tsx` anywhere in
   `src/app/`. Add them: a root `error.tsx` and `not-found.tsx`, plus `loading.tsx` for
   `/case/[id]`, `/numbers` and `/cluster/[id]`. Copy must be in the product's voice and must
   offer a way onward (the demo cases), not just an apology.
2. **Database-down fallback.** `src/app/page.tsx` and `src/app/case/[id]/page.tsx` are
   `force-dynamic` and query Postgres on render; Supabase free tier pauses. Add a fallback path so
   the three demo cases render from `evals/fixtures/precomputed-audits.json` plus
   `supabase/seed/demo-cases.ts` when the database is unreachable, with a visible, honest banner
   saying the live database is unavailable and this is the committed fixture copy. Do not fake
   success silently. Keep the timeout short — a judge will not wait 30 seconds.
3. **Rate limit the paste box.** `auditText` in `src/actions/audit-actions.ts` calls the reasoning
   model per submission with only a 4,000-character ceiling. One loop exhausts the key and every
   later judge sees a dead feature. Add a simple in-memory per-IP limiter (no new dependency): a
   small number of calls per minute and a modest daily ceiling, with a plain-language message when
   exceeded. Note in a comment that in-memory state is per-instance and this is a demo-scale
   guard, not a production one.
4. **The honest not-found.** Entering a real CPGRAMS registration number currently returns "We
   could not find that number. Check it, or open one of the examples below." — which reads as a
   bug and is really the whole product's boundary. Detect a plausible real registration number
   (not `DEMO/`-prefixed) and say what is actually true: this cannot read live CPGRAMS cases,
   there is no connection to that system and there will not be one without an access agreement —
   then offer the paste box, which works on any real reply text.

**Verification:** stop the database (or point `SUPABASE_DB_URL` at an unreachable host) and
confirm `/` and a demo case still render with the fallback banner. Confirm the limiter returns its
message on rapid repeats. Confirm a non-DEMO reference produces the honest explanation.

## Task 5: The reason-code wall

`src/components/TryTheAuditor.tsx` has two generic example buttons. Replace them with six sourced
chips, each a real terminal string from a different Indian public-service system, each carrying a
one-line attribution of where it was observed. The point is that one engine reads all of them —
without integrating with anything.

Use these, with the attributions:

| System | String | Attribution |
|---|---|---|
| EPFO | `Claim Rejected OK/OK` | reported by members on hrcabin.com's rejection threads, 2019–2025 |
| EPFO | `WARNING-520461 there is a mismatch between summary and details transactions in member ledger` | member reports, hrcabin.com / CiteHR |
| Income Tax | refund failure reason `Others` | e-filing refund status, widely reported |
| GST | registration cancellation reason `Others` | GST portal cancellation notices |
| UIDAI | `rejected due to technical reasons` | Aadhaar update status |
| CPGRAMS | `The matter has been forwarded to the concerned office.` | pgportal.gov.in closure remarks |

Each chip fills both the complaint and the reply box with a plausible matching complaint, so a
click produces a verdict immediately.

**Required framing on the component**, so this cannot read as an integration claim: a persistent
line stating these are other people's rejection letters, pasted in as text; nothing is stored;
no platform is contacted; and the verdict vocabulary is generic rather than platform-specific.

**Verification:** click each chip and confirm a verdict renders with citations quoting the pasted
text. Confirm the framing line is visible without scrolling past the chips.

## Task 6: The reframe — stop claiming novelty

Update the pitch surfaces so nothing claims a discovery that is already government policy, and so
the strongest available line is the one we make.

1. `round-table/00-mission/03-competitive-landscape.md`: add the minister's two statements
   (9 Jul 2025, "Citizen Satisfaction, Not Just Disposal", calling for "a human interface after
   grievance disposal" and pattern identification across the country; 17 Jun 2026, the AI-HI
   hybrid model built "after the government found that disposal of grievances alone did not always
   translate into citizen satisfaction"), and the PIB factsheet of 9 Aug 2026 naming "AI-enabled
   validation of grievance redressal to assess resolution quality and identify cases involving
   disposal through transfer or closure without effective resolution". Record that these phrases
   appear nowhere in DARPG's 154-page NextGen FRS and that pgportal.gov.in still reports version
   7.0.01092019.0.0.
2. Replace the verbatim `pgportal.gov.in` appeal-gate quote's weak citation with the primary one:
   *"After closure of grievance if the complainant is not satisfied with the resolution, he/she can
   provide feedback. If the rating is 'Poor' the option to file an appeal is enabled."* —
   pgportal.gov.in, page last updated 21-08-2026. Add that DARPG's own NextGen spec replaces the
   five-point gate with a Satisfied/Not-Satisfied binary offering the appeal on both branches, so
   the framing is "the gate is real today and the government's own spec agrees it should go" —
   not "the government does not care".
3. `round-table/05-submission/02-video-script.md`: rewrite minute two's opening so it credits
   DARPG first and claims only what is ours — the working implementation, and the evidence sitting
   with the citizen rather than the department. Keep it inside 2:00.
4. `round-table/05-submission/03-summary-250-words.md`: same reframe, **exactly 250 words**
   (the rules slide says exactly), and the corrected resolution figure.
5. `round-table/00-mission/04-hackathon-brief.md`: the 10 official platforms and the verbatim
   "IDEAS OVER CODE" sub-bullets, replacing the "examples, not a fixed list" error.
6. Add a short "what we do not claim" line to the video script covering: we did not discover that
   disposal is not resolution, and we are not the first to name closure-quality auditing.

**Verification:** every claim of novelty in the corpus is either removed or narrowed to the
implementation. Word-count the summary and show it is exactly 250.

## Task 7: Deployment readiness

The plan has recorded deployment as overdue since day one. This task prepares everything that can
be prepared without the account owner present.

1. Add `vercel.json` only if it is actually needed; document the required environment variables
   (`OPENAI_API_KEY`, `SUPABASE_DB_URL`, `LEDGER_PEPPER`, `GRIEVANCE_SYSTEM`, and any model
   overrides) in `.env.example` and in a new `docs/DEPLOY.md`.
2. `docs/DEPLOY.md` must carry the submission-day checklist as runnable steps: Deployment
   Protection **off**, Supabase not paused with a keep-warm plan through 1 Sep, the OpenAI hard
   spend cap, incognito + phone + mobile-data verification, and the demo path working with the
   OpenAI key removed.
3. Write `scripts/check-live-url.sh` taking a URL and asserting: 200 without cookies, no redirect
   to a login, the three demo case routes reachable, `/numbers` and `/how-this-works` reachable,
   and a mobile user-agent getting the same status. It must exit non-zero on failure.
4. Verify the fixture fallback from Task 4 covers the case where `OPENAI_API_KEY` is absent, so
   the headline demo path survives the review window.

**Verification:** `bash scripts/check-live-url.sh http://localhost:3111` passes against the local
server. The actual Vercel deploy needs the account owner and is explicitly out of scope here.
---

# Addendum — the on-device case list (added 26 Aug)

## Task 8: cases you have opened on this phone

The one genuine hole in Sunvai's own journey. The premise is that the citizen returns **weeks
later**, after closure — and nothing on the device remembered the case. Verified: the only
`localStorage` key in `src/` was `sunvai:textsize`; after `fileGrievance` the reference existed
only in the URL; Door A asked for a number nobody told the citizen to write down; and the three
demo chips are hardcoded, so a case a reviewer files themselves was unreachable the moment they
navigated away.

1. `localStorage` key `sunvai:cases` — a deduped ring capped at ~10 of `{ref, subject, savedAt}`,
   newest first. Written after `fileGrievance` succeeds and on mount of the case page (via a
   small client component — the page stays a server component). Read on the landing page under
   Door A. Empty renders **nothing** — no empty-state box.
2. Copy in all three languages, load-bearing because it is what makes a client-side store
   honest: the list is saved only on this phone and we never store it, and to show whether each
   case still opens we check its number with our server.
3. Every access in try/catch, following `src/components/TextSize.tsx`. A private window degrades
   to no list, never a broken page.
4. Per-item resilient hydration — each reference fetched in its own try/catch; a dead one renders
   a muted "could not open this one right now" row rather than blanking the list. Supabase's free
   tier sleeps, so without this the feature is worse than nothing on the first click of the day.
5. Split the Door A failure message so a database outage does not tell a citizen to re-check a
   number that was correct.

## Task 9: two improvements considered and cut

Neither was a missing feature, and neither fixed anything broken, so both were cut when the clock
tightened.

**9a — Per-row edit on the consent gate.** Every row gets its own "Edit" jumping back to the
owning step with state intact, instead of one "Change something" that returns the citizen to the
start of speaking. For someone who mis-spoke a single date, that is the difference between a
correction and starting again.

**9b — Browser speech as a zero-cost fallback.** The Web Speech API behind OpenAI STT: free, no
round trip, and it keeps working when the key is capped — which serves the "demo survives with
`OPENAI_API_KEY` removed" requirement in `docs/DEPLOY.md`. Fallback only, never default: weaker
on Indian languages, and the UI would have to say which produced the text.
