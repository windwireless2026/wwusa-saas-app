-- Diagnóstico completo do problema

-- 1. Ver seu usuário e company_name
SELECT 
  id,
  email,
  company_name,
  role_v2,
  'SEU USUÁRIO' as tipo
FROM profiles
WHERE id = auth.uid();

-- 2. Ver TODOS os perfis (ignorando RLS temporariamente)
SELECT 
  company_name,
  name,
  is_system_profile,
  'PERFIS EXISTENTES' as tipo
FROM access_profiles;

-- 3. Verificar se company_name bate
SELECT 
  (SELECT company_name FROM profiles WHERE id = auth.uid()) as seu_company_name,
  (SELECT array_agg(DISTINCT company_name) FROM access_profiles) as company_names_dos_perfis;

-- 4. Testar a query exata que o frontend faz
SELECT *
FROM access_profiles
WHERE company_name = (SELECT company_name FROM profiles WHERE id = auth.uid());

-- 5. Se não retornar nada, DESABILITAR RLS TEMPORARIAMENTE para testar
ALTER TABLE access_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_profile_permissions DISABLE ROW LEVEL SECURITY;

-- Agora deve funcionar! Teste no navegador.
-- Depois REABILITE:
-- ALTER TABLE access_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE access_profile_permissions ENABLE ROW LEVEL SECURITY;
