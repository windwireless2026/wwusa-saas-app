-- Migration 072: Migrate super_admin to socio role in role_v2
-- This migration sets role_v2='socio' for all users with role='super_admin'

UPDATE profiles
SET role_v2 = 'socio'
WHERE role = 'super_admin' AND role_v2 IS NULL;

-- Log the migration
SELECT COUNT(*) as affected_rows FROM profiles WHERE role = 'super_admin' AND role_v2 = 'socio';
