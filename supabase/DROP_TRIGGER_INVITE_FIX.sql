-- =============================================================================
-- REMOVER o trigger que quebra o convite
-- =============================================================================
-- O trigger on_auth_user_created chama handle_new_user() ao inserir em auth.users.
-- Se ele falhar (RLS, coluna errada, etc.), o convite inteiro falha.
-- Ao remover o trigger, o convite cria só o usuário no Auth; a API do projeto
-- cria o perfil em public.profiles depois (upsert).
--
-- Execute no Supabase: SQL Editor → Cole e Run
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
