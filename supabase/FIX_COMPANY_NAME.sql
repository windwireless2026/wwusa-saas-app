-- Verificar TODOS os usuários e seus company_name

SELECT 
  id,
  email,
  full_name,
  company_name,
  role_v2,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Se company_name está NULL, precisamos definir
-- Execute este bloco para atualizar SEU usuário:

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Pegar o ID do usuário atual
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email FROM profiles WHERE id = v_user_id;
  
  RAISE NOTICE 'Seu usuário: % (%)', v_user_email, v_user_id;
  
  -- Atualizar company_name se estiver NULL
  UPDATE profiles
  SET company_name = 'Wind Wireless USA'  -- ALTERE AQUI para o nome da sua empresa
  WHERE id = v_user_id 
    AND company_name IS NULL;
  
  RAISE NOTICE 'Company_name atualizado para: Wind Wireless USA';
END $$;

-- Verificar se foi atualizado
SELECT 
  id,
  email,
  full_name,
  company_name,
  role_v2
FROM profiles
WHERE id = auth.uid();
