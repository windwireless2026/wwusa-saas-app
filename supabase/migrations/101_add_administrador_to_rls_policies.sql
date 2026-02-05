-- Migration 101: Incluir role 'administrador' em todas as políticas RLS (acesso total)
-- Permite que usuários com role_v2 = 'administrador' tenham as mesmas permissões que operacional/socio.
-- Data: 2026-02-04

-- Função auxiliar: retorna true se o usuário atual é operacional, socio ou administrador
CREATE OR REPLACE FUNCTION public.current_user_is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT role_v2 FROM public.profiles WHERE id = auth.uid()) IN ('operacional', 'socio', 'administrador');
$$;

-- =============================================================================
-- PROFILES (políticas atuais podem ser de 096; atualizar as que usam role_v2)
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can update any profile" ON public.profiles;
CREATE POLICY "Operacional and socio can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.current_user_is_staff_or_admin())
WITH CHECK (auth.uid() = id OR public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles
FOR DELETE TO authenticated
USING (public.current_user_is_staff_or_admin());

-- =============================================================================
-- INVENTORY
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage inventory" ON public.inventory;
CREATE POLICY "Operacional and socio can manage inventory" ON public.inventory
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "inventory_manage_staff" ON public.inventory;
CREATE POLICY "inventory_manage_staff" ON public.inventory
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "inventory_update_authenticated" ON public.inventory;
CREATE POLICY "inventory_update_authenticated" ON public.inventory
FOR UPDATE TO authenticated
USING (TRUE)
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- PRODUCT_CATALOG
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage product catalog" ON public.product_catalog;
CREATE POLICY "Operacional and socio can manage product catalog" ON public.product_catalog
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "catalog_manage_staff" ON public.product_catalog;
CREATE POLICY "catalog_manage_staff" ON public.product_catalog
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- MANUFACTURERS
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage manufacturers" ON public.manufacturers;
CREATE POLICY "Operacional and socio can manage manufacturers" ON public.manufacturers
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "manufacturers_manage_admin" ON public.manufacturers;
CREATE POLICY "manufacturers_manage_admin" ON public.manufacturers
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- PRODUCT_TYPES
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage product types" ON public.product_types;
CREATE POLICY "Operacional and socio can manage product types" ON public.product_types
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "product_types_manage_admin" ON public.product_types;
CREATE POLICY "product_types_manage_admin" ON public.product_types
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- AGENTS
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage agents" ON public.agents;
CREATE POLICY "Operacional and socio can manage agents" ON public.agents
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "agents_manage_staff" ON public.agents;
CREATE POLICY "agents_manage_staff" ON public.agents
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- STOCK_LOCATIONS
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage stock locations" ON public.stock_locations;
CREATE POLICY "Operacional and socio can manage stock locations" ON public.stock_locations
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "stock_locations_manage_staff" ON public.stock_locations;
CREATE POLICY "stock_locations_manage_staff" ON public.stock_locations
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- COMPANY_SETTINGS (se existir)
-- =============================================================================
DROP POLICY IF EXISTS "Operacional and socio can manage company settings" ON public.company_settings;
CREATE POLICY "Operacional and socio can manage company settings" ON public.company_settings
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "company_settings_manage_admin" ON public.company_settings;
CREATE POLICY "company_settings_manage_admin" ON public.company_settings
FOR ALL TO authenticated
USING (public.current_user_is_staff_or_admin())
WITH CHECK (public.current_user_is_staff_or_admin());

-- =============================================================================
-- INVOICES
-- =============================================================================
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON public.invoices;
CREATE POLICY "Allow authenticated users to insert invoices" ON public.invoices
FOR INSERT TO authenticated
WITH CHECK (public.current_user_is_staff_or_admin());

DROP POLICY IF EXISTS "Operacional and socio can insert invoices" ON public.invoices;
CREATE POLICY "Operacional and socio can insert invoices" ON public.invoices
FOR INSERT TO authenticated
WITH CHECK (public.current_user_is_staff_or_admin());
