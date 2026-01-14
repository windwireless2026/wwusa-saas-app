-- 1. Arrumar a tabela Inventory para suportar Serial Number
-- Primeiro, vamos remover a obrigatoriedade estrita do IMEI que coloquei antes, pois agora pode ser Serial.
alter table public.inventory alter column imei drop not null;

-- Adicionar coluna Serial Number e Supplier/Invoice (caso o script anterior tenha falhado ou para reforçar)
alter table public.inventory 
  add column if not exists serial_number text,
  add column if not exists supplier_id uuid references public.suppliers(id),
  add column if not exists purchase_invoice text;

-- Garantir que pelo menos um identificador exista (Constraint de Check)
-- "Ou tem IMEI ou tem Serial Number"
alter table public.inventory drop constraint if exists inventory_identifier_check;
alter table public.inventory add constraint inventory_identifier_check 
  check (
    (imei is not null and imei <> '') 
    or 
    (serial_number is not null and serial_number <> '')
  );
