-- Migration 087: Fix user_role ENUM and update role_v2 type
-- Execute this in Supabase SQL Editor to fix the ENUM type conversion

-- ============================================
-- STEP 1: Drop all policies that depend on role_v2
-- ============================================

DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Operacional and socio can update any profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

DROP POLICY IF EXISTS "Inventory is readable by authenticated users" ON inventory;
DROP POLICY IF EXISTS "Operacional and socio can manage inventory" ON inventory;
DROP POLICY IF EXISTS "inventory_manage_staff" ON inventory;
DROP POLICY IF EXISTS "inventory_update_authenticated" ON inventory;

DROP POLICY IF EXISTS "Product catalog is readable by all authenticated users" ON product_catalog;
DROP POLICY IF EXISTS "Operacional and socio can manage product catalog" ON product_catalog;
DROP POLICY IF EXISTS "catalog_manage_staff" ON product_catalog;

DROP POLICY IF EXISTS "Manufacturers is readable by all authenticated users" ON manufacturers;
DROP POLICY IF EXISTS "Operacional and socio can manage manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "manufacturers_manage_admin" ON manufacturers;

DROP POLICY IF EXISTS "Product types is readable by all authenticated users" ON product_types;
DROP POLICY IF EXISTS "Operacional and socio can manage product types" ON product_types;
DROP POLICY IF EXISTS "product_types_manage_admin" ON product_types;

DROP POLICY IF EXISTS "Agents is readable by all authenticated users" ON agents;
DROP POLICY IF EXISTS "Operacional and socio can manage agents" ON agents;
DROP POLICY IF EXISTS "agents_manage_staff" ON agents;

DROP POLICY IF EXISTS "Stock locations is readable by authenticated users" ON stock_locations;
DROP POLICY IF EXISTS "Operacional and socio can manage stock locations" ON stock_locations;
DROP POLICY IF EXISTS "stock_locations_manage_staff" ON stock_locations;

DROP POLICY IF EXISTS "Company settings is readable by authenticated users" ON company_settings;
DROP POLICY IF EXISTS "Operacional and socio can manage company settings" ON company_settings;
DROP POLICY IF EXISTS "company_settings_manage_admin" ON company_settings;

DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;
DROP POLICY IF EXISTS "Operacional and socio can insert invoices" ON invoices;

DROP POLICY IF EXISTS "Operacional and socio can insert financial_groups" ON financial_groups;
DROP POLICY IF EXISTS "Operacional and socio can update financial_groups" ON financial_groups;

DROP POLICY IF EXISTS "Operacional and socio can insert dre_categories" ON dre_categories;
DROP POLICY IF EXISTS "Operacional and socio can update dre_categories" ON dre_categories;

DROP POLICY IF EXISTS "Operacional and socio can insert capital_flow_categories" ON capital_flow_categories;
DROP POLICY IF EXISTS "Operacional and socio can update capital_flow_categories" ON capital_flow_categories;

DROP POLICY IF EXISTS "Operacional and socio can insert financial_classes" ON financial_classes;
DROP POLICY IF EXISTS "Operacional and socio can update financial_classes" ON financial_classes;

DROP POLICY IF EXISTS "Users can update their own transactions" ON financial_transactions;

DROP POLICY IF EXISTS "Operacional and socio can insert financial_budgets" ON financial_budgets;
DROP POLICY IF EXISTS "Operacional and socio can update financial_budgets" ON financial_budgets;

DROP POLICY IF EXISTS "Operacional and socio can insert bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Operacional and socio can update bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Operacional and socio can delete bank_accounts" ON bank_accounts;

-- ============================================
-- STEP 2: Update user_role ENUM to remove legacy values
-- ============================================

ALTER TYPE user_role RENAME TO user_role_old;

CREATE TYPE user_role AS ENUM (
  'operacional',
  'cliente',
  'socio'
);

-- Update role_v2 to use the new ENUM type
ALTER TABLE profiles ALTER COLUMN role_v2 TYPE user_role USING (role_v2::user_role);

DROP TYPE user_role_old;

-- ============================================
-- STEP 3: Recreate all policies with proper role_v2 checks
-- ============================================

-- Profiles policies
CREATE POLICY "Profiles are readable by authenticated users" ON profiles
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Operacional and socio can update any profile" ON profiles
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

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

-- Inventory policies
CREATE POLICY "Inventory is readable by authenticated users" ON inventory
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage inventory" ON inventory
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Product catalog policies
CREATE POLICY "Product catalog is readable by all authenticated users" ON product_catalog
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage product catalog" ON product_catalog
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Manufacturers policies
CREATE POLICY "Manufacturers is readable by all authenticated users" ON manufacturers
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage manufacturers" ON manufacturers
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Product types policies
CREATE POLICY "Product types is readable by all authenticated users" ON product_types
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage product types" ON product_types
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Agents policies
CREATE POLICY "Agents is readable by all authenticated users" ON agents
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage agents" ON agents
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Stock locations policies
CREATE POLICY "Stock locations is readable by authenticated users" ON stock_locations
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage stock locations" ON stock_locations
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Company settings policies
CREATE POLICY "Company settings is readable by authenticated users" ON company_settings
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage company settings" ON company_settings
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Invoices policies
CREATE POLICY "Allow authenticated users to insert invoices" ON invoices
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Financial module policies
CREATE POLICY "Operacional and socio can insert financial_groups" ON financial_groups
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update financial_groups" ON financial_groups
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can insert dre_categories" ON dre_categories
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update dre_categories" ON dre_categories
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can insert capital_flow_categories" ON capital_flow_categories
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update capital_flow_categories" ON capital_flow_categories
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can insert financial_classes" ON financial_classes
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update financial_classes" ON financial_classes
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

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

CREATE POLICY "Operacional and socio can insert financial_budgets" ON financial_budgets
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can update financial_budgets" ON financial_budgets
FOR UPDATE TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

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
-- SUCCESS: Migration complete
-- ============================================

SELECT 'Migration 087 completed successfully!' as status;
