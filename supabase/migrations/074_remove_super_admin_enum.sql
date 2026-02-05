-- Migration 074: Remove super_admin from user_role ENUM
-- This migration removes the super_admin value from the user_role enum type
-- All super_admin users have already been migrated to role_v2='socio' in migration 072

-- First, set all remaining super_admin values to NULL (if any exist)
UPDATE profiles
SET role = NULL
WHERE role = 'super_admin';

-- Recreate the enum type without super_admin
-- PostgreSQL requires: rename old, create new, update references, drop old
ALTER TYPE user_role RENAME TO user_role_deprecated;

CREATE TYPE user_role AS ENUM (
  'stock_manager',
  'finance_manager',
  'client',
  'partner',
  'admin',
  'manager',
  'operator',
  'viewer'
);

-- Update the column to use the new enum
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING (CASE 
  WHEN role_deprecated::text = 'super_admin' THEN NULL::user_role
  ELSE role_deprecated::text::user_role
END);

-- Drop the old enum
DROP TYPE user_role_deprecated;

-- Verify the migration
SELECT COUNT(*) as profiles_with_null_role FROM profiles WHERE role IS NULL;
SELECT COUNT(*) as profiles_with_role_v2 FROM profiles WHERE role_v2 IS NOT NULL;
