-- Fix system profile flag: only Administrador should be system profile

-- Set all to false first
UPDATE access_profiles
SET is_system_profile = false;

-- Only Administrador is system profile (cannot be deleted)
UPDATE access_profiles
SET is_system_profile = true
WHERE id = 'b2c1d262-cb35-46c5-877d-ff54ab026161'; -- Administrador (acesso total)

-- Verify
SELECT 
  name,
  is_system_profile,
  CASE 
    WHEN is_system_profile THEN '🔒 Não pode excluir'
    ELSE '✅ Pode excluir'
  END as status
FROM access_profiles
ORDER BY is_system_profile DESC, name;
