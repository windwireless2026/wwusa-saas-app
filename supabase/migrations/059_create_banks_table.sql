-- Create Banks table for dynamic routing lookup
create table if not exists public.banks (
    id uuid default gen_random_uuid() primary key,
    routing_number text not null unique,
    name text not null,
    country text not null default 'US',
    swift_code text,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    deleted_at timestamptz -- Soft delete support
);

-- Enable RLS
alter table public.banks enable row level security;

-- Policy: Anyone can read active banks (or simplify for dev)
create policy "Enable read for all authenticated users" on public.banks
    for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.banks
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.banks
    for update using (auth.role() = 'authenticated');

-- Trigger for updated_at
create trigger update_banks_modtime
    before update on public.banks
    for each row execute function update_updated_at_column();

-- Seed some common banks from our existing list
insert into public.banks (routing_number, name) values
('021000021', 'JPMorgan Chase'),
('026009593', 'Bank of America'),
('121042882', 'Wells Fargo'),
('125000105', 'U.S. Bank National Association'),
('021000089', 'Citibank'),
('053101121', 'Truist Bank'),
('031201360', 'PNC Bank'),
('011103093', 'TD Bank'),
('054001204', 'Capital One'),
('062000019', 'Regions Bank'),
('267090594', 'BankUnited, N.A.'),
('063092110', 'Everbank (FL)')
on conflict (routing_number) do nothing;
