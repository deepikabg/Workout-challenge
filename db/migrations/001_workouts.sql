-- 001: workouts table, public read, no writes yet (owner policy arrives in 002 once the owner's auth id exists).
-- Architecture.md → Data Layer; Contract.md; Security-Baseline §3.
create table if not exists public.workouts (
  id         uuid primary key,
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null check (day between date '2026-11-09' and date '2026-12-23'),
  type       text not null check (type in ('gravity','totaltone','core','kettle','yoga','gym','homeyoga','other')),
  location   text not null check (location in ('ymca','home')),
  minutes    int  not null check (minutes between 1 and 600),
  created_at timestamptz not null default now()
);
create index if not exists workouts_day_idx on public.workouts (day);

alter table public.workouts enable row level security;

-- Anyone may read (friends, no login). Writes: none until 002.
drop policy if exists "workouts are public to read" on public.workouts;
create policy "workouts are public to read" on public.workouts
  for select to anon, authenticated using (true);

-- Least privilege at the grant level too: anon can only select.
revoke insert, update, delete, truncate on public.workouts from anon;

-- Live updates (D-015). Run once on a fresh project.
alter publication supabase_realtime add table public.workouts;
