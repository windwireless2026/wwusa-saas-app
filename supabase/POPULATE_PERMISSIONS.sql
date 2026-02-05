-- Populate permissions with correct profile IDs

-- Administrador (acesso total): Full access
SELECT populate_granular_permissions('b2c1d262-cb35-46c5-877d-ff54ab026161'::uuid, true, true, true);

-- Diretoria (gestão executiva): View and edit, no delete
SELECT populate_granular_permissions('647dd91d-0f05-41a4-986c-1ed2b32047b4'::uuid, true, true, false);

-- Operacional (gestão): View and edit operations, view others
SELECT populate_granular_permissions('76f43fb8-34f6-4bac-a790-f274bf1a63f4'::uuid, true, false, false);

-- Operations modules: view, edit, delete
UPDATE access_profile_permissions
SET can_edit = true, can_delete = true
WHERE profile_id = '76f43fb8-34f6-4bac-a790-f274bf1a63f4'
AND module_key LIKE 'operations%';

-- Cadastro: view, edit
UPDATE access_profile_permissions
SET can_edit = true
WHERE profile_id = '76f43fb8-34f6-4bac-a790-f274bf1a63f4'
AND module_key LIKE 'cadastro%';

-- Cliente (visualização): View only, no security/settings/socios
SELECT populate_granular_permissions('b8368f82-4c1e-438a-96e6-a0122a53c0c0'::uuid, true, false, false);

UPDATE access_profile_permissions
SET can_view = false
WHERE profile_id = 'b8368f82-4c1e-438a-96e6-a0122a53c0c0'
AND (module_key LIKE 'security%' OR module_key LIKE 'settings%' OR module_key LIKE 'socios%');

-- Comercial: View all, edit comercial and financeiro
SELECT populate_granular_permissions('57ebe558-7e6a-4b9a-8471-6aeb8333454d'::uuid, true, false, false);

UPDATE access_profile_permissions
SET can_edit = true, can_delete = true
WHERE profile_id = '57ebe558-7e6a-4b9a-8471-6aeb8333454d'
AND (module_key LIKE 'comercial%' OR module_key LIKE 'financeiro%');

-- Verify
SELECT 
  ap.name as profile_name,
  COUNT(*) as total_routes,
  SUM(CASE WHEN can_view THEN 1 ELSE 0 END) as can_view_count,
  SUM(CASE WHEN can_edit THEN 1 ELSE 0 END) as can_edit_count,
  SUM(CASE WHEN can_delete THEN 1 ELSE 0 END) as can_delete_count
FROM access_profile_permissions app
JOIN access_profiles ap ON ap.id = app.profile_id
GROUP BY ap.name
ORDER BY ap.name;
