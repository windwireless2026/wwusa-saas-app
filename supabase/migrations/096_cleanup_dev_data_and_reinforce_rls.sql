-- ========================================
-- MIGRATION 096: CLEANUP DEV DATA & REINFORCE RLS
-- ========================================
-- PURPOSE:
--   1. Clean up hardcoded test data from migrations 037, 038, 039
--   2. Remove unsecure RLS policies that allow all access
--   3. Reinforce production-ready RLS configuration
--   4. Document which migrations were dev-only
--
-- MIGRATIONS AFFECTED (dev-only, should not run in production):
--   - 037_force_erik_admin.sql (hardcoded super_admin role)
--   - 038_debug_disable_rls_profiles.sql (RLS disabled)
--   - 039_definitive_erik_fix.sql (DELETE + unsecure POLICY)
--
-- This migration ensures production deployment is secure.
-- ========================================

-- STEP 1: Remove dangerous dev-only RLS policy from migration 039
-- This policy allowed ALL authenticated users to access ALL data
DROP POLICY IF EXISTS "Acesso_Geral_Autenticado" ON public.profiles;
DROP POLICY IF EXISTS "Acesso_Geral_Autenticado" ON public.invoices;
DROP POLICY IF EXISTS "Acesso_Geral_Autenticado" ON public.cost_centers;
DROP POLICY IF EXISTS "Acesso_Geral_Autenticado" ON public.inventory;

-- STEP 2: Remove hardcoded dev user from migration 037 if exists
-- Note: Auth user records are managed by Supabase Auth. This only removes from profiles table.
-- The hardcoded user: Erik (ID: 8dbaf29f-5caf-4344-ba37-f5dacac0d190)
-- 
-- First, handle ALL foreign key references to Erik's profile
-- Update any records that reference Erik in various fields
UPDATE public.inventory 
SET created_by = NULL 
WHERE created_by = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

UPDATE public.invoices 
SET created_by = NULL 
WHERE created_by = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

UPDATE public.invoices 
SET requested_by = NULL 
WHERE requested_by = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

UPDATE public.audit_logs 
SET user_id = NULL 
WHERE user_id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Now safe to delete the profile
DELETE FROM public.profiles 
WHERE email = 'erik@windwmiami.com' 
  AND id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- STEP 3: Ensure RLS is ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Drop ALL old policies that may exist from migration 088/090 to avoid conflicts
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Operacional and socio can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Now recreate clean, production-ready policies

CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR 
  (SELECT company_id FROM public.profiles WHERE id = auth.uid()) = company_id
);

-- Policy 2: Users can UPDATE their own profile only
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: New user profiles created on auth signup
CREATE POLICY "profiles_insert_policy"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- STEP 5: Fix auth trigger to NOT force super_admin (was in migration 037)
-- This trigger should only create basic user profile, not assign roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    first_name, 
    role, 
    company_id
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    'operacional', -- Default role (not super_admin)
    NULL -- Will be set via access_profiles later
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Log this cleanup action (optional, if audit table exists)
-- INSERT INTO audit_logs (action, entity_type, entity_id, user_id, details, created_at)
-- VALUES (
--   'MIGRATION',
--   'system',
--   'migration_096',
--   auth.uid(),
--   'Cleaned up hardcoded dev data from migrations 037-039. Reinforced RLS policies.',
--   now()
-- );

-- ========================================
-- DOCUMENTATION
-- ========================================
-- To apply this migration:
-- 1. In Supabase Dashboard: SQL Editor → Copy this script → Run
-- 
-- Verification commands after migration:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
-- SELECT definition FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy';
-- 
-- Expected output: 3 policies exist, no "Acesso_Geral_Autenticado" or all-permissive policies
-- ========================================
