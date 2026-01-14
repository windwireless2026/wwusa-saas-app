-- =====================================================
-- FIX: Restore SELECT permissions for product_catalog
-- =====================================================
-- The catalog_manage_staff policy (FOR ALL) is too restrictive
-- We need a separate SELECT policy for read access

-- Drop and recreate the SELECT policy to ensure it exists
DROP POLICY IF EXISTS "catalog_select_authenticated" ON public.product_catalog;

CREATE POLICY "catalog_select_authenticated" 
ON public.product_catalog FOR SELECT 
TO authenticated 
USING (true);

-- Also fix manufacturers (same issue)
DROP POLICY IF EXISTS "manufacturers_select_all" ON public.manufacturers;
CREATE POLICY "manufacturers_select_all" 
ON public.manufacturers FOR SELECT 
TO authenticated 
USING (true);

-- Also fix product_types (same issue)
DROP POLICY IF EXISTS "product_types_select_all" ON public.product_types;
CREATE POLICY "product_types_select_all" 
ON public.product_types FOR SELECT 
TO authenticated 
USING (true);

-- Also fix inventory (same issue)
DROP POLICY IF EXISTS "inventory_select_authenticated" ON public.inventory;
CREATE POLICY "inventory_select_authenticated" 
ON public.inventory FOR SELECT 
TO authenticated 
USING (true);

-- Also fix agents (same issue)
DROP POLICY IF EXISTS "agents_select_authenticated" ON public.agents;
CREATE POLICY "agents_select_authenticated" 
ON public.agents FOR SELECT 
TO authenticated 
USING (true);

-- Also fix stock_locations (same issue)
DROP POLICY IF EXISTS "stock_locations_select_all" ON public.stock_locations;
CREATE POLICY "stock_locations_select_all" 
ON public.stock_locations FOR SELECT 
TO authenticated 
USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
