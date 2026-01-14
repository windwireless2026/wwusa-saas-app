-- 1. Garante que as colunas de lixeira existam em todas as tabelas
alter table public.manufacturers add column if not exists deleted_at timestamp with time zone;
alter table public.product_types add column if not exists deleted_at timestamp with time zone;
alter table public.agents add column if not exists deleted_at timestamp with time zone;

-- 2. Ativa todos os registros (tira da lixeira)
update public.product_types set deleted_at = null;
update public.manufacturers set deleted_at = null;
update public.agents set deleted_at = null;
