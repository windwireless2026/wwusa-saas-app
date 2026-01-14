-- 1. Tabela de Catálogo de Produtos
create table public.product_catalog (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique, -- "iPhone 14 Pro Max"
  type text not null, -- "Cell phone", "Watch", "iPad", "AirPods"
  manufacturer text not null default 'Apple',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para Catálogo
alter table public.product_catalog enable row level security;
create policy "Todos veem catalogo" on public.product_catalog for select using (true);
create policy "Admins gerenciam catalogo" on public.product_catalog for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and role in ('super_admin', 'stock_manager'))
);
-- Permitir insert autenticado para facilitar (ou restrinja se preferir)
create policy "Logados criam modelos" on public.product_catalog for insert with check (auth.role() = 'authenticated');


-- 2. Popular com dados da imagem (Lista Base)
insert into public.product_catalog (name, type, manufacturer) values
-- iPhones
('iPhone 7', 'Cell phone', 'Apple'),
('iPhone 7 Plus', 'Cell phone', 'Apple'),
('iPhone 8', 'Cell phone', 'Apple'),
('iPhone 8 PLUS', 'Cell phone', 'Apple'),
('iPhone X', 'Cell phone', 'Apple'),
('iPhone XR', 'Cell phone', 'Apple'),
('iPhone XS', 'Cell phone', 'Apple'),
('iPhone XS MAX', 'Cell phone', 'Apple'),
('iPhone 11', 'Cell phone', 'Apple'),
('iPhone 11 PRO', 'Cell phone', 'Apple'),
('iPhone 11 PRO MAX', 'Cell phone', 'Apple'),
('iPhone SE2', 'Cell phone', 'Apple'),
('iPhone SE3', 'Cell phone', 'Apple'),
('iPhone 12', 'Cell phone', 'Apple'),
('iPhone 12 PRO', 'Cell phone', 'Apple'),
('iPhone 12 PRO MAX', 'Cell phone', 'Apple'),
('iPhone 13', 'Cell phone', 'Apple'),
('iPhone 13 mini', 'Cell phone', 'Apple'),
('iPhone 13 PRO', 'Cell phone', 'Apple'),
('iPhone 13 PRO MAX', 'Cell phone', 'Apple'),
('iPhone 14', 'Cell phone', 'Apple'),
('iPhone 14 PLUS', 'Cell phone', 'Apple'),
('iPhone 14 PRO', 'Cell phone', 'Apple'),
('iPhone 14 PRO MAX', 'Cell phone', 'Apple'),
('iPhone 15', 'Cell phone', 'Apple'),
('iPhone 15 PLUS', 'Cell phone', 'Apple'),
('iPhone 15 PRO', 'Cell phone', 'Apple'),
('iPhone 15 PRO MAX', 'Cell phone', 'Apple'),
('iPhone 16', 'Cell phone', 'Apple'),
('iPhone 16 plus', 'Cell phone', 'Apple'),
('iPhone 16E', 'Cell phone', 'Apple'),
('iPhone 16 PRO', 'Cell phone', 'Apple'),
('iPhone 16 PRO MAX', 'Cell phone', 'Apple'),
('iPhone 17', 'Cell phone', 'Apple'),
('iPhone 17 AIR', 'Cell phone', 'Apple'),
('iPhone 17 PRO', 'Cell phone', 'Apple'),
('iPhone 17 PRO MAX', 'Cell phone', 'Apple'),
-- iPads
('iPad 8', 'iPad', 'Apple'),
('iPad 10th Gen.', 'iPad', 'Apple'),
('iPad 11th Gen.', 'iPad', 'Apple'),
-- Macbooks
('Macbook air 13', 'Macbook', 'Apple'),
-- Watches
('Watch Ultra', 'Watch', 'Apple'),
('Watch SERIES 7', 'Watch', 'Apple'),
('Watch SERIES 10', 'Watch', 'Apple'),
('Watch SERIES 11', 'Watch', 'Apple'),
-- AirPods
('AIRPODS', 'AirPods', 'Apple')
on conflict (name) do nothing;

-- 3. Atualizar tabela Inventory para aceitar as novas Grades e Status
-- No Postgres, alterar Check Constraint é chato, vamos dropar e recriar a constraint de grade
alter table public.inventory drop constraint if exists inventory_grade_check;
alter table public.inventory add constraint inventory_grade_check 
  check (grade in ('A', 'A-', 'AB', 'B', 'RMA', 'Blocked', 'RMA-Returns', 'RR', 'As-Is', 'LACRADO', 'C', 'Open Box'));

-- Opcional: Criar tabelas auxiliares para Cores/Grades se quiser restringir estritamente,
-- mas por enquanto, constraints CHECK ou combobox no frontend resolvem.
