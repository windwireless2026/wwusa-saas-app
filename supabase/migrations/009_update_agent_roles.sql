-- Migration to standardize agent roles and implement "Fornecedor Estoque"
-- 1. Update existing agents created via migration ('supplier') to 'fornecedor_estoque'
update public.agents 
set roles = array_replace(roles, 'supplier', 'fornecedor_estoque')
where 'supplier' = any(roles);

-- 2. If 'fornecedor' was already used and intended for inventory, you might want to update it too.
-- For now, let's just make sure the 'supplier' ones are updated as they came from the old suppliers table.
update public.agents 
set roles = array_replace(roles, 'fornecedor', 'fornecedor_estoque')
where 'fornecedor' = any(roles);
