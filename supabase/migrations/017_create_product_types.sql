-- Create product_types table
create table if not exists public.product_types (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    tracking_method text not null default 'Serial Number', -- 'IMEI', 'Serial Number', 'None'
    icon text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create join table for Manufacturer <-> Product Type
create table if not exists public.manufacturer_product_types (
    manufacturer_id uuid references public.manufacturers(id) on delete cascade,
    product_type_id uuid references public.product_types(id) on delete cascade,
    primary key (manufacturer_id, product_type_id)
);

-- Enable RLS
alter table public.product_types enable row level security;
alter table public.manufacturer_product_types enable row level security;

-- Policies
create policy "Allow authenticated to view product_types" on public.product_types for select to authenticated using (true);
create policy "Allow authenticated to manage product_types" on public.product_types for all to authenticated using (true);

create policy "Allow authenticated to view manufacturer_product_types" on public.manufacturer_product_types for select to authenticated using (true);
create policy "Allow authenticated to manage manufacturer_product_types" on public.manufacturer_product_types for all to authenticated using (true);

-- Populate initial product types
insert into public.product_types (name, tracking_method, icon)
values 
('Celular', 'IMEI', '📱'),
('Fone', 'Serial Number', '🎧'),
('Computador', 'Serial Number', '💻'),
('Tablet', 'IMEI/Serial', '📟'),
('Relogio', 'Serial Number', '⌚')
on conflict (name) do nothing;
