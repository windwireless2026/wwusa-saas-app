-- Migration 090: Create Companies table and refactor company_name to company_id
-- This migration creates a proper companies table and refactors all references

-- =====================================================
-- STEP 0: Update user_role enum to include 'administrador' (MUST be outside transaction)
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'administrador' 
    AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'administrador';
  END IF;
END $$;

-- COMMIT the enum change before using it
COMMIT;

-- Now start the main transaction
BEGIN;

-- =====================================================
-- STEP 1: Create companies table
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL, -- Razão Social
  trade_name TEXT NOT NULL, -- Nome Fantasia (DBA)
  tax_id TEXT UNIQUE, -- CNPJ/EIN
  email TEXT,
  phone TEXT,
  website TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  address_country TEXT DEFAULT 'BR',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_companies_tax_id ON companies(tax_id) WHERE tax_id IS NOT NULL;
CREATE INDEX idx_companies_trade_name ON companies(trade_name);

-- Enable RLS (but don't create policies yet - will do after adding company_id to profiles)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Insert WIND WIRELESS as first company
-- =====================================================
INSERT INTO companies (id, legal_name, trade_name, tax_id)
VALUES (
  gen_random_uuid(),
  'WIND WIRELESS LLC',
  'WIND WIRELESS',
  NULL
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Store the company_id for later use
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get WIND WIRELESS company ID
  SELECT id INTO v_company_id
  FROM companies
  WHERE trade_name = 'WIND WIRELESS'
  LIMIT 1;

  -- Store in a temporary table for reference
  CREATE TEMP TABLE temp_wind_wireless_id AS
  SELECT v_company_id as company_id;
END $$;

-- =====================================================
-- STEP 3: Add company_id to profiles table
-- =====================================================
-- Add company_id column (nullable first)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Migrate data: set company_id for all profiles with company_name = 'WIND WIRELESS'
UPDATE profiles
SET company_id = (SELECT company_id FROM temp_wind_wireless_id)
WHERE company_name = 'WIND WIRELESS' OR company_name IS NULL;

-- Update role from 'socio' to 'administrador' for user erik
UPDATE profiles
SET role_v2 = 'administrador'
WHERE role_v2 = 'socio';

-- Now make company_id NOT NULL
ALTER TABLE profiles 
ALTER COLUMN company_id SET NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- =====================================================
-- STEP 4: Drop OLD RLS policies that depend on company_name
-- =====================================================
-- Must drop these BEFORE dropping company_name column
DROP POLICY IF EXISTS "Users can view access profiles from their company" ON access_profiles;
DROP POLICY IF EXISTS "Operacional and socio can manage access profiles" ON access_profiles;
DROP POLICY IF EXISTS "Users can view permissions from their company profiles" ON access_profile_permissions;
DROP POLICY IF EXISTS "Operacional and socio can manage permissions" ON access_profile_permissions;
DROP POLICY IF EXISTS "access_profiles_select_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profiles_update_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profiles_insert_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profiles_delete_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profile_permissions_select_policy" ON access_profile_permissions;
DROP POLICY IF EXISTS "access_profile_permissions_insert_policy" ON access_profile_permissions;
DROP POLICY IF EXISTS "access_profile_permissions_delete_policy" ON access_profile_permissions;

-- Now it's safe to drop company_name column
ALTER TABLE profiles DROP COLUMN IF EXISTS company_name;

-- =====================================================
-- STEP 5: Recreate profiles RLS policies with company_id
-- =====================================================
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

-- Select: users can see profiles from their company
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Update: users can update their own profile, admins can update all from company
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  USING (
    id = auth.uid() 
    OR (
      company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
      AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('administrador', 'operacional')
    )
  );

-- Insert: admins can create profiles for their company
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('administrador', 'operacional')
  );

-- =====================================================
-- STEP 6: Add company_id to access_profiles table
-- =====================================================
-- Add company_id column
ALTER TABLE access_profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Migrate data
UPDATE access_profiles
SET company_id = (SELECT company_id FROM temp_wind_wireless_id)
WHERE company_name = 'WIND WIRELESS' OR company_name IS NULL;

-- Make NOT NULL
ALTER TABLE access_profiles 
ALTER COLUMN company_id SET NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_access_profiles_company_id ON access_profiles(company_id);

-- Drop old company_name column
ALTER TABLE access_profiles DROP COLUMN IF EXISTS company_name;

-- =====================================================
-- STEP 7: Create companies RLS policies (now that company_id exists in profiles)
-- =====================================================

-- RLS Policy: Users can only see their own company
CREATE POLICY "companies_select_policy"
  ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- RLS Policy: Only admin can update company
CREATE POLICY "companies_update_policy"
  ON companies
  FOR UPDATE
  USING (
    id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role_v2 IN ('administrador', 'socio')
    )
  );

-- =====================================================
-- STEP 8: Recreate access_profiles RLS policies
-- =====================================================
DROP POLICY IF EXISTS "access_profiles_select_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profiles_update_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profiles_insert_policy" ON access_profiles;
DROP POLICY IF EXISTS "access_profiles_delete_policy" ON access_profiles;

-- Select: users can see profiles from their company
CREATE POLICY "access_profiles_select_policy"
  ON access_profiles
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Update: only admins and operacional
CREATE POLICY "access_profiles_update_policy"
  ON access_profiles
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('administrador', 'operacional')
  );

-- Insert: only admins and operacional
CREATE POLICY "access_profiles_insert_policy"
  ON access_profiles
  FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('administrador', 'operacional')
  );

-- Delete: only admins, and only non-system profiles
CREATE POLICY "access_profiles_delete_policy"
  ON access_profiles
  FOR DELETE
  USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) = 'administrador'
    AND is_system_profile = false
  );

-- =====================================================
-- STEP 9: Update access_profile_permissions RLS
-- =====================================================
DROP POLICY IF EXISTS "access_profile_permissions_select_policy" ON access_profile_permissions;
DROP POLICY IF EXISTS "access_profile_permissions_insert_policy" ON access_profile_permissions;
DROP POLICY IF EXISTS "access_profile_permissions_delete_policy" ON access_profile_permissions;

-- Select: users can see permissions for profiles in their company
CREATE POLICY "access_profile_permissions_select_policy"
  ON access_profile_permissions
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM access_profiles 
      WHERE company_id = (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Insert: only admins and operacional
CREATE POLICY "access_profile_permissions_insert_policy"
  ON access_profile_permissions
  FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM access_profiles 
      WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('administrador', 'operacional')
  );

-- Delete: only admins and operacional
CREATE POLICY "access_profile_permissions_delete_policy"
  ON access_profile_permissions
  FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM access_profiles 
      WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('administrador', 'operacional')
  );

-- =====================================================
-- STEP 10: Create helper function to get user's company
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id
  FROM profiles
  WHERE id = auth.uid();
$$;

-- =====================================================
-- STEP 11: Grant permissions
-- =====================================================
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON access_profiles TO authenticated;
GRANT SELECT ON access_profile_permissions TO authenticated;

-- Cleanup temp table
DROP TABLE IF EXISTS temp_wind_wireless_id;

COMMIT;

-- =====================================================
-- Verification queries (run these manually)
-- =====================================================
-- SELECT * FROM companies;
-- SELECT id, email, company_id, role_v2 FROM profiles;
-- SELECT id, name, company_id FROM access_profiles;
