# Architecture: Dee's workout challenge
Depth: standard internal tool (single owner, ~10 readers, 45-day life, $0). Not AI-native → no eval service / token model.

## Constraint Alignment
- **Primary constraint: time-to-launch.** The challenge is already running (day 8/45). → No framework, no build step, no server code: static files + a managed backend.
- **Cost: $0, non-commercial (D-010).** → GitHub Pages (public repo, D-013) + Supabase free tier.
- **One writer, public readers (D-002).** → Postgres RLS does the access control; no API server to secure.
- **Phone-first, installable (D-004).** → PWA: manifest + service worker caching only the app shell.
- **Regulatory:** none. Only PII is the owner's email, held by Supabase Auth, never in the repo (D-018).

## Components
```
 Phone (owner, PWA)        Friends' browsers
        │  supabase-js (vendored, pinned)  │
        ▼                             ▼
 GitHub Pages ── static: index.html, app.js, rules.js, sw.js, manifest, icons
        │
        ▼  HTTPS (anon key = public by design)
 Supabase project "workout-challenge" (region ca-central-1, free)
   ├─ Auth: email OTP (6-digit code), sign-ups disabled after owner account exists
   ├─ Postgres: public.workouts + RLS
   └─ Realtime: postgres_changes on workouts → live updates (D-015)
 GitHub Actions: weekly keep-alive read (D-019) · CI tests on push
```

## Code layout (no build step)
| File | Role |
|---|---|
| `src/rules.js` | **Pure** functions: qualifies, compute (count, days-left, streaks, pace, by-type), Toronto date helpers, quote-of-day. All C-* tests target this. |
| `vendor/supabase.js` | supabase-js browser bundle, exact version, copied from npm (D-026). |
| `src/config.js` | Challenge constants, workout types, Supabase URL + anon key (public). |
| `src/data.js` | Supabase calls: list, insert, update, delete, subscribe; localStorage last-known cache. |
| `src/auth.js` | OTP request/verify, session, sign-out. |
| `src/ui.js` | Render home / history / sheets (ported from approved prototype v4). |
| `index.html`, `styles.css`, `manifest.webmanifest`, `sw.js`, `icons/` | Shell + PWA. |
| `db/migrations/001_workouts.sql` | Schema + RLS + realtime publication. |
| `tests/*.test.js` | `node --test` (zero dependencies). |

## Data Layer
```sql
create table public.workouts (
  id         uuid primary key,                 -- generated client-side → idempotent retries
  owner_id   uuid not null default auth.uid() references auth.users(id),
  day        date not null check (day between '2026-11-09' and '2026-12-23'),
  type       text not null check (type in ('gravity','totaltone','core','kettle','yoga','gym','homeyoga','other')),
  location   text not null check (location in ('ymca','home')),
  minutes    int  not null check (minutes between 1 and 600),
  created_at timestamptz not null default now()
);
```
- `location` is stored (derived from type, chosen for "Other") so the minimum rule never depends on code that might change.
- `day` is a calendar date picked in America/Toronto on the client — no timestamps in counting logic (kills the timezone failure class).
- Counting is computed client-side from all rows (≤ ~100). No views/functions to keep in sync; logic is unit-tested in one place.
- **RLS:** `select` for `anon, authenticated` using `true`. `insert/update/delete` for `authenticated` only where `auth.uid() = <OWNER_UUID>` (UUID literal set in migration 002 after the owner's first sign-in; a UUID is not a secret). Defence in depth with sign-ups disabled (D-018).
- Consistency: immediate (single Postgres). Realtime fan-out is best-effort; clients also refetch on focus.

## Scalability
Read-heavy (friends) ~10 viewers, writes ~1/day. Free tier limits (500 MB DB, 200 concurrent realtime connections, 2 GB egress) are 3+ orders of magnitude away. Bottleneck if ever: realtime connection cap → fallback to polling. No re-architecture expected within the 45-day life.

## Failure Modes
| Failure | Behaviour |
|---|---|
| Supabase unreachable / paused | Render last-known data from localStorage with an "offline / can't reach the server" banner; logging disabled with a clear message. Keep-alive (D-019) prevents pausing. |
| Insert fails mid-flight | Sheet stays open with the entry and an error; retry re-sends the same client UUID → `upsert` on `id` is idempotent, no duplicates. |
| Realtime socket drops | supabase-js reconnects; plus refetch on `visibilitychange` and every 60 s while visible. |
| OTP email slow/not delivered | "Resend code" after 60 s; message explains checking spam. Built-in SMTP rate limit (few emails/hour) is acceptable for one user (assumption A-1). |
| Session expired in PWA | Refresh token auto-renews; if lost, header shows "Sign in" again. Friends unaffected. |
| Bad date/duration input | DB check constraints reject; form validates first with plain-language errors. |
| Service worker serves stale code | Network-first for `index.html`, versioned cache name per release, `skipWaiting` + reload prompt. Data is never cached by the SW (P-02). |

## Observability
Proportionate to a 45-day personal tool: Supabase dashboard logs (auth, API, realtime); GitHub Actions emails on keep-alive or CI failure; client `console.error` + visible error states. No analytics.

## Cost
GitHub Pages $0 · Supabase free $0 · Actions minutes (weekly curl + CI) well under free quota → **$0/mo**. At 10× readers still $0. No scaling cliff in scope.

## Alternatives Considered
1. **Claude artifact with built-in shared DB** — fastest, but friends may need claude.ai access and the user asked for Supabase + own repo. Rejected.
2. **React/Vite SPA** — nicer components, but adds a build/deploy pipeline for ~600 lines of UI. Rejected for time-to-launch; vanilla ES modules port the approved prototype directly.
3. **Google Sheet as backend** — no auth model for owner-only writes from a public page. Rejected.
4. **Supabase Edge Function API in front of the table** — extra moving part; RLS already enforces the only rule. Rejected.
5. **Magic-link sign-in** — opens Safari, not the home-screen PWA (separate storage on iOS). Rejected for 6-digit OTP.

## Open Assumptions
- [ ] A-1: Supabase built-in email delivers OTP codes to the owner's address (project-owner email) within the free rate limit. *If wrong:* configure free custom SMTP (e.g. Resend) — deploy-gate item.
- [ ] A-2: The OTP email template must include `{{ .Token }}`. *If wrong:* users get a link instead of a code → edit template in dashboard (deploy-gate step).
- [ ] A-3: iOS keeps home-screen PWA localStorage (session) between opens. *If wrong:* owner re-enters a code occasionally; low impact.
- [ ] A-4: Owner flips the repo to public before Pages is enabled (D-013). *If not:* Pages unavailable on free plan.
- [ ] A-5: Supabase free plan allows a new active project in ca-central-1 (both existing projects are paused). *If wrong:* fall back to us-east-1.
