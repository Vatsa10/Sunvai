# Sunvai — the first fifteen seconds

## Context

Deployed and green at https://sunvai.vercel.app. Every gate passes, the journey is verified, the
numbers are measured or labelled. **~20 hours to the extended deadline (29 Aug 2026, 22:00 IST).**

This plan is not about correctness. It is about the three sentences on Varun Mayya's own slides
that we currently answer badly, and about a judge on submission 180 of 250 who clicks once.

**"BUILD FOR BUSY CITIZENS — They're frustrated, they don't have time, and they want a solution
faster and simpler than the site they use today."**
Our structural weakness. Sunvai is not simpler than CPGRAMS; it is *additional* to it. Everyone
rebuilding IRCTC can claim fewer taps. We cannot — unless we change what "simpler" is measured in.

**"SHIP BOLD, USEFUL IDEAS — A map, a tax calculator, a chatbot-driven flow."**
He named the artifacts. We have a map. It is two navigations deep at `/cluster/[id]` and most
judges will never see it.

**"Put your energy into the experience, not the plumbing."**
Our best work — the ledger, the citation guard, 74 hand-labelled cases — is invisible by his
definition. The visible surface has to carry more than it does.

Add the observed failure: the landing page's first actionable control is a form asking for a
registration number a judge does not have. The three demo cases are the fourth thing down.

## Global Constraints

Everything from `2026-08-23-truth-and-harm-pass.md` still binds, in particular:

- **No government logo, emblem, masthead, or visual mimicry of a government portal.** A
  side-by-side may quote the *text* a citizen receives. It may not imitate the portal's interface,
  because that shades into impersonation, which is disqualifying.
- **A number on screen is measured or labelled simulated.** No third category.
- **Audit ≠ metric.** The resolution rate comes from `confirmations`, never a model verdict.
- Never say "blockchain", "immutable" or "tamper-proof". Never quote an appeal rate.
- Never claim novelty over DARPG (PIB factsheet, 9 Aug 2026).
- Accessibility floor: ≥18px body, ≥48px targets, 7:1 contrast, no meaning by colour alone.
- No new npm dependencies. All data synthetic, `DEMO/` prefixes, no real official named.
- Green before commit: `tsc --noEmit`, `pnpm build`, `check-adapter-boundary.sh`,
  `check-citation-guard.ts`, `check-doorb-guards.ts`, `check-journey.ts`.
- **Never run `pnpm eval:auditor`** (74 real model calls). Avoid `pnpm seed` unless required.

## Task A: Lead with the demo, and open with a number

`src/app/page.tsx` currently orders: header chrome → text-size controls → language picker →
tagline → Door A form → Door B → demo chips → paste box → measured accuracy.

Reorder so the first screen answers *who is hurt, by what, and what did you change*:

1. **A one-line problem statement carrying a real number**, above everything. The strongest
   available and already sourced in `README.md`: roughly 2.6 lakh grievances were closed in a
   single month against about 79,000 feedback calls — so the large majority of people whose case
   was closed were never asked whether it worked. State it in one sentence with the figure and its
   source, and label it as the published national picture rather than our own measurement.
2. **The three demo cases immediately under it**, as the primary action — they are the "instant
   login" the rules video asks for. Keep the DEMO DATA badge.
3. **Door A demoted** below them. Someone who has a registration number will look for the box;
   a judge who does not must not meet it first.
4. Text-size and language controls stay reachable but must not push the proposition below the
   fold on a phone.

Do not remove anything. This is ordering and one new line, not a redesign.

## Task B: The side-by-side — what you get today, and what we add

A static component near the top of the landing page, using Kamla's real seeded case.

**Left — "What the portal tells you today":** her closure, verbatim, exactly as received: *"The
matter has been forwarded to the concerned disbursing authority. The grievance is accordingly
closed at this level."* Plus the status word **Disposed**, and the elapsed time: filed 6 Aug,
closed 25 Aug, nineteen days.

**Right — "What Sunvai tells you":** the verdict, the quoted span it rests on, the specific things
never answered, and the named next forum.

**Plain text, no interface mimicry, no logos.** The left panel is deliberately unstyled — that is
the point, not a design choice to be improved.

Underneath, one line that reframes the criterion, because this is the whole argument:
*simpler is not fewer taps — it is fewer unanswered questions.* Write it better than that.

## Task C: Surface the map on `/numbers`

`src/components/ClusterMap.tsx` already renders a schematic inline-SVG map of offices with no
external tiles and no map library. Generalise it into a national view on `/numbers`, inside the
**simulated** half, sized or coloured by the gap between disposal and true resolution per office.

Requirements: no meaning by colour alone (size and a label must carry it too); must remain legible
on a narrow phone; must stay inside the simulated section with its existing framing; office
coordinates only, never a complainant's location — the existing caption already says this and must
survive.

## Task D: Make the elapsed time visible on the case page

Nineteen days to a non-answer is the most visceral fact in the demo and it is currently a
subordinate clause. Give it weight on the case page — the number of days from filing to closure,
next to what she got for them. No new data required; `filedAt` and `closedAt` are already there.

## Task E: A step-count comparison, only if A–D land with time to spare

The honest version of "faster and simpler": on CPGRAMS today, the appeal unlocks only if the
citizen rates the closure "Poor" — a question reached through a feedback flow most people are never
prompted for. Quote pgportal.gov.in verbatim (*"If the rating is 'Poor' the option to file an
appeal is enabled"*), state that the appeal here is offered directly, and note that DARPG's own
NextGen spec replaces that gate with a Satisfied/Not-Satisfied binary. Frame as *the gate is real
today and the government's own spec agrees it should go* — never as the government not caring.

**Cut this first if the clock tightens.**

## What is deliberately NOT in this plan

A chatbot-driven flow (Samadhan Didi shipped it, in 22 languages, on 30 May 2026 — building a
worse one in front of DARPG is the single fastest way to lose the room) · a tax calculator (wrong
platform) · any redesign of the visual language · anything touching the auditor, the eval, the
ledger, or the metric.

## Verification

Every task: the six gates above, then fetch the live page and read the rendered text in `hi`, `en`
and `mr` — the landing page defaults to Hindi and any new copy must exist in all three or it
recreates the half-Hindi defect. Confirm on a narrow viewport that the problem statement and the
three cases are both above the fold.
