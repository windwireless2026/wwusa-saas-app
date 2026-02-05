-- Migration: 100_recreate_erik_profile.sql
-- Description: Recreate Erik's profile after migration 096 deleted it
-- Date: 2026-02-03
-- Issue: Migration 096 deleted Erik's profile but he's the only auth user
--        This caused 500 errors across the app due to missing profile

-- Recreate Erik's profile with correct company_id
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  first_name,
  last_name,
  company_id,
  role_v2,
  created_at,
  updated_at
) VALUES (
  '8dbaf29f-5caf-4344-ba37-f5dacac0d190',
  'erik@windwmiami.com',
  'Erik',
  'Erik',
  'Admin',
  '05ffe610-77d0-4b48-9831-b078595f8d3c', -- WIND WIRELESS LLC
  'administrador',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  company_id = EXCLUDED.company_id,
  role_v2 = EXCLUDED.role_v2,
  updated_at = NOW();

-- Verification
/*
SELECT id, email, full_name, company_id, role_v2 
FROM profiles 
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- Expected: 1 row with Erik's data and WIND WIRELESS company_id
*/
