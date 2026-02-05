-- EXECUTAR MANUALMENTE NO SUPABASE SQL EDITOR
-- Para resolver: "new row violates row-level security policy for table cost_centers"

-- Adicionar policy INSERT para cost_centers
DROP POLICY IF EXISTS "Users can insert cost_centers" ON cost_centers;

CREATE POLICY "Users can insert cost_centers" ON cost_centers
FOR INSERT TO authenticated
WITH CHECK (true);

-- Adicionar policy UPDATE para cost_centers
DROP POLICY IF EXISTS "Users can update cost_centers" ON cost_centers;

CREATE POLICY "Users can update cost_centers" ON cost_centers
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Adicionar policy SELECT para cost_centers (se não existir)
DROP POLICY IF EXISTS "Users can view cost_centers" ON cost_centers;

CREATE POLICY "Users can view cost_centers" ON cost_centers
FOR SELECT TO authenticated
USING (true);

-- Verificar policies criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'cost_centers'
ORDER BY cmd;
