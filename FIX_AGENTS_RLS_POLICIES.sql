-- ============================================
-- FIX AGENTS RLS POLICIES
-- ============================================
-- Políticas de segurança para tabela agents
-- Permite que usuários autenticados gerenciem agentes

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view agents from their company" ON agents;
DROP POLICY IF EXISTS "Users can insert agents to their company" ON agents;
DROP POLICY IF EXISTS "Users can update agents from their company" ON agents;
DROP POLICY IF EXISTS "Users can delete agents from their company" ON agents;
DROP POLICY IF EXISTS "Authenticated users can view agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can insert agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can update agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can delete agents" ON agents;
DROP POLICY IF EXISTS "Agents is readable by all authenticated users" ON agents;
DROP POLICY IF EXISTS "Operacional and socio can manage agents" ON agents;
DROP POLICY IF EXISTS "agents_manage_staff" ON agents;

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- SELECT: Ver agentes (usuários autenticados)
CREATE POLICY "Authenticated users can view agents"
ON agents
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Criar agentes (usuários autenticados)
CREATE POLICY "Authenticated users can insert agents"
ON agents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Atualizar agentes (usuários autenticados)
CREATE POLICY "Authenticated users can update agents"
ON agents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Deletar agentes (usuários autenticados)
CREATE POLICY "Authenticated users can delete agents"
ON agents
FOR DELETE
TO authenticated
USING (true);

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'agents'
ORDER BY policyname;
