-- DIAGNÓSTICO COMPLETO DO COMPANY_NAME

-- 1. Ver dados atuais do seu perfil
SELECT 
  id,
  email,
  company_name,
  role_v2,
  created_at,
  updated_at
FROM profiles
WHERE id = auth.uid();

-- 2. Ver TODOS os perfis com company_name NULL
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE company_name IS NULL
LIMIT 10;

-- 3. Ver TODOS os perfis com company_name preenchido
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE company_name IS NOT NULL
LIMIT 10;

-- 4. Verificar se existe algum trigger na tabela profiles
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 5. CORREÇÃO FORÇADA - Atualizar para 'WIND WIRELESS'
UPDATE profiles
SET company_name = 'WIND WIRELESS'
WHERE id = auth.uid()
RETURNING id, email, company_name, role_v2;
