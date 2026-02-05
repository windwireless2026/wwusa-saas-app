-- EXECUTAR MANUALMENTE NO SUPABASE SQL EDITOR
-- Para resolver: "No invoices found" em /pt/finance/accounts-payable

-- ============================================
-- INVOICES (Faturas / Contas a Pagar)
-- ============================================

DROP POLICY IF EXISTS "Users can view invoices" ON invoices;

CREATE POLICY "Users can view invoices" ON invoices
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;

CREATE POLICY "Users can insert invoices" ON invoices
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update invoices" ON invoices;

CREATE POLICY "Users can update invoices" ON invoices
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

CREATE POLICY "Users can delete invoices" ON invoices
FOR DELETE TO authenticated
USING (true);

-- ============================================
-- INVOICE_ITEMS (Itens da Fatura)
-- ============================================

DROP POLICY IF EXISTS "Users can view invoice_items" ON invoice_items;

CREATE POLICY "Users can view invoice_items" ON invoice_items
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert invoice_items" ON invoice_items;

CREATE POLICY "Users can insert invoice_items" ON invoice_items
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update invoice_items" ON invoice_items;

CREATE POLICY "Users can update invoice_items" ON invoice_items
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete invoice_items" ON invoice_items;

CREATE POLICY "Users can delete invoice_items" ON invoice_items
FOR DELETE TO authenticated
USING (true);

-- ============================================
-- VERIFICAR POLICIES CRIADAS
-- ============================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('invoices', 'invoice_items')
ORDER BY tablename, cmd;
