# Dee's workout challenge

**Live:** https://deepikabg.github.io/workout-challenge/

A small web app that tracks a personal challenge: **30 workout days in 45 days, Nov 9 – Dec 23, 2026**.
Friends open the link and see progress live. Only Dee can sign in and log workouts.

## What it shows
- **Headline:** workouts to go / days left (for example `25/38`), with a progress ring and pace (needed vs. actual per day).
- **45-day calendar** with a custom icon per workout type. Greyed squares mean a workout was logged but didn't count.
- **Stats:** total minutes, current and best streak, average session, finish projection, breakdown by type.
- **Daily quote** from an athlete or coach. Everyone sees the same one that day.
- **Workout history** page, which is also where Dee edits or deletes entries.
- Installs to a phone's home screen (Safari → Share → Add to Home Screen) and works offline with the last saved data.

## Challenge rules
- A day counts when at least one workout that day meets its minimum: **30 min** for a class or at the YMCA, **45 min** at home.
- Shorter workouts are still saved and add to total minutes, but don't count. Short sessions don't add up.
- Two workouts on one day count as one day.
- Dates use Toronto time. Days left includes today.
- Workout types: Gravity, TotalTone, Core & Stretch, Kettlebell, Yoga class, Gym time (YMCA) · Home yoga (home) · Other (pick YMCA or home).

## How it's built
| Part | What |
|---|---|
| Site | Static HTML/CSS/JS (no build step) on GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main` |
| Data | Supabase Postgres, table `public.workouts` (`db/migrations/`) |
| Access | Row-level security: anyone can read; only the owner's account can add, change or delete. New sign-ups are switched off. |
| Sign-in | Email + password. Signs out automatically after 2 days of not opening the app. |
| Live updates | Supabase Realtime, plus a refresh on focus and every 60 seconds |
| Keep-alive | `.github/workflows/keepalive.yml` reads one row weekly so the free Supabase project never pauses |

Code layout:
```
index.html  styles.css  manifest.webmanifest  sw.js
src/config.js   challenge dates, workout types, quotes, public Supabase settings
src/rules.js    pure counting logic (days counted, days left, streaks, pace, quote of the day)
src/data.js     Supabase reads/writes, offline cache, error messages
src/auth.js     sign-in, 2-day inactivity sign-out
src/ui.js       page rendering · src/log.js logging/editing · src/live.js live updates
src/icons.js    custom workout illustrations · src/sheets.js sheets, toasts, confetti
vendor/         supabase-js 2.118.0 (bundled, not loaded from a CDN)
db/migrations/  001 table + read access · 002 owner-only writes · 003 the first 5 workouts
```

The Supabase key in `src/config.js` is the **publishable** key. It's meant to be public, and the database rules decide what it can do. No secret keys are in this repo, and CI fails if one appears.

## Running it locally
Needs Node 22. Browser tests use Playwright's Chromium.
```bash
npm test          # unit + fixture tests (counting rules, data layer, auth, secret scan)
npm run e2e       # browser journeys with Supabase stubbed (friend view, sign-in, log/edit/delete, offline, PWA)
npm run serve     # http://127.0.0.1:8080 against the real Supabase project
LIVE=1 node --test "tests/live/*.live.mjs"   # security checks against the real project (also run in CI)
```

## Owner tasks
- **Forgot the password:** Supabase dashboard → Authentication → Users → your user → reset or set a new password.
- **Fix a workout:** sign in, open Workout history, tap the entry.
- **Change workout types or quotes:** edit `src/config.js` and update the type check in a new migration, then merge to `main`.
- **Roll back the site:** revert the merge commit on `main`. Data isn't affected.

## How it was made
Built with Claude Code using the pm-gates loop. The brief, test checklist, prototype, architecture, security baseline, build plan, decision log and test evidence are in [`.pipeline/`](.pipeline/), with progress status in `.pipeline/state.yaml`.
