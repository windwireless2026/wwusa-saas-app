-- EXECUTAR MANUALMENTE NO SUPABASE SQL EDITOR
-- Para resolver: "Nenhuma conta encontrada" em /pt/finance/chart-of-accounts

-- Adicionar policy SELECT para financial_classes
DROP POLICY IF EXISTS "Users can view financial_classes" ON financial_classes;

CREATE POLICY "Users can view financial_classes" ON financial_classes
FOR SELECT TO authenticated
USING (true);

-- Verificar se foi criado
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'financial_classes' AND cmd = 'SELECT';
