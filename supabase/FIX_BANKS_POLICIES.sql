-- EXECUTAR MANUALMENTE NO SUPABASE SQL EDITOR
-- Para resolver: "Error fetching banks" em /pt/finance/bank-accounts
-- A tabela correta é bank_accounts (contas bancárias), não banks

-- Adicionar policy SELECT para bank_accounts
DROP POLICY IF EXISTS "Users can view bank_accounts" ON bank_accounts;

CREATE POLICY "Users can view bank_accounts" ON bank_accounts
FOR SELECT TO authenticated
USING (true);

-- Adicionar policy INSERT para bank_accounts
DROP POLICY IF EXISTS "Users can insert bank_accounts" ON bank_accounts;

CREATE POLICY "Users can insert bank_accounts" ON bank_accounts
FOR INSERT TO authenticated
WITH CHECK (true);

-- Adicionar policy UPDATE para bank_accounts
DROP POLICY IF EXISTS "Users can update bank_accounts" ON bank_accounts;

CREATE POLICY "Users can update bank_accounts" ON bank_accounts
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Adicionar policy DELETE para bank_accounts
DROP POLICY IF EXISTS "Users can delete bank_accounts" ON bank_accounts;

CREATE POLICY "Users can delete bank_accounts" ON bank_accounts
FOR DELETE TO authenticated
USING (true);

-- Verificar policies criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'bank_accounts'
ORDER BY cmd;
