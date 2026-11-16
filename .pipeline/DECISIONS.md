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

## D-007 · brainstorm · 2026-11-16 · status: accepted
Decision: Under-minimum workouts are allowed and saved; their minutes count toward total-time stats but NOT the challenge. They render greyed out (calendar + log) as "not counted". A day counts if at least one workout that day meets its minimum; short sessions do NOT add up.
Trigger: user answer
Affects: Brainstorm-Brief · Eval-Spec (counting rule) · Prototype     Decided by: human · approved: y
Supersedes: —

## D-008 · brainstorm · 2026-11-16 · status: rejected
Decision: Extra per-workout fields (notes, effort 1–5, instructor) — NOT built. Entry = date, type, duration only, to keep logging fast.
Trigger: Claude recommendation
Affects: —     Decided by: human · approved: n/a
Supersedes: —

## D-009 · brainstorm · 2026-11-16 · status: accepted
Decision: Daily quote = mixed tone (motivational, playful, mindful); one quote per calendar day, same for every viewer.
Trigger: user answer (option d)
Affects: Brainstorm-Brief · Prototype     Decided by: human · approved: y
Supersedes: —

## D-010 · prototype · 2026-11-16 · status: accepted
Decision: Non-commercial personal tool — no monetization, pricing, or viability testing; stay on free tiers.
Trigger: user statement
Affects: Brainstorm-Brief (viable class N/A)     Decided by: human · approved: y
Supersedes: —

## D-011 · prototype · 2026-11-16 · status: accepted
Decision: Use the owner's Figma "Power Moves Design System" as the base (colour tokens, Inter + JetBrains Mono type, component shapes). Workout-type icons are CUSTOM ILLUSTRATIONS drawn in the Power Moves teal/coral palette (deliberate departure from Lucide stroke-only rule, scoped to workout-type icons; UI chrome icons stay Lucide-style stroke). Softer radii + friendly copy for "cute, encouraging".
Trigger: user ask + ruling (custom drawn, matched to colours)
Affects: Prototype     Decided by: human · approved: y
Supersedes: —

## D-012 · prototype · 2026-11-16 · status: applied
Decision: Page title "Dee's workout challenge" (owner's name visible to friends). Workout list (final): Gravity, TotalTone, Core & Stretch, Kettlebell, Yoga class, Gym time (all YMCA, 30 min) · Home yoga (home, 45 min) · Other (owner picks YMCA or home → that minimum). "Home workout" dropped; "Gym (solo)" renamed "Gym time".
Trigger: user answers
Affects: Prototype · Brainstorm-Brief (type table) · Eval-Spec (C-03 type mapping)     Decided by: human · approved: y
Supersedes: —

## D-013 · architecture · 2026-11-16 · status: accepted
Decision: Host on GitHub Pages from a PUBLIC repo. Code and workout data are publicly readable (data is public by design anyway); writes stay owner-only via Supabase RLS. Supabase anon key in the page is public-safe by design; service_role key must never be committed (G-05).
Trigger: user answer
Rationale + alternatives: Cloudflare Pages + private repo weighed; user chose simplicity. Owner must flip repo visibility to public (Claude cannot change visibility).
Affects: Architecture · Security-Baseline     Decided by: human · approved: y
Supersedes: —

## D-014 · prototype · 2026-11-16 · status: accepted
Decision: Style = Power Moves with a cute layer (tokens, Inter/JetBrains Mono, component shapes; softer radii, icons in pastel teal/coral bubbles, friendly copy, confetti at 30) + custom-drawn workout icons in the Power Moves palette. Refines D-011.
Trigger: user answer
Affects: Prototype     Decided by: human · approved: y
Supersedes: D-011 (style detail)

## D-015 · prototype · 2026-11-16 · status: accepted
Decision: Data is always live from Supabase: friends' open pages update in real time (Supabase Realtime subscription) when the owner logs. Prototype shows mock data only; no prototype/state-switcher controls in the UI.
Trigger: user feedback on prototype v1
Affects: Prototype · Eval-Spec (J-8 added) · Architecture     Decided by: human · approved: y
Supersedes: —

## D-016 · prototype · 2026-11-16 · status: accepted
Decision: Full workout list moves off the main page into a separate History page (#history); main page links to it. Owner edits/deletes from History. Owner sign-in is a small "Dee? Sign in" link in the header.
Trigger: user feedback on prototype v1
Affects: Prototype · Eval-Spec (J-1, J-4)     Decided by: human · approved: y
Supersedes: —
