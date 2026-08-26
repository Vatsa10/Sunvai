#!/usr/bin/env bash
# Is the deployment actually reachable by a stranger with no cookies and no login?
#
# The failure mode this exists to catch is invisible from inside your own browser: Vercel
# Deployment Protection returns a login wall instead of the app, and if you are already signed
# into the Vercel org that owns the project, your browser sails past it and you never see the
# wall a judge would hit. This script makes every request cookieless and checks the response
# is the app, not an auth page, before anything gets submitted.
#
# Usage: bash scripts/check-live-url.sh <base-url>
#   e.g. bash scripts/check-live-url.sh http://localhost:3111
#        bash scripts/check-live-url.sh https://sunvai.vercel.app
set -uo pipefail

BASE="${1:-}"
if [ -z "$BASE" ]; then
  echo "usage: $0 <base-url>" >&2
  exit 2
fi
BASE="${BASE%/}"

ROUTES=(
  "/"
  "/case/DEMO%2F2026%2F0000472"
  "/case/DEMO%2F2026%2F0000518"
  "/case/DEMO%2F2026%2F0000631"
  "/file"
  "/numbers"
  "/how-this-works"
  "/verify"
  "/dept"
  "/api/receipt/DEMO%2F2026%2F0000472"
)

MOBILE_UA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"

fail=0
pass() { echo "PASS: $1"; }
bad()  { echo "FAIL: $1"; fail=1; }

# 1. Root, no cookies, must be 200 with no redirect to a login/auth wall.
root_headers=$(curl -sS -D - -o /dev/null --max-time 15 -A "check-live-url/1.0" "$BASE/") || {
  bad "could not reach $BASE/ at all"
  echo "$root_headers"
}
if [ -n "${root_headers:-}" ]; then
  status_line=$(echo "$root_headers" | head -n1)
  status=$(echo "$status_line" | grep -oE '[0-9]{3}' | head -n1)
  if [ "$status" = "200" ]; then
    pass "GET / -> 200, no cookies"
  else
    bad "GET / -> $status_line (expected 200 — a redirect here usually means Deployment Protection is ON)"
  fi

  if echo "$root_headers" | grep -qiE '^location:.*(vercel\.com/login|_vercel/insights|sso-api|auth)'; then
    bad "GET / redirects toward an auth/login wall: $(echo "$root_headers" | grep -i '^location:')"
  else
    pass "GET / does not redirect to a login wall"
  fi

  if echo "$root_headers" | grep -qi '^set-cookie:.*_vercel_sso'; then
    bad "response sets a Vercel SSO cookie — Deployment Protection is on"
  else
    pass "no Vercel SSO cookie set"
  fi
fi

# 2. Every required route reachable with a plain, cookieless GET.
for route in "${ROUTES[@]}"; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 -A "check-live-url/1.0" "$BASE$route")
  if [ "$code" = "200" ]; then
    pass "GET $route -> 200"
  else
    bad "GET $route -> $code (expected 200)"
  fi
done

# 3. A mobile user-agent gets the same status as a desktop one on the routes that matter most.
for route in "/" "/case/DEMO%2F2026%2F0000472" "/file"; do
  desktop=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "$BASE$route")
  mobile=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 -A "$MOBILE_UA" "$BASE$route")
  if [ "$desktop" = "$mobile" ] && [ "$mobile" = "200" ]; then
    pass "mobile UA GET $route -> 200 (matches desktop)"
  else
    bad "mobile UA GET $route -> $mobile, desktop -> $desktop (expected both 200 and equal)"
  fi
done

echo
if [ "$fail" -ne 0 ]; then
  echo "RESULT: FAIL — do not submit this URL yet"
  exit 1
else
  echo "RESULT: PASS — $BASE looks reachable by a stranger"
  exit 0
fi
