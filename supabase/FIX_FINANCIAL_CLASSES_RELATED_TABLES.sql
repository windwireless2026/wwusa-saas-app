-- EXECUTAR MANUALMENTE NO SUPABASE SQL EDITOR
-- Para resolver dropdowns vazios em "Editar Classe Financeira"
-- Tabelas relacionadas: financial_groups, dre_categories, capital_flow_categories

-- ============================================
-- FINANCIAL_GROUPS (Grupo Financeiro)
-- ============================================

DROP POLICY IF EXISTS "Users can view financial_groups" ON financial_groups;

CREATE POLICY "Users can view financial_groups" ON financial_groups
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert financial_groups" ON financial_groups;

CREATE POLICY "Users can insert financial_groups" ON financial_groups
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update financial_groups" ON financial_groups;

CREATE POLICY "Users can update financial_groups" ON financial_groups
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete financial_groups" ON financial_groups;

CREATE POLICY "Users can delete financial_groups" ON financial_groups
FOR DELETE TO authenticated
USING (true);

-- ============================================
-- DRE_CATEGORIES (Categoria DRE)
-- ============================================

DROP POLICY IF EXISTS "Users can view dre_categories" ON dre_categories;

CREATE POLICY "Users can view dre_categories" ON dre_categories
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert dre_categories" ON dre_categories;

CREATE POLICY "Users can insert dre_categories" ON dre_categories
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update dre_categories" ON dre_categories;

CREATE POLICY "Users can update dre_categories" ON dre_categories
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete dre_categories" ON dre_categories;

CREATE POLICY "Users can delete dre_categories" ON dre_categories
FOR DELETE TO authenticated
USING (true);

-- ============================================
-- CAPITAL_FLOW_CATEGORIES (Batimento de Capital)
-- ============================================

DROP POLICY IF EXISTS "Users can view capital_flow_categories" ON capital_flow_categories;

CREATE POLICY "Users can view capital_flow_categories" ON capital_flow_categories
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert capital_flow_categories" ON capital_flow_categories;

CREATE POLICY "Users can insert capital_flow_categories" ON capital_flow_categories
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update capital_flow_categories" ON capital_flow_categories;

CREATE POLICY "Users can update capital_flow_categories" ON capital_flow_categories
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete capital_flow_categories" ON capital_flow_categories;

CREATE POLICY "Users can delete capital_flow_categories" ON capital_flow_categories
FOR DELETE TO authenticated
USING (true);

-- ============================================
-- VERIFICAR POLICIES CRIADAS
-- ============================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('financial_groups', 'dre_categories', 'capital_flow_categories')
ORDER BY tablename, cmd;
