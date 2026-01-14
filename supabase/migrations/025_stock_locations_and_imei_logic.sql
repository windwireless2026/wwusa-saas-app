-- 1. Create stock_locations table
create table public.stock_locations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- 2. Add location_id to inventory
alter table public.inventory add column location_id uuid references public.stock_locations(id);

-- 3. Drop existing unique constraint on imei to allow RMA re-entry
-- First find the constraint name. It's usually 'inventory_imei_key'
alter table public.inventory drop constraint if exists inventory_imei_key;

-- 4. Enable RLS for stock_locations
alter table public.stock_locations enable row level security;

create policy "Admins/Managers manage stock locations" on public.stock_locations
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and role in ('super_admin', 'stock_manager')
    )
  );

create policy "All authenticated users view stock locations" on public.stock_locations
  for select using (auth.role() = 'authenticated');
