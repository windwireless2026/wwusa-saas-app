-- Script para verificar e corrigir perfis de acesso

-- ============================================
-- VERIFICAÇÃO 1: Ver perfis existentes
-- ============================================
SELECT 
  company_name,
  name,
  description,
  is_system_profile,
  created_at
FROM access_profiles
ORDER BY company_name, name;

-- ============================================
-- VERIFICAÇÃO 2: Ver empresas nos profiles
-- ============================================
SELECT DISTINCT 
  company_name,
  COUNT(*) as total_users
FROM profiles
WHERE company_name IS NOT NULL
GROUP BY company_name;

-- ============================================
-- VERIFICAÇÃO 3: Ver seu usuário atual
-- ============================================
SELECT 
  id,
  email,
  company_name,
  role_v2,
  full_name
FROM profiles
WHERE id = auth.uid();

-- ============================================
-- CORREÇÃO: Criar perfis manualmente para sua empresa
-- ============================================

-- Execute este bloco substituindo 'SUA_EMPRESA' pelo company_name do seu usuário
DO $$
DECLARE
  v_company TEXT;
BEGIN
  -- Pegar o company_name do usuário atual
  SELECT company_name INTO v_company
  FROM profiles
  WHERE id = auth.uid();
  
  -- Se encontrou, criar perfis
  IF v_company IS NOT NULL THEN
    PERFORM create_default_access_profiles_for_company(v_company);
    RAISE NOTICE 'Perfis criados para empresa: %', v_company;
  ELSE
    RAISE NOTICE 'Usuário atual não tem company_name definido!';
  END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO 4: Contar perfis criados
-- ============================================
SELECT 
  company_name,
  COUNT(*) as total_perfis
FROM access_profiles
GROUP BY company_name;

-- ============================================
-- VERIFICAÇÃO 5: Ver permissões criadas
-- ============================================
SELECT 
  ap.company_name,
  ap.name as perfil_nome,
  COUNT(app.id) as total_permissoes
FROM access_profiles ap
LEFT JOIN access_profile_permissions app ON ap.id = app.profile_id
GROUP BY ap.company_name, ap.name
ORDER BY ap.company_name, ap.name;
