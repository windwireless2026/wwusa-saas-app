-- Script para verificar e corrigir as políticas RLS das tabelas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas atuais da product_catalog
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'product_catalog';

-- 2. Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_catalog', 'users', 'profiles');

-- 3. Criar/atualizar políticas para product_catalog permitir leitura para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated to view product_catalog" ON public.product_catalog;
CREATE POLICY "Allow authenticated to view product_catalog" 
ON public.product_catalog 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated to manage product_catalog" ON public.product_catalog;
CREATE POLICY "Allow authenticated to manage product_catalog" 
ON public.product_catalog 
FOR ALL 
TO authenticated 
USING (true);

-- 4. Verificar se as políticas foram criadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'product_catalog';
