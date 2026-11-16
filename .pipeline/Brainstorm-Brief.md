# Brainstorm Brief: 30-in-45 Workout Challenge Tracker
Date: 2026-11-16 | Type: pressure-test (gap-interview, trimmed L3 — D-001) | AI-native: no

## Goal & Metric
Objective: Help the owner finish a self-set challenge — **work out on 30 of the 45 days from Nov 9 to Dec 23, 2026** — with friends watching as light accountability.
Key Result: 30 counted workout days by Dec 23 (America/Toronto).
Driver KPIs: workout days completed · days remaining · required pace (workouts needed ÷ days left) vs. actual pace · current streak.
Why now: the challenge is already running (day 8 of 45 on 2026-11-16) — every day of build delay is a day without the tool. Speed beats polish.
Second-order: the public page makes progress visible to friends → accountability; a missed week becomes visible too (that's the point).

## Top-3 Components That Decide Success
1. **Logging friction** — if adding a workout takes more than ~10 seconds on the phone, logging lapses and the counter lies.
2. **Counting correctness** — the headline number (e.g. 25/38) must follow the rules exactly, or it loses trust.
3. **Shareability** — friends open one link, no account, and see everything; nobody but the owner can change anything.

## Prioritized Problem
THE problem: Mid-challenge, the owner can't see at a glance how far along they are and whether they are on pace — and friends can't see it at all.
Stakes if unsolved: drift — "I'll catch up next week" until the math no longer works.
Current alternative: mental tally / notes app; friends hear about it ad hoc.
Parked: social features (cheers/comments), reminders/notifications.

## User, Journey & JTBD
Who: the owner (single writer), plus a handful of friends (readers, no accounts).
Job: When I finish a class at the Central YMCA Toronto or a workout at home, I want to log it in seconds, so I can see my challenge count move and know whether I'm on pace.
Journey: leave class → open home-screen app (PWA, D-004) → tap type → confirm duration → see count update. Friends: open shared link any time → see count, calendar, stats, log.
Painpoint: phone sign-in must not need repeating; home-screen PWAs on iOS don't share Safari's login, so emailed magic links are a trap → prefer an in-app 6-digit email code (to confirm at architecture-checkpoint).

## Counting Rules (locked — D-002, D-005, D-006, D-007)
- Every workout type counts: YMCA classes, solo gym at the Y, at-home workouts.
- Minimum duration: **30 min** for a class / at the YMCA; **45 min** at home.
- Under-minimum workouts are saved, add to total minutes, but **do not count**; shown **greyed out** on the calendar and in the log.
- The challenge counts **distinct days**: a day counts if ≥1 workout that day meets its minimum. Short sessions do not add up. Two qualifying sessions on one day = 1.
- Headline: `remaining workouts / remaining days`, remaining days **include today** (Nov 16 → 38). Ends Dec 23.

## Riskiest Assumption
Owner will keep logging for 38 more days (consistency of capture).
Class: usable · Runners-up: feasible — persistent owner login inside an iOS home-screen PWA (moderate uncertainty, high impact on friction).
Test instrument: founder-as-user prototype click-through: log a workout from the phone in ≤3 taps after the type is chosen.

## MVP (Must-Have)
- [ ] Headline progress `X/Y` (to-go / days left) + done count — freq: every visit
- [ ] Quick-log form: date (default today), type (icon buttons), duration (preset + custom) — freq: ~daily
- [ ] 45-day calendar grid: counted days filled with type icon, greyed non-counted, today marked, future days empty — every visit
- [ ] Stats: total minutes, current & longest streak, pace needed vs actual, breakdown by type, avg session length — every visit
- [ ] Daily quote — encouraging, action-oriented (no mindfulness/rest framing — D-017), same quote for everyone that day — daily
- [ ] History page: all workouts newest first; owner can edit/delete there (D-016) — on demand
- [ ] Live updates: open pages refresh when the owner logs (D-015) — every log
- [ ] Public read, owner-only write (Supabase RLS) — always
- [ ] Installable PWA (manifest, icon, offline shell) — once
- [ ] Backfill 5 workouts (see Seed Data) — one-time → a seed script, not a feature
- [ ] Finish celebration at 30 — once

## Workout Types (initial)
| Type | Where | Min |
|---|---|---|
| Gravity | YMCA | 30 |
| TotalTone | YMCA | 30 |
| Core & Stretch | YMCA | 30 |
| Kettlebell | YMCA | 30 |
| Yoga class | YMCA | 30 |
| Gym time | YMCA | 30 |
| Home yoga | Home | 45 |
| Other | owner picks YMCA or home | 30 / 45 |

## Seed Data (backfill — corrected per D-006 resolution)
| Date | Type | Min | Counts |
|---|---|---|---|
| Nov 9 | Gravity | 30 | ✓ |
| Nov 11 | Home yoga | 45 | ✓ |
| Nov 13 | Core & Stretch | 30 | ✓ |
| Nov 14 | TotalTone | 30 | ✓ |
| Nov 15 | Home yoga | 45 | ✓ |
→ 5 done; on 2026-11-16 the headline reads **25 / 38**.

## Roadmap (Post-MVP)
### Phase 2 — Nudges | Ships: optional evening reminder if no workout logged and pace slipping | Trigger: owner misses 3+ days in a row
### Phase 3 — Next challenge | Ships: configurable challenge (goal/days/start) to reuse after Dec 23 | Trigger: owner wants another round

## Cut (Won't build)
- Notes / effort / instructor per entry (D-008) — slows logging.
- Friend accounts, comments, cheers — not asked; reads need no login.
- Native app — PWA covers home-screen use (D-004).

## GTM & Positioning
Audience: the owner's friends, via a shared link (text / social).
Positioning: "Follow my 30-in-45 — see every workout as it happens."
Voice: cheerful, cute, encouraging. Key message: *on track, keep going.*

## Parking Lot
- Custom new workout types from the app (vs. editing the type list in code) — decide at prototype.

## → Next: handed to loop-orchestrator
Counting rules + MVP + types feed eval-spec (lite), then prototype + triad approval.
