-- Migration 086: Update remaining RLS policies and remove legacy role column
-- This migration updates all remaining policies that still reference the old 'role' column

-- ============================================
-- FINANCIAL MODULE POLICIES
-- ============================================

-- Financial Groups
DROP POLICY IF EXISTS "Admins can insert financial_groups" ON financial_groups;
DROP POLICY IF EXISTS "Admins can update financial_groups" ON financial_groups;

CREATE POLICY "Operacional and socio can insert financial_groups" ON financial_groups
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update financial_groups" ON financial_groups
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- DRE Categories
DROP POLICY IF EXISTS "Admins can insert dre_categories" ON dre_categories;
DROP POLICY IF EXISTS "Admins can update dre_categories" ON dre_categories;

CREATE POLICY "Operacional and socio can insert dre_categories" ON dre_categories
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update dre_categories" ON dre_categories
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Capital Flow Categories
DROP POLICY IF EXISTS "Admins can insert capital_flow_categories" ON capital_flow_categories;
DROP POLICY IF EXISTS "Admins can update capital_flow_categories" ON capital_flow_categories;

CREATE POLICY "Operacional and socio can insert capital_flow_categories" ON capital_flow_categories
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update capital_flow_categories" ON capital_flow_categories
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Financial Classes
DROP POLICY IF EXISTS "Admins can insert financial_classes" ON financial_classes;
DROP POLICY IF EXISTS "Admins can update financial_classes" ON financial_classes;

CREATE POLICY "Operacional and socio can insert financial_classes" ON financial_classes
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update financial_classes" ON financial_classes
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Financial Transactions
DROP POLICY IF EXISTS "Users can update their own transactions" ON financial_transactions;

CREATE POLICY "Users can update their own transactions" ON financial_transactions
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid() OR 
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  created_by = auth.uid() OR 
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Financial Budgets
DROP POLICY IF EXISTS "Admins can insert financial_budgets" ON financial_budgets;
DROP POLICY IF EXISTS "Admins can update financial_budgets" ON financial_budgets;

CREATE POLICY "Operacional and socio can insert financial_budgets" ON financial_budgets
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update financial_budgets" ON financial_budgets
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Bank Accounts
DROP POLICY IF EXISTS "Admins can insert bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Admins can update bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Admins can delete bank_accounts" ON bank_accounts;

CREATE POLICY "Operacional and socio can insert bank_accounts" ON bank_accounts
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update bank_accounts" ON bank_accounts
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can delete bank_accounts" ON bank_accounts
FOR DELETE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- ============================================
-- CORE MODULE POLICIES (updating remaining ones)
-- ============================================

-- Inventory (additional policies not covered in 073)
DROP POLICY IF EXISTS "inventory_manage_staff" ON inventory;
DROP POLICY IF EXISTS "inventory_update_authenticated" ON inventory;

CREATE POLICY "inventory_manage_staff" ON inventory
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "inventory_update_authenticated" ON inventory
FOR UPDATE TO authenticated
USING (TRUE)
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Profiles (additional policies not covered in 073)
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

CREATE POLICY "profiles_insert_admin" ON profiles
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "profiles_update_self_or_admin" ON profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  auth.uid() = id OR 
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

CREATE POLICY "profiles_delete_admin" ON profiles
FOR DELETE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Product Catalog (additional policy)
DROP POLICY IF EXISTS "catalog_manage_staff" ON product_catalog;

CREATE POLICY "catalog_manage_staff" ON product_catalog
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Manufacturers (additional policy)
DROP POLICY IF EXISTS "manufacturers_manage_admin" ON manufacturers;

CREATE POLICY "manufacturers_manage_admin" ON manufacturers
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Product Types (additional policy)
DROP POLICY IF EXISTS "product_types_manage_admin" ON product_types;

CREATE POLICY "product_types_manage_admin" ON product_types
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Agents (additional policy)
DROP POLICY IF EXISTS "agents_manage_staff" ON agents;

CREATE POLICY "agents_manage_staff" ON agents
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Stock Locations (additional policy)
DROP POLICY IF EXISTS "stock_locations_manage_staff" ON stock_locations;

CREATE POLICY "stock_locations_manage_staff" ON stock_locations
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Company Settings (additional policy)
DROP POLICY IF EXISTS "company_settings_manage_admin" ON company_settings;

CREATE POLICY "company_settings_manage_admin" ON company_settings
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Invoices
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;

CREATE POLICY "Operacional and socio can insert invoices" ON invoices
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- ============================================
-- FINALLY: DROP THE LEGACY ROLE COLUMN
-- ============================================

ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Verify the column was dropped
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'role';
