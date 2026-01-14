-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & ROLES (Hierarchical Login)
-- Link to Supabase Auth
create type user_role as enum ('super_admin', 'stock_manager', 'finance_manager', 'client', 'partner');

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role user_role default 'client',
  full_name text,
  company_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on Signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. INVENTORY (Controle de Estoque)
create table public.inventory (
  id uuid default uuid_generate_v4() primary key,
  model text not null, -- e.g. "iPhone 14 Pro Max"
  capacity text not null, -- e.g. "256GB"
  color text not null,
  grade text not null check (grade in ('A', 'B', 'C', 'Open Box')),
  price decimal(10,2) not null,
  status text not null default 'Available' check (status in ('Available', 'Reserved', 'Sold', 'RMA')),
  imei text unique, -- Optional for bulk listing, mandatory for final sale
  battery_health integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Inventory
alter table public.inventory enable row level security;

-- Admins and Stock Managers can do everything
create policy "Admins/Managers manage inventory" on public.inventory
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and role in ('super_admin', 'stock_manager')
    )
  );

-- Clients/Partners can view Available items ONLY
create policy "Clients view available inventory" on public.inventory
  for select using (
    status = 'Available'
  );


-- 3. CUSTOMERS (Extensions for CRM)
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id), -- Optional link if they have login
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  city text,
  state text, -- "FL", "SP", etc.
  country text default 'Brazil',
  resale_certificate_number text, -- For US taxes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS / INVOICES
create type order_status as enum ('draft', 'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) not null,
  status order_status default 'draft',
  total_amount decimal(10,2) not null default 0,
  invoice_number serial, -- Simple auto-increment for human readable refs
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  inventory_id uuid references public.inventory(id), -- Specific item link
  model_snapshot text, -- Keep name in history even if inventory deleted
  price_snapshot decimal(10,2) not null,
  quantity integer default 1
);

-- STORAGE BUCKETS (If needed later for images)
-- insert into storage.buckets (id, name) values ('inventory-images', 'inventory-images');
