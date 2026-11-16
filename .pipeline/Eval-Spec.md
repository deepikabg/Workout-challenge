# Eval Spec: 30-in-45 Workout Challenge Tracker
Linked MVP: .pipeline/Brainstorm-Brief.md   AI-native: **no** · Mode: lite (D-001)

Everything here is deterministic → unit/integration tests + a guardrail suite. No probabilistic evals, no gold set, no LLM judge, no runtime eval loop (N/A — nothing model-driven). Fixed clock in tests: `America/Toronto`.

## Feature/Dimension Inventory & Classification
| Feature/Dimension | Bucket | Frequency | Instrument |
|---|---|---|---|
| Challenge counting (distinct qualifying days) | test | every render | unit tests over `stats.js` |
| Headline `to-go / days-left` | test | every render | unit (clock injected) |
| Qualification (30 min YMCA / 45 min home) | test | every log | unit |
| Calendar states (counted / greyed / empty / today / future / outside window) | test | every render | unit + DOM snapshot |
| Stats (total min, streaks, pace, by-type, avg) | test | every render | unit |
| Daily quote (deterministic per Toronto date) | test | daily | unit |
| Quick-log create / edit / delete | test | ~daily | integration vs. local Supabase or mocked client |
| Owner-only write | **guardrail** | always | RLS red-team suite (anon + other-user attempts) |
| No secrets in shipped bundle | **guardrail** | every deploy | grep the built site for service_role key / JWT secret |
| Public read without login | test | every visit | integration (anon select) |
| PWA installable + shows fresh data | test | once / every open | Lighthouse-style manifest check + network-first data fetch test |
| Finish celebration at 30 | test | once | unit |

## Failure Taxonomy (error analysis — synthetic, dimension-driven)
Dimensions used: date (window start / end / today / outside window / late-night entry) × location (YMCA / home) × duration (below / at / above min) × sessions per day (0 / 1 / 2 qualifying / 1 qualifying + 1 short / 2 short).

| Category (root cause) | Mechanism | Freq×Impact | Bucket | Caught by |
|---|---|---|---|---|
| Timezone drift | UTC used for "today" → 9pm Toronto log lands on tomorrow | high×high | test | C-07, C-08 |
| Off-by-one days-left | today excluded / end date excluded | high×high | test | C-01, C-02 |
| Same-day double count | counting sessions not days | high×high | test | C-04 |
| Short sessions summed | adding minutes before applying min | med×high | test | C-05 |
| Wrong minimum applied | type→location mapping wrong | med×high | test | C-03 |
| Out-of-window entries counted | entry dated before Nov 9 / after Dec 23 | low×med | test | C-06 |
| Anon/third-party write succeeds | RLS missing or `using(true)` on write | low×catastrophic | guardrail | G-01..G-04 |
| Service key shipped to browser | wrong key in config | low×catastrophic | guardrail | G-05 |
| Stale PWA cache | service worker serves cached data → wrong count | med×med | test | P-02 |
| Owner session lost in home-screen app | magic-link opens Safari, not PWA | med×med | test | J-2 step 2 (6-digit code flow) |

