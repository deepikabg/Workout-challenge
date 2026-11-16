# Story Map: Dee's workout challenge
Epics: 5  Stories: 10  Batches: 6  Parallel-safe: 7 stories  ·  Human tasks: 4
Traceability: **COMPLETE**
Spec-readiness (inline, 2026-11-16): 0 blocking questions after replaying D-026; 3 setup items need the owner's dashboard (H-1..H-3) and are planned as human tasks, not gaps.

## Epics
| Epic | Component (Architecture) | Serves (Brief) |
|---|---|---|
| E1 Rules | `src/rules.js`, `src/config.js` | counting, headline, stats, quote |
| E2 Data | Supabase schema/RLS/realtime, `src/data.js` | public read, owner-only write, live |
| E3 UI | `index.html`, `styles.css`, `src/ui.js` | home, calendar, stats, history, log sheet |
| E4 Auth | `src/auth.js` | owner sign-in, 48 h inactivity |
| E5 Platform | PWA, CI, keep-alive, Pages deploy, journey tests | install, safety net, $0 hosting |

## Build order (topological batches)
**Batch 1** (parallel)
- **S-001 Rules engine + config** — pure `rules.js` (qualifies, compute, Toronto dates, streaks, pace, quote-of-day, inactivity check) + 40 quotes + types. Tests first: `tests/rules.test.js`. *Criteria:* C-01–C-14 (logic), C-15 (copy review). *Files:* src/rules.js, src/config.js, tests/rules.test.js.
- **S-002 Supabase project + schema** — create project (approved D-028), migration `001_workouts.sql`: table, checks, RLS on, public select policy, no write policies yet, realtime publication. SQL guardrail script `tests/sql/guardrails.sql`. *Criteria:* G-01, G-02, C-06 (DB backstop). *Files:* db/, tests/sql/.

**Batch 2**
- **S-003 CI + secret scan + dirty fixtures** (needs S-001) — Actions workflow running `node --test`; secret scan for `service_role`/foreign JWTs/.env (G-05); `tests/fixtures/dirty/` (same-day duplicates, out-of-window rows, short-only days, "Other" at home, late-night entries) consumed by rules tests. *Criteria:* G-05, C-04, C-05, C-06, C-07, C-09. *Files:* .github/workflows/ci.yml, tests/fixtures/. Parallel with S-004.
- **S-004 Read-only UI port** (needs S-001, S-002) — port prototype v6 (home: hero, quote, calendar, stats, history link; #history page) onto `data.js` list + localStorage last-known cache; offline/error banners; vendored supabase-js (D-026). *Criteria:* J-1, C-01, C-13, P-02 (data never SW-cached — UI half), NETWORK copy. *Screens:* home, history, offline banner. *Files:* index.html, styles.css, src/ui.js, src/data.js, vendor/.

**Batch 3**
- **S-005 Owner sign-in** (needs S-004; **blocked on H-1, H-2**) — "Dee? Sign in" → email → 6-digit code → session; sign-out; 48 h inactivity sign-out; CODE_* error copy. *Criteria:* C-14, G-04 (shouldCreateUser:false), J-2 step 1. *Files:* src/auth.js, src/ui.js (header + sheet).

**Batch 4**
- **S-006 Owner write path + seed** (needs S-005, S-002; **blocked on H-1** for owner UUID) — migration `002_owner_policy.sql` (insert/update/delete only for owner UUID), migration `003_seed.sql` (the 5 backfilled workouts); log sheet, history edit/delete, idempotent upsert with client UUID, under-minimum warning, error taxonomy. Then **H-3** (disable sign-ups). *Criteria:* J-2, J-3, J-4, J-6, G-03, G-04, C-03, C-09, C-10 (celebration UI). *Files:* db/, src/data.js, src/ui.js.

**Batch 5** (parallel)
- **S-007 Live updates** (needs S-006) — realtime subscription → refetch; refetch on `visibilitychange` + every 60 s. *Criteria:* J-8. *Files:* src/data.js, src/live.js.
- **S-008 PWA** (needs S-004) — manifest, 192/512 PNG icons rendered from the custom SVG, `sw.js` (network-first HTML, versioned shell cache, never caches Supabase calls), install tip. *Criteria:* P-01, P-02, J-5. *Files:* manifest.webmanifest, sw.js, icons/, index.html `<head>`.
- **S-009 Keep-alive + Pages deploy workflows** (needs S-003) — weekly anon read; Pages deploy from `main` via Actions. *Criteria:* D-019 acceptance (workflow run reads 1 row, exit 0), deploy path for J-1. *Files:* .github/workflows/keepalive.yml, pages.yml.

**Batch 6**
- **S-010 Journey suite (phase integration test)** (needs all) — Playwright specs J-1–J-8 against a local server and the real project; screenshots to `.pipeline/results/`; this is `tests/loop-phase3`. Runs in qa-verify pre-handoff. *Criteria:* J-1–J-8, ship gate.

## Human tasks (owner, in the Supabase dashboard — ~5 min total)
| # | When | What | Why |
|---|---|---|---|
| H-1 | after S-002 | Authentication → Users → **Add user** → your email (no password) | creates the one owner account; sign-ups stay off |
| H-2 | after S-002 | Authentication → Email templates → **Magic Link**: include `{{ .Token }}` (I'll give exact text) | so the email contains a 6-digit code |
| H-3 | after S-006 | Authentication → Sign In / Providers → turn **off** "Allow new users to sign up" | stranger can't create an account (G-04) |
| H-4 | deploy-gate | Settings → Pages → Source: **GitHub Actions**; merge the PR to `main` | go live (deploy approval) |

## Traceability matrix
| Journey / criterion | Stories | Covered |
|---|---|---|
| J-1 friend views | S-004, S-009, S-010 | ✓ |
| J-2 owner logs | S-005, S-006, S-010 | ✓ |
| J-3 short workout greyed | S-006 (+ S-001 logic) | ✓ |
| J-4 edit/delete in History | S-006 | ✓ |
| J-5 install / stays signed in | S-008, S-005 | ✓ |
| J-6 friend can't write | S-002, S-006 | ✓ |
| J-7 celebration (P1) | S-006 | ✓ |
| J-8 live update | S-007 | ✓ |
| C-01–C-13 counting/stats/quote | S-001 (+ fixtures S-003) | ✓ |
| C-14 48 h inactivity | S-001 (logic), S-005 (wiring) | ✓ |
| C-15 quote copy review | S-001 | ✓ |
| G-01, G-02 anon writes rejected | S-002 | ✓ |
| G-03 non-owner writes rejected | S-006 | ✓ |
| G-04 no stranger sessions | S-005, S-006 + H-3 | ✓ |
| G-05 no secrets shipped | S-003 | ✓ |
| P-01 manifest · P-02 fresh data | S-008, S-004 | ✓ |
| Brief Must: backfill 5 workouts | S-006 (003_seed) | ✓ |
| Brief Must: daily quote, stats, calendar, history | S-001, S-004 | ✓ |
| D-019 keep-alive | S-009 | ✓ |

Every story traces to ≥1 criterion. No untraced Must-haves.

## GitHub projection
Issues created per story with batch/epic labels (see state.yaml `github_issue`). Project board: skipped — this environment has no GitHub Projects access; issue labels `batch-N` give the build order view.
