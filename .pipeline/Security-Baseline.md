# Security Baseline: Dee's workout challenge
Scale: public-facing static site + auth, minimal PII. Not AI-native (dimension 6 N/A — no model in the system).

## Threat model
- **Assets:** integrity of the workout log (the public count), the owner's account/session, the owner's email (only PII).
- **Attackers & surface:** anonymous visitors (public page + public anon key + PostgREST/Realtime endpoints), anyone reading the public repo, someone requesting OTP codes, a compromised CDN script.
- **Trust boundaries:** browser → Supabase (all input untrusted; RLS + check constraints are the enforcement point); GitHub Actions → Supabase (keep-alive, read-only).

## 1. Secrets
| Item | Secret? | Where |
|---|---|---|
| Supabase URL, anon (publishable) key | No — public by design; useless without RLS permission | `src/config.js` (committed) |
| `service_role` key, DB password, JWT secret | **Yes** | Never in repo, never in the client, never in Actions. Not needed by any component. |
| Owner auth UUID | No | migration `002_owner_policy.sql` |
| Owner email | PII | Supabase Auth only; not committed (D-018) |
- Pre-commit/CI check: grep for `service_role`, `eyJ` JWTs other than the anon key, `.env` files → fail (G-05). `.env*` gitignored.
- Rotation: if the service_role key ever leaks, rotate from the Supabase dashboard (deploy-gate runbook).

## 2. Encryption
- In transit: HTTPS only (GitHub Pages enforced HTTPS; Supabase TLS). Realtime over WSS.
- At rest: Supabase-managed disk encryption. Workout rows are non-sensitive public data by design. The email lives in Supabase Auth (managed). No app-level field encryption needed — documented as out of scope.

## 3. AuthN / AuthZ
- **AuthN:** Supabase email OTP (6-digit), `shouldCreateUser:false`; **sign-ups disabled** in Auth settings after the owner account exists (G-04).
- **Session:** supabase-js refresh token in localStorage; **client-enforced 48 h inactivity sign-out (D-022)**. Accepted risk: a client-side timeout can be bypassed by someone who already holds the device + token; acceptable for a personal tracker (server-side inactivity timeouts are a paid feature).
- **AuthZ (default-deny, in the DB):** RLS enabled on `workouts`; `select` → `anon, authenticated` (public by design); `insert/update/delete` → `authenticated` with `using/with check (auth.uid() = '<OWNER_UUID>')`. No policy for any other role/action → denied. `owner_id` defaults to `auth.uid()` and `with check` blocks spoofing.
- Object-level: single owner → every write row must belong to the owner UUID; nobody else has write rows to reach.
- **Error handling:** UI maps errors to generic copy (Contract.md); sign-in failure for a non-owner email shows "This email can't sign in here" — reveals that it is not the owner's email, which is acceptable (the owner is public: "Dee").
- **Rate limits:** Supabase Auth built-in OTP rate limits (per email/IP). DB writes only possible for the owner.
- **XSS:** the UI renders only owner-entered enums/numbers/dates from the DB; all dynamic strings go through an `escapeHtml` helper; no `innerHTML` of free text (there are no free-text fields, D-008).

## 4. Compliance
None in scope: non-commercial personal tool, one user's own data, no payments, no health records beyond self-reported workout durations made public by the owner's choice. Retention: delete the Supabase project after the challenge if desired (owner action).

## 5. Dependencies
- Runtime: `@supabase/supabase-js` v2 only, **vendored** into `vendor/` from npm at an exact version ≥2 weeks old (D-026); `npm audit` on that version at deploy-gate.
- Dev: none (tests use `node --test`, zero npm deps). Fonts: Google Fonts CSS.
- Update strategy: pin for the 45-day life; bump only for a security advisory.

## 6. Keep-alive job (D-019)
GitHub Actions weekly: `curl` a single anon `select id limit 1`. Uses only the public anon key (stored as a repo variable for tidiness). Read-only; cannot write.

## Guardrail tests (from Eval-Spec, must pass before deploy)
G-01 anon insert rejected · G-02 anon update/delete rejected · G-03 non-owner authenticated write rejected · G-04 stranger cannot get a session · G-05 no secrets in built site · C-14 48 h inactivity sign-out.

## Accepted risks
- R-1: Client-side inactivity timeout (see §3).
- R-2: Public repo exposes code + project URL (D-013); mitigated by RLS default-deny.
- ~~R-3: CDN-loaded supabase-js~~ — closed by D-026 (vendored). Google Fonts CSS remains a third-party load (styling only).
