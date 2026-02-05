-- Fix: Infinite recursion in profiles RLS policies
-- The problem: policies are querying profiles table within profiles policies

BEGIN;

-- Drop problematic policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

-- Recreate with simpler, non-recursive logic

-- SELECT: Allow users to see their own profile and profiles from their company
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  USING (
    id = auth.uid()  -- Can always see own profile
    OR 
    company_id = get_user_company_id()  -- Use function that bypasses RLS
  );

-- UPDATE: Users can update their own profile
CREATE POLICY "profiles_update_own_policy"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- UPDATE: Admins can update profiles from their company
CREATE POLICY "profiles_update_company_policy"
  ON profiles
  FOR UPDATE
  USING (
    company_id = get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_v2 IN ('administrador', 'operacional')
    )
  );

-- INSERT: Admins can create profiles for their company
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_v2 IN ('administrador', 'operacional')
    )
  );

COMMIT;

-- Test query
SELECT id, email, company_id, role_v2 
FROM profiles 
WHERE id = auth.uid();
