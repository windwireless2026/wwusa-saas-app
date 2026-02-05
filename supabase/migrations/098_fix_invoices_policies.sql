-- Migration: 098_fix_invoices_policies.sql
-- Description: Remove old conflicting invoices policies and keep only the new one
-- Date: 2026-02-03

-- ============================================================================
-- STEP 1: DROP OLD CONFLICTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;
DROP POLICY IF EXISTS "Operacional and socio can insert invoices" ON invoices;

-- ============================================================================
-- STEP 2: ENSURE NEW POLICY EXISTS (idempotent)
-- ============================================================================

DROP POLICY IF EXISTS "invoices_access_authenticated" ON invoices;

CREATE POLICY "invoices_access_authenticated"
ON invoices
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

/*
-- Verify only 1 policy exists
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'invoices';

-- Expected: Only "invoices_access_authenticated" with cmd = "ALL"

-- Test query to see if invoices are visible
SELECT COUNT(*) FROM invoices;

-- Expected: 8 invoices
*/
