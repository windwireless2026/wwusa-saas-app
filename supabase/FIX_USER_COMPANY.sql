-- CORREÇÃO FINAL: Atualizar company_name do usuário

UPDATE profiles
SET company_name = 'WIND WIRELESS'
WHERE id = auth.uid();

-- Verificar
SELECT 
  id,
  email,
  company_name,
  role_v2
FROM profiles
WHERE id = auth.uid();
