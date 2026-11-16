-- 003: the five workouts logged before the app existed (Brief → Seed Data). Safe to re-run.
insert into public.workouts (id, owner_id, day, type, location, minutes) values
  ('0b5e0000-0000-4000-8000-000000000001', '7bcf9a92-b2ba-4992-9b33-a1313a70e446', '2026-11-09', 'gravity',   'ymca', 30),
  ('0b5e0000-0000-4000-8000-000000000002', '7bcf9a92-b2ba-4992-9b33-a1313a70e446', '2026-11-11', 'homeyoga',  'home', 45),
  ('0b5e0000-0000-4000-8000-000000000003', '7bcf9a92-b2ba-4992-9b33-a1313a70e446', '2026-11-13', 'core',      'ymca', 30),
  ('0b5e0000-0000-4000-8000-000000000004', '7bcf9a92-b2ba-4992-9b33-a1313a70e446', '2026-11-14', 'totaltone', 'ymca', 30),
  ('0b5e0000-0000-4000-8000-000000000005', '7bcf9a92-b2ba-4992-9b33-a1313a70e446', '2026-11-15', 'homeyoga',  'home', 45)
on conflict (id) do nothing;
