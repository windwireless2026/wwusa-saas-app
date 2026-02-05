-- Migration: 097_fix_critical_rls_company_filtering.sql
-- Description: Drop all old RLS policies and ensure tables have basic RLS enabled
-- Date: 2026-02-03
-- Status: Cleanup migration - Removes conflicting policies from migrations 088/087

-- ANALYSIS OF CURRENT SCHEMA:
-- - invoices: NO company_id column (links via cost_center_id → cost_centers)
-- - cost_centers: NO company_id column
-- - inventory: NO company_id/stock_location_id (simple table: model, capacity, color, status, etc)
-- - profiles: HAS company_id column (fixed in migration 096)
--
-- CURRENT STATE: Multiple conflicting policies exist from migrations 063, 064, 073, 087, 088
-- THIS MIGRATION: Drop ALL old policies, let existing ones from 088 stay active

-- ============================================================================
-- STEP 1: DROP ALL CONFLICTING POLICIES (from various migrations)
-- ============================================================================

-- INVOICES policies (from migration 20260112)
DROP POLICY IF EXISTS "Allow authenticated users to read invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to update invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to delete invoices" ON invoices;

-- COST_CENTERS policies (from migration 20260112)
DROP POLICY IF EXISTS "Allow authenticated users to read cost_centers" ON cost_centers;
DROP POLICY IF EXISTS "Allow authenticated users to insert cost_centers" ON cost_centers;
DROP POLICY IF EXISTS "Allow authenticated users to update cost_centers" ON cost_centers;
DROP POLICY IF EXISTS "Allow authenticated users to delete cost_centers" ON cost_centers;

-- INVENTORY policies (from migrations 001, 043, 062, 063, 064, 073, 087, 088)
-- Note: Keeping the ones from 088 active, so we DON'T recreate them
DROP POLICY IF EXISTS "Admins/Managers manage inventory" ON inventory;
DROP POLICY IF EXISTS "Clients view available inventory" ON inventory;
DROP POLICY IF EXISTS "DEV_FULL_ACCESS_INVENTORY" ON inventory;
DROP POLICY IF EXISTS "Enable all for dev inventory" ON inventory;

-- ============================================================================
-- STEP 2: ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: CREATE BASIC POLICIES FOR INVOICES AND COST_CENTERS
-- (inventory already has policies from migration 088 - we keep those)
-- ============================================================================

-- Drop policies if they exist (in case migration was partially executed)
DROP POLICY IF EXISTS "invoices_access_authenticated" ON invoices;
DROP POLICY IF EXISTS "cost_centers_access_authenticated" ON cost_centers;

-- INVOICES: Simple authenticated access (no company_id column exists)
CREATE POLICY "invoices_access_authenticated"
ON invoices
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- COST_CENTERS: Simple authenticated access (no company_id column exists)
CREATE POLICY "cost_centers_access_authenticated"
ON cost_centers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

/*
-- 1. Check policies after migration
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('invoices', 'cost_centers', 'inventory')
ORDER BY tablename, policyname;

-- Expected:
-- invoices: invoices_access_authenticated
-- cost_centers: cost_centers_access_authenticated
-- inventory: (policies from migration 088 remain)
--   - Inventory is readable by authenticated users
--   - Operacional and socio can manage inventory
--   - inventory_manage_staff
--   - inventory_update_authenticated

-- 2. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('invoices', 'cost_centers', 'inventory');

-- Expected: All should have rowsecurity = true
*/

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
-- 
-- WHAT THIS MIGRATION DOES:
-- 1. Drops conflicting old policies from migrations 001, 020, 043, 062, etc
-- 2. Ensures RLS is enabled on invoices, cost_centers, inventory
-- 3. Creates simple authenticated-only policies for invoices and cost_centers
-- 4. Keeps existing inventory policies from migration 088
--
-- WHY NO COMPANY FILTERING:
-- - Tables invoices, cost_centers, inventory do NOT have company_id column
-- - Future migration (098+) should:
--   a) Add company_id to these tables
--   b) Migrate data to link to proper companies
--   c) Update RLS policies to filter by company_id
--
-- CURRENT SECURITY STATE:
-- ✅ Better than before: RLS is enabled
-- ⚠️ Still needs work: All authenticated users see all data
-- 📝 Next steps: Add company_id columns + proper filtering
--
-- ============================================================================
