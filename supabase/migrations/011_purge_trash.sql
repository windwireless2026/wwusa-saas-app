-- Limpeza definitiva da lixeira de agentes
-- ATENÇÃO: Isso removerá permanentemente todos os agentes que foram "excluídos" (movidos para a lixeira)
delete from public.agents 
where deleted_at is not null;
