-- TEMPORARY DEV FIX: Relaxing RLS Policies for easier testing without full auth flow
-- Allow unrestricted access to inventory and product_catalog for development

-- 1. Inventory Table
drop policy if exists "Enable read access for all users" on public.inventory;
drop policy if exists "Admins e Managers gerenciam inventory" on public.inventory;
drop policy if exists "Estoque visivel publicamente" on public.inventory;

create policy "DEV_FULL_ACCESS_INVENTORY"
on public.inventory
for all
using (true)
with check (true);

-- 2. Product Catalog
drop policy if exists "Todos veem catalogo" on public.product_catalog;
drop policy if exists "Admins gerenciam catalogo" on public.product_catalog;
drop policy if exists "Logados criam modelos" on public.product_catalog;

create policy "DEV_FULL_ACCESS_CATALOG"
on public.product_catalog
for all
using (true)
with check (true);
