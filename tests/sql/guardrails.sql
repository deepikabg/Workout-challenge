-- S-002 guardrails (Eval-Spec G-01, G-02, C-06). Run via the Supabase connector (execute_sql).
-- Raises an exception on the first failure; returns one row 'PASS' otherwise. Runs in a transaction and leaves nothing behind.
do $$
declare n int; rls boolean;
begin
  -- RLS must be on
  select relrowsecurity into rls from pg_class where oid = 'public.workouts'::regclass;
  if not rls then raise exception 'FAIL: RLS disabled on workouts'; end if;

  -- C-06 backstop: out-of-window date rejected by a check constraint
  begin
    insert into public.workouts(id, owner_id, day, type, location, minutes)
      values (gen_random_uuid(), gen_random_uuid(), '2026-12-24', 'gym', 'ymca', 30);
    raise exception 'FAIL C-06: out-of-window day accepted';
  exception when check_violation then null; end;
  begin
    insert into public.workouts(id, owner_id, day, type, location, minutes)
      values (gen_random_uuid(), gen_random_uuid(), '2026-11-16', 'gym', 'ymca', 0);
    raise exception 'FAIL: 0 minutes accepted';
  exception when check_violation then null; end;
  begin
    insert into public.workouts(id, owner_id, day, type, location, minutes)
      values (gen_random_uuid(), gen_random_uuid(), '2026-11-16', 'pilates', 'ymca', 30);
    raise exception 'FAIL: unknown type accepted';
  exception when check_violation then null; end;

  -- G-01 / G-02: act as the public (anon) role
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform count(*) from public.workouts;            -- anon can read
  begin
    insert into public.workouts(id, day, type, location, minutes)
      values (gen_random_uuid(), '2026-11-16', 'gym', 'ymca', 30);
    raise exception 'FAIL G-01: anon insert succeeded';
  exception when insufficient_privilege or not_null_violation then null; end;
  update public.workouts set minutes = 999; get diagnostics n = row_count;
  if n > 0 then raise exception 'FAIL G-02: anon updated % rows', n; end if;
  delete from public.workouts; get diagnostics n = row_count;
  if n > 0 then raise exception 'FAIL G-02: anon deleted % rows', n; end if;
end $$;
select 'PASS' as guardrails;
