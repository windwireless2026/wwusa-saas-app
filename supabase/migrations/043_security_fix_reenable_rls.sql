-- CRITICAL SECURITY FIX: Re-enable RLS and Apply Proper Policies
-- This migration fixes the security vulnerability from migration 038 that disabled RLS

-- ============================================
-- 1. RE-ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP ALL EXISTING POLICIES (Clean Slate)
-- ============================================

-- Profiles
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Inventory
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'inventory' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.inventory', pol.policyname);
    END LOOP;
END $$;

-- Product Catalog
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'product_catalog' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_catalog', pol.policyname);
    END LOOP;
END $$;

-- ============================================
-- 3. CREATE SECURE, ROLE-BASED POLICIES
-- ============================================

-- ------------------------------------------------
-- PROFILES TABLE
-- ------------------------------------------------

-- SELECT: All authenticated users can see all profiles
CREATE POLICY "profiles_select_authenticated" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- INSERT: Only super_admin or system (via trigger)
CREATE POLICY "profiles_insert_admin" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (
    -- Check if user is super_admin in profiles table
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- UPDATE: Own profile OR super_admin
CREATE POLICY "profiles_update_self_or_admin" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = id -- Own profile
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
)
WITH CHECK (
    auth.uid() = id
    OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- DELETE: Only super_admin (soft delete via deleted_at)
CREATE POLICY "profiles_delete_admin" 
ON public.profiles FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- ------------------------------------------------
-- INVENTORY TABLE
-- ------------------------------------------------

-- SELECT: All authenticated can view
CREATE POLICY "inventory_select_authenticated" 
ON public.inventory FOR SELECT 
TO authenticated 
USING (true);

-- INSERT/UPDATE/DELETE: super_admin, stock_manager
CREATE POLICY "inventory_manage_staff" 
ON public.inventory FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'stock_manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'stock_manager')
    )
);

-- ------------------------------------------------
-- PRODUCT CATALOG
-- ------------------------------------------------

-- SELECT: All authenticated can view
CREATE POLICY "catalog_select_authenticated" 
ON public.product_catalog FOR SELECT 
TO authenticated 
USING (true);

-- INSERT/UPDATE/DELETE: super_admin, stock_manager
CREATE POLICY "catalog_manage_staff" 
ON public.product_catalog FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'stock_manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'stock_manager')
    )
);

-- ------------------------------------------------
-- MANUFACTURERS
-- ------------------------------------------------

CREATE POLICY "manufacturers_select_all" 
ON public.manufacturers FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "manufacturers_manage_admin" 
ON public.manufacturers FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

-- ------------------------------------------------
-- PRODUCT TYPES
-- ------------------------------------------------

CREATE POLICY "product_types_select_all" 
ON public.product_types FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "product_types_manage_admin" 
ON public.product_types FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

-- ------------------------------------------------
-- AGENTS
-- ------------------------------------------------

CREATE POLICY "agents_select_authenticated" 
ON public.agents FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "agents_manage_staff" 
ON public.agents FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'stock_manager', 'finance_manager')
    )
);

-- ------------------------------------------------
-- STOCK LOCATIONS
-- ------------------------------------------------

CREATE POLICY "stock_locations_select_all" 
ON public.stock_locations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "stock_locations_manage_staff" 
ON public.stock_locations FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'stock_manager')
    )
);

-- ------------------------------------------------
-- COMPANY SETTINGS
-- ------------------------------------------------

CREATE POLICY "company_settings_select_all" 
ON public.company_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "company_settings_manage_admin" 
ON public.company_settings FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

-- ============================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================

-- This will show all tables and their RLS status
-- Run manually to verify:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control. RLS enabled.';
COMMENT ON TABLE public.inventory IS 'Device inventory with staff-level access. RLS enabled.';
COMMENT ON TABLE public.product_catalog IS 'Product catalog with admin management. RLS enabled.';
