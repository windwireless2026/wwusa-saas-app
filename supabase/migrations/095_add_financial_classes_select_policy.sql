-- Adicionar policy SELECT faltante para financial_classes
-- Permitir que todos os usuários autenticados possam visualizar o plano de contas

-- Verificar se já existe
DROP POLICY IF EXISTS "Users can view financial_classes" ON financial_classes;

-- Criar policy de SELECT
CREATE POLICY "Users can view financial_classes" ON financial_classes
FOR SELECT TO authenticated
USING (true);

-- Verificação
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'financial_classes' AND cmd = 'SELECT';
