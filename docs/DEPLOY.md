# Deploy checklist

Read this once now, then again as literal steps at submission time. Every step is something
you run or click — nothing here is background reading.

**The single most common way to lose this competition silently:** a URL that opens to a login
page, or a database that is paused, and nobody notices because whoever is checking it is
already signed in and already has the database awake in another tab. A judge has neither. Every
step below exists to catch that.

## 0a. Region — this one is worth more than it looks

`vercel.json` pins functions to `sin1` (Singapore). It must stay pinned to whatever region the
Supabase project lives in.

The default put functions in `iad1` (Washington DC) against a Supabase in `ap-southeast-1`
(Singapore), so every query crossed the Pacific and back. The headline case page took **3.4s**
live while taking 0.65s locally, and a second hit did not help because the cost was network, not
cache. `X-Vercel-Id: bom1::iad1` is how you spot it — the first segment is where the request
entered, the second is where it actually ran.

If you move the database, change this file to match. If you ever see a case page above a second
in production, check that header first.

## 0. Before you touch Vercel

- `Nirantar/` and `CPGRAMS/` are **other people's separate projects** living in this same
  directory. They are not part of Sunvai. **Do not deploy them, do not zip them with the
  submission, and if you are pointing Vercel at a Git root rather than a subfolder, confirm the
  project root is set to the Sunvai app and not the repo root that also contains those
  folders.**
- Confirm you are deploying the `truth-and-harm-pass` branch (or whatever branch has been
  merged to `main` by then) — not a stale one.

## 1. Environment variables in Vercel

Project Settings -> Environment Variables -> add for **Production** (and Preview if you want
preview deploys to work too):

| Variable | Value | What breaks without it |
|---|---|---|
| `OPENAI_API_KEY` | your real key | AI features (Try the Auditor, appeal drafting, jargon, read-aloud) throw; the three demo case pages still render because their audits are precomputed |
| `SUPABASE_DB_URL` | `postgresql://...:5432/...` — **port 5432, not 6543** | every DB call fails and every page falls back to the fixture banner |
| `LEDGER_PEPPER` | a real random value, set once | ledger hashes are unsalted; never rotate this on a database that already has rows |
| `GRIEVANCE_SYSTEM` | `mock` | leave as `mock` — this is the only value that should ever be set for this submission |
| `MODEL_REASONING`, `MODEL_FAST`, `MODEL_CONVERSATIONAL`, `MODEL_VISION`, `MODEL_EMBEDDING`, `MODEL_TRANSCRIBE`, `MODEL_TTS` | leave unset | optional overrides only; defaults in `src/lib/agents/openai.ts` are fine |

**Port check, out loud:** open the value you pasted for `SUPABASE_DB_URL` and read the number
right before `/postgres`. If it says `6543`, fix it to `5432` before you do anything else.
`src/lib/db.ts` rewrites `6543`→`5432` defensively at connect time, but do not rely on that —
set it right in Vercel so the pooler you *think* you're using is the one you're using.

No `vercel.json` is checked in and none is needed — this is a standard Next.js 15 App Router
project and Vercel's zero-config build handles it. Do not add one unless a build actually fails
without it.

## 2. Deployment Protection — OFF

This is the classic silent failure: Deployment Protection returns a login page instead of the
app to anyone not signed into your Vercel org, and because you *are* signed in, you never see
it happen.

1. Project Settings -> Deployment Protection.
2. Set it to **Off** (or, if the plan forces some protection, to the most permissive "Public"
   option available) for the Production deployment you are submitting.
3. Save, then wait for it to apply — this is not always instant.
4. Verify with `scripts/check-live-url.sh` (step 6 below) run from a machine or connection that
   is **not** signed into your Vercel account.

## 3. Supabase — not paused, with a keep-warm plan through 1 September

Free-tier Supabase projects pause after a period of inactivity. A paused project means every DB
call times out and every page falls back to the fixture banner — survivable, but not the first
impression you want.

1. Confirm the project is on and unpaused right now: Supabase dashboard -> Project -> should
   not show a "Paused" banner.
2. **Keep-warm plan, 26 Aug -> 1 Sep:** ping the deployed `/` route (or run
   `scripts/check-live-url.sh` against the live URL) **at least once every 24 hours** through
   1 September. A single `curl` or a page load is enough to keep the project from going idle-
   long-enough-to-pause. Put a recurring reminder on your phone/calendar for this window — do
   not rely on remembering.
