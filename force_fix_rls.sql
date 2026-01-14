-- FORÇA a correção das políticas RLS para product_catalog e profiles
-- Execute este script NO SUPABASE SQL EDITOR

-- ============================================
-- PRODUCT_CATALOG - Remover políticas antigas
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated to view product_catalog" ON public.product_catalog;
DROP POLICY IF EXISTS "Allow authenticated to manage product_catalog" ON public.product_catalog;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_catalog;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_catalog;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.product_catalog;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.product_catalog;

-- Criar políticas SIMPLIFICADAS para product_catalog
CREATE POLICY "authenticated_select_product_catalog" 
ON public.product_catalog 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "authenticated_insert_product_catalog" 
ON public.product_catalog 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "authenticated_update_product_catalog" 
ON public.product_catalog 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_product_catalog" 
ON public.product_catalog 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================
-- PROFILES - Remover políticas antigas
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;

-- Criar políticas SIMPLIFICADAS para profiles
-- Permitir que usuários autenticados vejam TODOS os perfis
CREATE POLICY "authenticated_select_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "authenticated_insert_profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "authenticated_update_profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Ver todas as políticas criadas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('product_catalog', 'profiles')
ORDER BY tablename, cmd;

-- Testar se você consegue ver os dados agora
SELECT COUNT(*) as total_produtos FROM public.product_catalog WHERE deleted_at IS NULL;
SELECT COUNT(*) as total_usuarios FROM public.profiles;
