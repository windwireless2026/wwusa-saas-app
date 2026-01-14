-- =====================================================
-- FIX: Add INSERT policy for inventory table
-- =====================================================
-- The current FOR ALL policy requires admin/stock_manager role
-- We need authenticated users to be able to INSERT items

-- Add INSERT policy for authenticated users
DROP POLICY IF EXISTS "inventory_insert_authenticated" ON public.inventory;
CREATE POLICY "inventory_insert_authenticated" 
ON public.inventory FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Add UPDATE policy for authenticated users (owner or staff)
DROP POLICY IF EXISTS "inventory_update_authenticated" ON public.inventory;
CREATE POLICY "inventory_update_authenticated" 
ON public.inventory FOR UPDATE 
TO authenticated 
USING (
    created_by = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'stock_manager')
    )
)
WITH CHECK (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