## Counting Test Cases (binary, all must pass)
Clock = 2026-11-16 12:00 America/Toronto unless stated. Seed = the 5 backfilled workouts.
- **C-01** Seed, clock Nov 16 → done 5, to-go 25, days-left 38, headline `25/38`.
- **C-02** Clock Dec 23 → days-left 1. Clock Dec 24 → challenge shown as ended, days-left 0. Clock Nov 9 → days-left 45.
- **C-03** YMCA type 29 min → not counted; 30 → counted. Home type 44 → not counted; 45 → counted.
- **C-04** Two qualifying workouts on one day → done +1, both listed, minutes = sum.
- **C-05** Home 25 + home 20 same day → day NOT counted, both greyed, total minutes +45.
- **C-06** Entry dated Nov 8 or Dec 24 → excluded from count and calendar (or rejected by form).
- **C-07** Workout logged at 23:30 Toronto on Nov 16 → stored/shown as Nov 16.
- **C-08** Clock Nov 16 23:59 vs Nov 17 00:01 Toronto → days-left 38 → 37.
- **C-09** Short + qualifying same day → day counts; short entry greyed, qualifying entry normal.
- **C-10** 30th counted day → celebration state; to-go shows 0, never negative; 31st day still shows ≥30 done.
- **C-11** Streaks: current streak counts consecutive counted days ending today or yesterday; a greyed-only day breaks it.
- **C-12** Pace: needed = to-go ÷ days-left (25/38 = 0.66/day); actual = done ÷ elapsed days incl. today (5/8).
- **C-14** Session inactivity: owner last active T; reopen at T+47h59m → still signed in (and last-active refreshed); reopen at T+48h01m → signed out, header shows Sign in (D-022).
- **C-15** Quote list contains no peer-pressure, guilt, or rest/stillness lines (manual copy review, D-023).
- **C-13** Quote for a given Toronto date is identical across reloads and viewers; changes on the next date.

## Guardrails (zero tolerance)
- **G-01** Anon key insert into `workouts` → rejected.
- **G-02** Anon update/delete → rejected / 0 rows affected.
- **G-03** Authenticated non-owner (a different email) insert/update/delete → rejected.
- **G-04** Sign-up by a stranger does not grant write (owner identified by fixed user id, not "any authenticated user").
- **G-05** Built site contains no `service_role` key and no Supabase JWT secret.

## Critical User Journeys (qa-verify script)
| # | Journey | Steps | Binary pass criterion | Priority |
|---|---|---|---|---|
| J-1 | Friend views progress | open public URL in a fresh browser, no login | headline, calendar (5 filled days with icons), stats, today's quote render; History page lists all workouts; no add/edit controls visible | P0 |
| J-2 | Owner logs a workout from phone | open app → sign in once (email code) → tap type → confirm duration → save | new entry appears; headline updates (e.g. 25/38 → 24/38) within 2 s; ≤3 taps after sign-in | P0 |
| J-3 | Owner logs a short workout | log Home yoga 20 min | entry saved, greyed on calendar + log, count unchanged, total minutes +20 | P0 |
| J-4 | Owner fixes a mistake | History page → tap entry → edit duration or delete | count/calendar/stats recompute correctly | P0 |
| J-5 | Install to home screen | browser "Add to Home Screen" | icon appears; opens standalone; shows current (not cached-stale) data; owner stays signed in across opens within 48 h | P0 |
| J-6 | Friend can't write | anon user attempts write via devtools/API | rejected (G-01..G-02) | P0 |
| J-8 | Live update | friend has the page open; owner logs a workout on the phone | friend's headline/calendar update within 5 s without reload | P0 |
| J-7 | Challenge complete | 30th counted day logged | celebration shows for owner and friends | P1 |

## PWA
- **P-01** Manifest has name, icons (192/512), `display: standalone`, theme colour.
- **P-02** Data is fetched network-first; cached shell only when offline, with an "offline — showing last known" note.

## Segment Slices
Owner vs. anonymous friend (J-1 vs J-2) · iOS Safari vs Android Chrome for J-5 · Narrow phone (375px) vs desktop.

## Thresholds
- Ship gate: **100% of C-*, G-*, P-* pass; J-1..J-6 pass in qa-verify pre-handoff.** Any G-* failure blocks deploy.
- HITL: owner is the only writer; no automated decisions exist.
- Instrumentation: none beyond Supabase logs — personal tool, 45-day lifespan (frequency lens).

## Runtime Eval Loop
N/A — no probabilistic component. Recorded so architecture-checkpoint does not expect one.

## → Feeds: prototype (J-1..J-5 become clickable screens), then architecture-checkpoint.
