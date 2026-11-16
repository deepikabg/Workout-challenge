# Data Contract: workouts (Supabase PostgREST + Auth + Realtime)
Scale: prototype/internal — one first-party consumer (this web app), shipped together. No custom endpoints. Version: v1 = migration `001_workouts.sql`; any column change is a new numbered migration (additive only during the challenge).

## Resource: `workouts` row
| Field | Type | Rules |
|---|---|---|
| `id` | uuid | client-generated (`crypto.randomUUID()`); idempotency key for create |
| `owner_id` | uuid | defaulted to `auth.uid()`; never sent by client |
| `day` | date `YYYY-MM-DD` | 2026-11-09 … 2026-12-23; chosen in America/Toronto |
| `type` | enum | `gravity, totaltone, core, kettle, yoga, gym, homeyoga, other` |
| `location` | enum | `ymca, home` (fixed by type; chosen only for `other`) |
| `minutes` | int | 1–600 |
| `created_at` | timestamptz | server default |

## Operations (supabase-js v2)
| Op | Call | Role | Notes |
|---|---|---|---|
| List all | `from('workouts').select('id,day,type,location,minutes,created_at').order('day',{ascending:false})` | anon, owner | Whole set (≤ ~100 rows); no pagination needed — capped by date range × realistic sessions. Recorded so a list >500 rows is treated as a bug. |
| Create | `from('workouts').upsert(row,{onConflict:'id',ignoreDuplicates:true})` | owner | Retry with the same `id` never duplicates. |
| Update | `from('workouts').update({day,type,location,minutes}).eq('id',id)` | owner | |
| Delete | `from('workouts').delete().eq('id',id)` | owner | UI confirms in-page (tap twice). |
| Live | `channel('workouts').on('postgres_changes',{event:'*',schema:'public',table:'workouts'},refetch)` | anon, owner | On any event → refetch list (simple, consistent). |
| Sign in | `auth.signInWithPassword({email,password})` | anyone | Only the existing owner account can succeed; no sign-up call exists in the client (D-029). |
| Sign out | `auth.signOut()` | owner | |

## Error taxonomy → UI copy
| Code (client-mapped) | Source | Message shown |
|---|---|---|
| `NETWORK` | fetch failure / offline | "Can't reach the server. Showing your last saved progress." |
| `NOT_ALLOWED` | PostgREST 401/403, RLS 42501 | "Only Dee can log workouts. Sign in to make changes." |
| `INVALID_INPUT` | Postgres 23514 check violation | "That date or duration isn't valid for the challenge (Nov 9 – Dec 23, 1–600 min)." |
| `BAD_CREDENTIALS` | signInWithPassword 400 invalid_credentials | "That email and password don't match. Try again." |
| `RATE_LIMIT` | auth 429 | "Too many tries. Wait a minute, then try again." |
| `UNKNOWN` | anything else | "Something went wrong. Try again in a moment." (+ console detail) |

## Scenarios
1. Friend loads page (anon) → list 200, rows render; no write controls.
2. Owner logs Kettlebell 45 → upsert 201 → realtime event → all open pages refetch.
3. Owner retries same save after timeout → same `id` → no duplicate row.
4. Anon tries insert via devtools → 401/42501 → `NOT_ALLOWED` (G-01).
5. Owner logs day 2026-12-24 → 23514 → `INVALID_INPUT` (C-06 backstop).
6. Stranger tries to sign in with their email → `BAD_CREDENTIALS` (same message as a wrong password — no account enumeration); sign-ups disabled so no account can be created (G-04).
7. Owner mistypes password → `BAD_CREDENTIALS`; many fast attempts → `RATE_LIMIT`.
8. Supabase unreachable → `NETWORK` banner + cached data.

## Backwards-compatibility promise
Single consumer shipped from the same repo; columns are only added, never renamed, until Dec 23.
