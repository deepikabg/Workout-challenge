# Decision Ledger (append-only)

## D-001 · routing · 2026-11-16 · status: accepted
Decision: Classify Level 3 (greenfield + data store + auth) but run trimmed: skip market-scan; prototype validation is founder-as-user only; eval-spec lite.
Trigger: Claude recommendation — personal 45-day tool, challenge already running, speed matters.
Rationale + alternatives: Full ceremony weighed; market research cannot change a personal tracker's design.
Affects: —     Decided by: claude (recommended; user proceeded without objection) · approved: implicit
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
