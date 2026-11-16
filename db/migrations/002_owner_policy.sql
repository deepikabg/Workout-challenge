-- 002: only the owner (auth id below — not a secret) may add, change or remove workouts. D-018, D-029.
create policy "owner can insert" on public.workouts
  for insert to authenticated
  with check (auth.uid() = '7bcf9a92-b2ba-4992-9b33-a1313a70e446'::uuid and owner_id = auth.uid());

create policy "owner can update" on public.workouts
  for update to authenticated
  using (auth.uid() = '7bcf9a92-b2ba-4992-9b33-a1313a70e446'::uuid)
  with check (auth.uid() = '7bcf9a92-b2ba-4992-9b33-a1313a70e446'::uuid and owner_id = auth.uid());

create policy "owner can delete" on public.workouts
  for delete to authenticated
  using (auth.uid() = '7bcf9a92-b2ba-4992-9b33-a1313a70e446'::uuid);

grant select, insert, update, delete on public.workouts to authenticated;
