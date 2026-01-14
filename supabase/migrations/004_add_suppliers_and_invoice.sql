-- 1. Tabela de Fornecedores (Suppliers)
create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact_info text, -- Email/Telefone
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para Suppliers
alter table public.suppliers enable row level security;
create policy "Acesso total suppliers DEV" on public.suppliers for all using (true) with check (true);

-- 2. Atualizar Tabela Inventory
alter table public.inventory 
  add column if not exists supplier_id uuid references public.suppliers(id),
  add column if not exists purchase_invoice text,
  alter column imei set not null; 
  -- Nota: Se já tiver itens sem IMEI, isso daria erro. Mas como limpamos antes ou estamos em dev, ok.
  -- Se quiser garantir unicidade do IMEI:
  -- alter table public.inventory add constraint inventory_imei_key unique (imei);

-- 3. Inserir alguns fornecedores de exemplo
insert into public.suppliers (name, contact_info) values
('Vendedor eBay', 'ebay@example.com'),
('Best Buy Trade-in', 'b2b@bestbuy.com'),
('Cliente Balcão', 'N/A');
