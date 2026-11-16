# Deploy Gate: Dee's workout challenge — 2026-11-16

## Pre-handoff QA (localhost, no deploy)
- Fresh clone of `ccr-b35d4b70-ig1nan`, zero installs: `npm test` 48/48, `npm run e2e` 11/11 (1 live-browser test skipped: this workspace cannot reach Supabase).
- Journeys verified in a real browser (Supabase stubbed at the network layer): J-1 friend view + offline, J-2 sign-in + log in 2 taps, J-3 short workout greyed, J-4 edit/delete, J-7 celebration, J-8 refetch backstop, P-01, P-02, C-14.
- Live against the real project (GitHub Actions run 43970030441): J-1 data readable, J-6/G-01/G-02 public writes refused and data unchanged, G-04 sign-ups disabled.
- Day-0: first open shows the 5 real workouts (seeded); every P0 journey works with no optional infra.

## Artifact scan
- Published set = index.html, styles.css, manifest.webmanifest, sw.js, src/, vendor/, icons/ (348 KB). No .pipeline, tests, db, scripts.
- Secret scan clean on repo and on the published set (G-05). Only key shipped: Supabase publishable key (public by design).
- Dependencies: @supabase/supabase-js 2.118.0 (vendored, released 2026-10-15) — `npm audit`: 0 vulnerabilities.
- Public endpoints: GitHub Pages static site; Supabase REST/Realtime/Auth (RLS default-deny; owner-only writes).

## Irreversible actions
| Action | Status |
|---|---|
| Supabase project + migrations 001–003 | approved by owner (D-028), applied by owner in SQL Editor |
| Production deploy (merge to `main` → GitHub Pages) | **WAITING FOR OWNER APPROVAL** |

## Not yet verified (post-deploy qa-verify with the owner)
- Realtime websocket push on the live site (J-8 primary path).
- J-5 install to home screen on the owner's phone; session survives app reopen.
- Live-site render on a real phone, light and dark mode.

## Rollback
Revert the merge commit on `main` (Pages redeploys the previous version), or disable Pages in Settings. Data is unaffected by a site rollback.
