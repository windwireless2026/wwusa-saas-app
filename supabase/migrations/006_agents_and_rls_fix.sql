-- 1. FIX RLS (CRITICAL HOTFIX)
-- Ensure Inventory is writable
alter table public.inventory enable row level security;
drop policy if exists "Enable all for dev inventory" on public.inventory;
create policy "Enable all for dev inventory" on public.inventory for all using (true) with check (true);

drop policy if exists "Enable all for dev product_catalog" on public.product_catalog;
create policy "Enable all for dev product_catalog" on public.product_catalog for all using (true) with check (true);


-- 2. CREATE AGENTS TABLE (Unified Entities)
-- We will use text arrays for roles to allow flexibility (e.g., Supplier + Service Provider)
create table if not exists public.agents (
    id uuid default gen_random_uuid() primary key,
    name text not null, -- Short Name / Alias
    legal_name text, -- Full Legal Name / Razão Social
    code text, -- Internal Code (optional)
    
    country text not null check (country in ('BR', 'US', 'CN', 'PY')), -- Added CN/PY for future, limiting to BR/US for now in UI
    roles text[] not null default '{}', -- ['supplier', 'customer', 'service_provider', 'employee']
    
    -- Identification
    tax_id text, -- CNPJ (BR) or EIN (US)
    state_registration text, -- Inscrição Estadual (BR)
    municipal_registration text, -- Inscrição Municipal (BR)
    
    -- US Specific
    resale_certificate text, -- For US Customers
    
    -- Contact
    email text,
    phone text,
    website text,
    
    -- Address
    address_line1 text,
    address_line2 text,
    address_city text,
    address_state text, -- State Code (FL, SP, etc)
    address_zip text,
    address_country text,
    
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- RLS for Agents
alter table public.agents enable row level security;
drop policy if exists "Enable all for dev agents" on public.agents;
create policy "Enable all for dev agents" on public.agents for all using (true) with check (true);


-- 3. MIGRATE EXISTING SUPPLIERS
-- Move data from 'suppliers' table to 'agents'
do $$
begin
    -- Simple migration: map suppliers to agents
    insert into public.agents (name, email, roles, country)
    select name, contact_info, ARRAY['supplier'], 'US'
    from public.suppliers
    where not exists (select 1 from public.agents where name = public.suppliers.name);
exception when others then
    raise notice 'Migration from suppliers skipped or already done: %', SQLERRM;
end $$;


-- 4. UPDATE INVENTORY CONNECTION
alter table public.inventory add column if not exists agent_id uuid references public.agents(id);

-- Try to link existing inventory to new agents based on name match (via old supplier_id)
update public.inventory 
set agent_id = a.id
from public.agents a, public.suppliers s
where public.inventory.supplier_id = s.id 
and s.name = a.name;

-- Note: We are NOT dropping supplier_id yet to prevent data loss if migration fails.
-- Can be dropped in future cleanup.
