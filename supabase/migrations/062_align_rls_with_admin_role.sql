-- =====================================================
-- ALINHAMENTO DE SEGURANÇA: Atualizar RLS para o novo papel 'admin'
-- =====================================================

-- 1. Inventory Table
DROP POLICY IF EXISTS "inventory_manage_staff" ON public.inventory;
CREATE POLICY "inventory_manage_staff" 
ON public.inventory FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager')
    )
);

-- 2. Profiles Table
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = id 
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    auth.uid() = id
    OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" 
ON public.profiles FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- 3. Product Catalog
DROP POLICY IF EXISTS "catalog_manage_staff" ON public.product_catalog;
CREATE POLICY "catalog_manage_staff" 
ON public.product_catalog FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager')
    )
);

-- 4. Manufacturers
DROP POLICY IF EXISTS "manufacturers_manage_admin" ON public.manufacturers;
CREATE POLICY "manufacturers_manage_admin" 
ON public.manufacturers FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 5. Product Types
DROP POLICY IF EXISTS "product_types_manage_admin" ON public.product_types;
CREATE POLICY "product_types_manage_admin" 
ON public.product_types FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 6. Agents
DROP POLICY IF EXISTS "agents_manage_staff" ON public.agents;
CREATE POLICY "agents_manage_staff" 
ON public.agents FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager', 'finance_manager')
    )
);

-- 7. Stock Locations
DROP POLICY IF EXISTS "stock_locations_manage_staff" ON public.stock_locations;
CREATE POLICY "stock_locations_manage_staff" 
ON public.stock_locations FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager')
    )
);

-- 8. Company Settings
DROP POLICY IF EXISTS "company_settings_manage_admin" ON public.company_settings;
CREATE POLICY "company_settings_manage_admin" 
ON public.company_settings FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 9. Invoices & Cost Centers (Ensure consistency)
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON public.invoices;
CREATE POLICY "Allow authenticated users to insert invoices"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'finance_manager')
    )
);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
