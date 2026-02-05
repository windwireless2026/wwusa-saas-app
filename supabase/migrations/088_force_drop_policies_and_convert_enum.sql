-- Migration 088: Force drop ALL policies and convert role_v2 type
-- This migration programmatically identifies and drops all policies before conversion

-- ============================================
-- STEP 1: Drop ALL policies on ALL tables (programmatic approach)
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies from all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE 'All policies dropped successfully';
END $$;

-- ============================================
-- STEP 2: Update user_role ENUM
-- ============================================

-- Rename old ENUM
ALTER TYPE user_role RENAME TO user_role_old;

-- Create new ENUM with only unified values
CREATE TYPE user_role AS ENUM (
  'operacional',
  'cliente',
  'socio'
);

-- Convert role_v2 column to new ENUM type (via text for safe casting)
ALTER TABLE profiles ALTER COLUMN role_v2 TYPE user_role USING (role_v2::text::user_role);

-- Drop old ENUM
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

CREATE POLICY "inventory_manage_staff" ON inventory
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "inventory_update_authenticated" ON inventory
FOR UPDATE TO authenticated
USING (TRUE)
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Product catalog policies
CREATE POLICY "Product catalog is readable by all authenticated users" ON product_catalog
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage product catalog" ON product_catalog
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "catalog_manage_staff" ON product_catalog
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

CREATE POLICY "manufacturers_manage_admin" ON manufacturers
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

CREATE POLICY "product_types_manage_admin" ON product_types
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

CREATE POLICY "agents_manage_staff" ON agents
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

CREATE POLICY "stock_locations_manage_staff" ON stock_locations
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

CREATE POLICY "company_settings_manage_admin" ON company_settings
FOR ALL TO authenticated
USING ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'))
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

-- Invoices policies
CREATE POLICY "Allow authenticated users to insert invoices" ON invoices
FOR INSERT TO authenticated
WITH CHECK ((SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio'));

CREATE POLICY "Operacional and socio can insert invoices" ON invoices
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
-- Verify migration success
-- ============================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'role_v2';

SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
