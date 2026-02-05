-- VERIFICAR E CORRIGIR COMPANY_NAME COM RLS

-- 1. Verificar políticas RLS na tabela profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. Tentar UPDATE direto (pode falhar por RLS)
UPDATE profiles
SET company_name = 'WIND WIRELESS'
WHERE id = auth.uid();

-- 3. Verificar se atualizou
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE id = auth.uid();

-- 4. Se não funcionou, vamos criar uma função que bypassa RLS
CREATE OR REPLACE FUNCTION update_user_company_name(user_id UUID, new_company_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Esta função roda com privilégios do owner (bypassa RLS)
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET company_name = new_company_name
  WHERE id = user_id;
END;
$$;

-- 5. Usar a função para atualizar
SELECT update_user_company_name(auth.uid(), 'WIND WIRELESS');

-- 6. Verificar novamente
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE id = auth.uid();
