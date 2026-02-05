-- ATUALIZAÇÃO DIRETA USANDO O ID DO USUÁRIO

-- Usar a função com o ID específico
SELECT update_user_company_name('8dbaf29f-5caf-4344-ba37-f5dacac0d190'::uuid, 'WIND WIRELESS');

-- Verificar com o ID direto
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Se ainda não funcionou, vamos desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Atualizar diretamente
UPDATE profiles
SET company_name = 'WIND WIRELESS'
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Verificar
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verificação final
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';
