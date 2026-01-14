-- Teste rápido: Ver se você consegue acessar os dados
-- Execute este script no Supabase SQL Editor estando LOGADO

-- Ver dados da product_catalog
SELECT COUNT(*) as total FROM public.product_catalog WHERE deleted_at IS NULL;

-- Ver alguns produtos
SELECT id, name, type, manufacturer FROM public.product_catalog WHERE deleted_at IS NULL LIMIT 5;

-- Ver tipos de produto
SELECT * FROM public.product_types WHERE deleted_at IS NULL;

-- Ver perfil do usuário atual
SELECT auth.uid() as meu_user_id, auth.email() as meu_email;

-- Ver usuários na tabela profiles (se existir)
SELECT id, email, first_name, last_name FROM public.profiles LIMIT 5;
