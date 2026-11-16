# Decision Ledger (append-only)

## D-001 · routing · 2026-11-16 · status: accepted
Decision: Classify Level 3 (greenfield + data store + auth) but run trimmed: skip market-scan; prototype validation is founder-as-user only; eval-spec lite.
Trigger: Claude recommendation — personal 45-day tool, challenge already running, speed matters.
Rationale + alternatives: Full ceremony weighed; market research cannot change a personal tracker's design.
Affects: —     Decided by: human (on claude recommendation) · approved: y (2026-11-16)
Supersedes: —

## D-002 · brainstorm · 2026-11-16 · status: accepted
Decision: Every workout counts toward 30 — classes, at-home yoga, and solo gym. Friends can read all data; only the owner writes.
Trigger: user answer
Affects: Brainstorm-Brief     Decided by: human · approved: y
Supersedes: —

## D-003 · architecture · 2026-11-16 · status: proposed
Decision: Static page (GitHub Pages) + Supabase table with RLS (public select, owner-only insert/update/delete via magic-link auth).
Trigger: user asked for Supabase + own repo
Affects: Architecture     Decided by: claude · approved: pending architecture-checkpoint
Supersedes: —

## D-004 · brainstorm · 2026-11-16 · status: accepted
Decision: Ship as an installable PWA (web manifest + icons + service worker) so the owner can add it to the phone home screen and open it like an app.
Trigger: user ask
Rationale + alternatives: Native app weighed — app-store overhead not justified for a 45-day challenge; PWA gives home-screen launch from the same static page.
Affects: Brainstorm-Brief · Architecture     Decided by: human · approved: y
Supersedes: —

## D-005 · brainstorm · 2026-11-16 · status: accepted
Decision: Progress counts DISTINCT workout days, not sessions. Multiple sessions on one day can all be logged (minutes and type stats include them) but the day counts once toward 30.
Trigger: user answer
Affects: Brainstorm-Brief · Eval-Spec (counting rule)     Decided by: human · approved: y
Supersedes: —

## D-006 · brainstorm · 2026-11-16 · status: accepted
Decision: Minimum duration to count — 30 min for a class / at the YMCA (incl. solo gym at the Y); 45 min for an at-home workout.
Trigger: user answer
Resolved: user corrected backfilled Nov 11 at-home yoga to 45 min — all 5 backfilled workouts qualify (5/30).
Affects: Brainstorm-Brief · Eval-Spec (counting rule)     Decided by: human · approved: y
Supersedes: —
