-- Migration 091: Refactor permissions to granular checkboxes (view/edit/delete)
-- Changes permission_level ENUM to 3 separate boolean columns

BEGIN;

-- =====================================================
-- STEP 1: Add new permission columns
-- =====================================================
ALTER TABLE access_profile_permissions
ADD COLUMN IF NOT EXISTS can_view BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_edit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_delete BOOLEAN DEFAULT false;

-- =====================================================
-- STEP 2: Migrate existing data
-- =====================================================
-- 'write' -> can view, edit, and delete
UPDATE access_profile_permissions
SET 
  can_view = true,
  can_edit = true,
  can_delete = true
WHERE permission_level = 'write';

-- 'read' -> can only view
UPDATE access_profile_permissions
SET 
  can_view = true,
  can_edit = false,
  can_delete = false
WHERE permission_level = 'read';

-- 'none' -> no permissions
UPDATE access_profile_permissions
SET 
  can_view = false,
  can_edit = false,
  can_delete = false
WHERE permission_level = 'none';

-- =====================================================
-- STEP 3: Drop old permission_level column
-- =====================================================
ALTER TABLE access_profile_permissions
DROP COLUMN IF EXISTS permission_level;

-- =====================================================
-- STEP 4: Create complete route structure
-- =====================================================
-- Delete all existing permissions to rebuild with new structure
DELETE FROM access_profile_permissions;

-- Create function to populate permissions for a profile
CREATE OR REPLACE FUNCTION populate_granular_permissions(
  p_profile_id UUID,
  p_can_view BOOLEAN DEFAULT false,
  p_can_edit BOOLEAN DEFAULT false,
  p_can_delete BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Dashboard
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES (p_profile_id, 'dashboard', p_can_view, p_can_edit, p_can_delete);
  
  -- Cadastro (Catalog)
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'cadastro', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'cadastro/catalog', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'cadastro/manufacturers', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'cadastro/product-types', p_can_view, p_can_edit, p_can_delete);
  
  -- Operações (Operations)
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'operations', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'operations/inventory', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'operations/product-types', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'operations/manufacturers', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'operations/models', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'operations/stock-locations', p_can_view, p_can_edit, p_can_delete);
  
  -- Comercial
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'comercial', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'comercial/budgets', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'comercial/sales', p_can_view, p_can_edit, p_can_delete);
  
  -- Financeiro
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'financeiro', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'financeiro/accounts', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'financeiro/transactions', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'financeiro/reports', p_can_view, p_can_edit, p_can_delete);
  
  -- Sócios (Partners)
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'socios', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'socios/partners', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'socios/distributions', p_can_view, p_can_edit, p_can_delete);
  
  -- Segurança (Security)
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'security', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'security/access-profiles', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'security/audit-logs', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'security/users', p_can_view, p_can_edit, p_can_delete);
  
  -- Configurações (Settings)
  INSERT INTO access_profile_permissions (profile_id, module_key, can_view, can_edit, can_delete)
  VALUES 
    (p_profile_id, 'settings', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'settings/company', p_can_view, p_can_edit, p_can_delete),
    (p_profile_id, 'settings/preferences', p_can_view, p_can_edit, p_can_delete);
END;
$$;

-- =====================================================
-- STEP 5: Repopulate permissions for existing profiles
-- =====================================================

-- Administrador: Full access
DO $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM access_profiles WHERE name = 'Administrador' LIMIT 1;
  IF v_profile_id IS NOT NULL THEN
    PERFORM populate_granular_permissions(v_profile_id, true, true, true);
  END IF;
END $$;

-- Diretoria: View and edit, no delete
DO $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM access_profiles WHERE name = 'Diretoria' LIMIT 1;
  IF v_profile_id IS NOT NULL THEN
    PERFORM populate_granular_permissions(v_profile_id, true, true, false);
  END IF;
END $$;

-- Operacional: View and edit operations, view others
DO $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM access_profiles WHERE name = 'Operacional' LIMIT 1;
  IF v_profile_id IS NOT NULL THEN
    -- All modules: view only
    PERFORM populate_granular_permissions(v_profile_id, true, false, false);
    
    -- Operations modules: view, edit, delete
    UPDATE access_profile_permissions
    SET can_edit = true, can_delete = true
    WHERE profile_id = v_profile_id
    AND module_key LIKE 'operations%';
    
    -- Cadastro: view, edit
    UPDATE access_profile_permissions
    SET can_edit = true
    WHERE profile_id = v_profile_id
    AND module_key LIKE 'cadastro%';
  END IF;
END $$;

-- Cliente: View only
DO $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM access_profiles WHERE name = 'Cliente' LIMIT 1;
  IF v_profile_id IS NOT NULL THEN
    PERFORM populate_granular_permissions(v_profile_id, true, false, false);
    
    -- No access to security and settings
    UPDATE access_profile_permissions
    SET can_view = false
    WHERE profile_id = v_profile_id
    AND (module_key LIKE 'security%' OR module_key LIKE 'settings%' OR module_key LIKE 'socios%');
  END IF;
END $$;

-- =====================================================
-- STEP 6: Add constraints
-- =====================================================
ALTER TABLE access_profile_permissions
ALTER COLUMN can_view SET NOT NULL,
ALTER COLUMN can_edit SET NOT NULL,
ALTER COLUMN can_delete SET NOT NULL;

-- =====================================================
-- STEP 7: Create helper functions
-- =====================================================

-- Check if user has permission for a specific route
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_route TEXT,
  p_permission_type TEXT -- 'view', 'edit', 'delete'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_profile_id UUID;
  v_has_permission BOOLEAN;
BEGIN
  -- Get user's access profile
  SELECT access_profile_id INTO v_access_profile_id
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_access_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permission
  IF p_permission_type = 'view' THEN
    SELECT can_view INTO v_has_permission
    FROM access_profile_permissions
    WHERE profile_id = v_access_profile_id
    AND module_key = p_route;
  ELSIF p_permission_type = 'edit' THEN
    SELECT can_edit INTO v_has_permission
    FROM access_profile_permissions
    WHERE profile_id = v_access_profile_id
    AND module_key = p_route;
  ELSIF p_permission_type = 'delete' THEN
    SELECT can_delete INTO v_has_permission
    FROM access_profile_permissions
    WHERE profile_id = v_access_profile_id
    AND module_key = p_route;
  ELSE
    RETURN false;
  END IF;
  
  RETURN COALESCE(v_has_permission, false);
END;
$$;

COMMIT;

-- =====================================================
-- Verification
-- =====================================================
-- SELECT 
--   ap.name as profile_name,
--   COUNT(*) as total_routes,
--   SUM(CASE WHEN can_view THEN 1 ELSE 0 END) as can_view_count,
--   SUM(CASE WHEN can_edit THEN 1 ELSE 0 END) as can_edit_count,
--   SUM(CASE WHEN can_delete THEN 1 ELSE 0 END) as can_delete_count
-- FROM access_profile_permissions app
-- JOIN access_profiles ap ON ap.id = app.profile_id
-- GROUP BY ap.name;
