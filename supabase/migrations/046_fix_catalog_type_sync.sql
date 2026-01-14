-- Garantir sincronização dos tipos entre product_catalog e product_types
-- Esta migration corrige qualquer inconsistência de nomenclatura entre as tabelas

-- Atualizar tipos em inglês para português no catálogo
update public.product_catalog 
set type = 'Celular' 
where type = 'Cell phone' and deleted_at is null;

update public.product_catalog 
set type = 'Tablet' 
where type = 'iPad' and deleted_at is null;

update public.product_catalog 
set type = 'Relogio' 
where type = 'Watch' and deleted_at is null;

update public.product_catalog 
set type = 'Fone' 
where type = 'AirPods' and deleted_at is null;

update public.product_catalog 
set type = 'Computador' 
where type = 'Macbook' and deleted_at is null;

-- Verificar e reportar tipos inconsistentes (opcional, apenas para debug)
-- select distinct type from public.product_catalog where deleted_at is null order by type;