3. If it does pause anyway: the fixture fallback means the three demo cases and their audits
   still render, with an honest banner. This is the safety net, not the plan — resume the
   project from the Supabase dashboard as soon as you notice, and re-run
   `scripts/check-live-url.sh`.

## 4. Migrations, in order, by hand

There is no migration runner. From a machine with `psql` and network access to Supabase:

```bash
for f in supabase/migrations/*.sql; do
  echo "applying $f"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f" || { echo "FAILED at $f — stop and fix before continuing"; break; }
done
```

Confirm this ran against port `5432`, not `6543` — same reason as above: the migrations
themselves don't need the advisory lock, but you want to be in the habit of using the one
connection string everywhere.

Sanity check afterward:

```bash
psql "$SUPABASE_DB_URL" -c "\dt"
```

You should see the grievances/ledger/appeals/confirmations tables and the rest of the schema.

## 5. Seed the database

```bash
pnpm seed
```

Confirm it reports the three demo cases (`DEMO/2026/0000472`, `DEMO/2026/0000518`,
`DEMO/2026/0000631`) written without error. Re-running `pnpm seed` against an already-seeded
database should be safe (idempotent) — if it errors, read the error before assuming it's fine
to ignore.

## 6. Verify the live URL is actually reachable by a stranger

```bash
bash scripts/check-live-url.sh https://<your-vercel-url>
```

This checks: HTTP 200 with no cookies, no redirect to a login/auth wall, every route a judge
might hit (`/`, all three demo cases, `/file`, `/numbers`, `/how-this-works`, `/verify`,
`/dept`, the receipt API), and that a mobile user-agent gets the same response as desktop. It
exits non-zero on any failure — do not submit the URL until this passes clean.

## 7. Manual verification — incognito, phone, mobile data

The script above covers what a machine can check. These three cannot be scripted and matter
just as much:

1. **Incognito / private window**, no extensions, not signed into anything. Open the URL cold.
   You should land on `/` with no login prompt.
2. **Your own phone, on Wi-Fi.** Open the URL, tap through to one demo case, confirm it's
   readable without zooming or horizontal scrolling.
3. **Your own phone, on mobile data (Wi-Fi off).** Same walk-through. This catches anything that
   only breaks off your home network — a firewall rule, a CDN edge issue, a redirect that only
   your router resolves correctly.

If any of the three shows something different from what `check-live-url.sh` reported, trust
the phone — it's the closer approximation of a judge.

## 8. OpenAI hard spend cap

Before the review window opens:

1. platform.openai.com -> Settings -> Billing -> Limits.
2. Set a **hard usage limit** (not just a soft/notification threshold) at a number you are
   comfortable losing entirely if traffic is heavier than expected — a few dollars is plenty
   for a review window's worth of demo traffic on `gpt-5-mini`.
3. Confirm the cap is saved and showing as active, not just entered in the field.

## 9. Confirm the demo path survives with `OPENAI_API_KEY` removed

The headline path — opening any of the three demo cases and reading its audit — must not
depend on OpenAI being reachable during the review window. This was checked during
implementation (see `task-7-report.md` for detail): the three demo cases' audits are
precomputed and stored (in the DB when it's up, in
`evals/fixtures/precomputed-audits.json` via `src/lib/fixture-cases.ts` when it's down), so
`getCase`/`fixtureCase` never call OpenAI. Only "Try the Auditor" (arbitrary text) and appeal
drafting call OpenAI live, and those fail with a caught, on-screen error rather than a crash —
`src/lib/agents/openai.ts`'s `openai()` throws `MissingKeyError` before ever making a request.

To re-confirm at submission time if you have doubts:

```bash
# In a local .env copy only — do not do this in Vercel's real environment.
OPENAI_API_KEY= pnpm build && PORT=3111 pnpm start
bash scripts/check-live-url.sh http://localhost:3111
```

`check-live-url.sh` passing here means the demo path (all routes, all three cases) is fine with
no key at all.

## 10. Final sign-off

- [ ] Deployment Protection off, confirmed from a signed-out session
- [ ] Supabase unpaused, keep-warm reminder set through 1 Sep
- [ ] Migrations 1-13 applied in order, `\dt` shows the schema
- [ ] `pnpm seed` ran clean
- [ ] `scripts/check-live-url.sh <live-url>` exits 0
- [ ] Incognito, phone-on-wifi, phone-on-mobile-data all checked by hand
- [ ] OpenAI hard spend cap set and active
- [ ] Demo path re-confirmed to survive a missing `OPENAI_API_KEY`
- [ ] `Nirantar/` and `CPGRAMS/` are not in the deployed project and not in the submission zip
