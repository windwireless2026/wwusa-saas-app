-- REMOVE TODAS AS POLÍTICAS ANTIGAS PARA NÃO DAR ERRO DE DUPLICIDADE
-- 1. Product Types
drop policy if exists "product_types_auth_all" on public.product_types;
drop policy if exists "product_types_anon_view" on public.product_types;
drop policy if exists "Allow authenticated to view product_types" on public.product_types;
drop policy if exists "Allow authenticated to manage product_types" on public.product_types;
drop policy if exists "Enable all for authenticated users" on public.product_types;
drop policy if exists "Allow anon to view product_types" on public.product_types;

-- 2. Manufacturers
drop policy if exists "manufacturers_auth_all" on public.manufacturers;
drop policy if exists "manufacturers_anon_view" on public.manufacturers;
drop policy if exists "Allow authenticated to view manufacturers" on public.manufacturers;
drop policy if exists "Allow authenticated to manage manufacturers" on public.manufacturers;
drop policy if exists "Enable all for authenticated users" on public.manufacturers;
drop policy if exists "Allow anon to view manufacturers" on public.manufacturers;

-- 3. Manufacturer Product Types
drop policy if exists "mpt_auth_all" on public.manufacturer_product_types;
drop policy if exists "mpt_anon_view" on public.manufacturer_product_types;

-- CRIA POLÍTICA DE ACESSO TOTAL (PARA TESTES)
-- Isso permite ler e escrever sem bloqueios
create policy "total_access_product_types" on public.product_types for all using (true);
create policy "total_access_manufacturers" on public.manufacturers for all using (true);
create policy "total_access_mpt" on public.manufacturer_product_types for all using (true);
create policy "total_access_catalog" on public.product_catalog for all using (true);
