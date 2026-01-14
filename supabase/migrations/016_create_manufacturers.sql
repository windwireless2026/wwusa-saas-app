-- Create manufacturers table
create table if not exists public.manufacturers (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    logo_url text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.manufacturers enable row level security;

-- Policy for viewing (anyone authenticated)
create policy "Allow authenticated to view manufacturers"
on public.manufacturers for select
to authenticated
using (true);

-- Policy for managing (anyone authenticated for now, should be admin later)
create policy "Allow authenticated to manage manufacturers"
on public.manufacturers for all
to authenticated
using (true);

-- Populate with initial standardized list
insert into public.manufacturers (name, logo_url, website)
values 
('Apple', '/images/icon/apple.png', 'https://www.apple.com'),
('Samsung', '/images/icon/samsung.png', 'https://www.samsung.com'),
('Google', 'https://logo.clearbit.com/google.com', 'https://www.google.com'),
('Motorola', 'https://logo.clearbit.com/motorola.com', 'https://www.motorola.com'),
('OnePlus', 'https://logo.clearbit.com/oneplus.com', 'https://www.oneplus.com'),
('Xiaomi', 'https://logo.clearbit.com/xiaomi.com', 'https://www.mi.com'),
('TCL', 'https://logo.clearbit.com/tcl.com', 'https://www.tcl.com'),
('Nokia (HMD)', 'https://logo.clearbit.com/nokia.com', 'https://www.nokia.com'),
('Sony', 'https://logo.clearbit.com/sony.com', 'https://www.sony.com'),
('ASUS', 'https://logo.clearbit.com/asus.com', 'https://www.asus.com'),
('Nothing', 'https://logo.clearbit.com/nothing.tech', 'https://www.nothing.tech'),
('BLU', 'https://logo.clearbit.com/bluproducts.com', 'https://www.bluproducts.com'),
('CAT', 'https://logo.clearbit.com/catphones.com', 'https://www.catphones.com'),
('Kyocera', 'https://logo.clearbit.com/kyoceramobile.com', 'https://www.kyoceramobile.com'),
('Sonim', 'https://logo.clearbit.com/sonimtech.com', 'https://www.sonimtech.com'),
('ZTE', 'https://logo.clearbit.com/zteusa.com', 'https://www.zteusa.com'),
('T-Mobile (REVVL)', 'https://logo.clearbit.com/t-mobile.com', 'https://www.t-mobile.com'),
('AT&T (Radiant/Calypso)', 'https://logo.clearbit.com/att.com', 'https://www.att.com'),
('Verizon (Orbic)', 'https://logo.clearbit.com/verizon.com', 'https://www.verizon.com')
on conflict (name) do nothing;
