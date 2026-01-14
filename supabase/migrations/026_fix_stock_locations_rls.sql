-- Drop old policy
drop policy if exists "Admins/Managers manage stock locations" on public.stock_locations;

-- Re-create with explicit WITH CHECK and qualified column names
create policy "Admins/Managers manage stock locations" on public.stock_locations
  for all 
  using (
    auth.role() = 'authenticated' AND
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'stock_manager')
    )
  )
  with check (
    auth.role() = 'authenticated' AND
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'stock_manager')
    )
  );
