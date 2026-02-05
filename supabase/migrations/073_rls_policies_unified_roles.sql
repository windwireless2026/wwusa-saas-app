-- Migration 073: Update RLS policies to use role_v2 (unified roles)
-- This migration recreates all RLS policies using the new role_v2 column
-- Role hierarchy: socio > operacional > cliente

-- Drop old policies (will be recreated with role_v2)
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create new profiles policies using role_v2
CREATE POLICY "Profiles are readable by authenticated users" ON profiles
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Operacional and socio can update any profile" ON profiles
FOR UPDATE TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Inventory policies
DROP POLICY IF EXISTS "Inventory is readable by authenticated users" ON inventory;
DROP POLICY IF EXISTS "Operacional can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;

CREATE POLICY "Inventory is readable by authenticated users" ON inventory
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage inventory" ON inventory
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Product catalog policies
DROP POLICY IF EXISTS "Product catalog is readable by all authenticated users" ON product_catalog;
DROP POLICY IF EXISTS "Operacional can manage product catalog" ON product_catalog;
DROP POLICY IF EXISTS "Admins can manage product catalog" ON product_catalog;

CREATE POLICY "Product catalog is readable by all authenticated users" ON product_catalog
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage product catalog" ON product_catalog
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Manufacturers policies
DROP POLICY IF EXISTS "Manufacturers is readable by all authenticated users" ON manufacturers;
DROP POLICY IF EXISTS "Operacional can manage manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Admins can manage manufacturers" ON manufacturers;

CREATE POLICY "Manufacturers is readable by all authenticated users" ON manufacturers
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage manufacturers" ON manufacturers
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Product types policies
DROP POLICY IF EXISTS "Product types is readable by all authenticated users" ON product_types;
DROP POLICY IF EXISTS "Operacional can manage product types" ON product_types;
DROP POLICY IF EXISTS "Admins can manage product types" ON product_types;

CREATE POLICY "Product types is readable by all authenticated users" ON product_types
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage product types" ON product_types
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Agents policies
DROP POLICY IF EXISTS "Agents is readable by all authenticated users" ON agents;
DROP POLICY IF EXISTS "Operacional can manage agents" ON agents;
DROP POLICY IF EXISTS "Admins can manage agents" ON agents;

CREATE POLICY "Agents is readable by all authenticated users" ON agents
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage agents" ON agents
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Stock locations policies
DROP POLICY IF EXISTS "Stock locations is readable by authenticated users" ON stock_locations;
DROP POLICY IF EXISTS "Operacional can manage stock locations" ON stock_locations;
DROP POLICY IF EXISTS "Admins can manage stock locations" ON stock_locations;

CREATE POLICY "Stock locations is readable by authenticated users" ON stock_locations
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage stock locations" ON stock_locations
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);

-- Company settings policies
DROP POLICY IF EXISTS "Company settings is readable by authenticated users" ON company_settings;
DROP POLICY IF EXISTS "Operacional can manage company settings" ON company_settings;
DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;

CREATE POLICY "Company settings is readable by authenticated users" ON company_settings
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Operacional and socio can manage company settings" ON company_settings
FOR ALL TO authenticated
USING (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
)
WITH CHECK (
  (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
);
