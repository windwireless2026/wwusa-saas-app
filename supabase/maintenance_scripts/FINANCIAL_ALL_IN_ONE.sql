-- =====================================================
-- SCRIPT ÚNICO - ADICIONA ADMIN + MÓDULO FINANCEIRO COMPLETO
-- Execute este script de uma vez só no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PASSO 1: ADICIONAR 'ADMIN' AO ENUM (SE NÃO EXISTIR)
-- =====================================================

-- Adicionar 'admin' ao enum user_role
DO $$
BEGIN
    -- Tentar adicionar 'admin' ao enum (ignora se já existir)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
END $$;

-- Migrar super_admin para admin
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';

-- =====================================================
-- PASSO 2: CRIAR TABELAS FINANCEIRAS
-- =====================================================

-- 1. GRUPOS FINANCEIROS
CREATE TABLE IF NOT EXISTS financial_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. CATEGORIAS DRE (Gerencial)
CREATE TABLE IF NOT EXISTS dre_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES dre_categories(id) ON DELETE SET NULL,
    category_type VARCHAR(50) NOT NULL,
    formula TEXT,
    display_order INTEGER DEFAULT 0,
    is_subtotal BOOLEAN DEFAULT false,
    is_total BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. CATEGORIAS DE BATIMENTO CAPITAL
CREATE TABLE IF NOT EXISTS capital_flow_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    flow_type VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. CLASSES FINANCEIRAS (Principal)
CREATE TABLE IF NOT EXISTS financial_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    group_id UUID REFERENCES financial_groups(id) ON DELETE SET NULL,
    dre_category_id UUID REFERENCES dre_categories(id) ON DELETE SET NULL,
    capital_flow_category_id UUID REFERENCES capital_flow_categories(id) ON DELETE SET NULL,
    subcategory VARCHAR(255),
    is_tax_deductible BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(name, group_id)
);

-- 5. TRANSAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_class_id UUID NOT NULL REFERENCES financial_classes(id) ON DELETE RESTRICT,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    attachments JSONB,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    parent_transaction_id UUID REFERENCES financial_transactions(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_amount CHECK (amount <> 0),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('income', 'expense'))
);

-- 6. ORÇAMENTOS
CREATE TABLE IF NOT EXISTS financial_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_class_id UUID NOT NULL REFERENCES financial_classes(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER,
    budgeted_amount DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(financial_class_id, year, month),
    CONSTRAINT valid_year CHECK (year >= 2020 AND year <= 2100),
    CONSTRAINT valid_month CHECK (month IS NULL OR (month >= 1 AND month <= 12))
);

-- =====================================================
-- PASSO 3: ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_financial_groups_active ON financial_groups(active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dre_categories_parent ON dre_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_dre_categories_type ON dre_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_capital_flow_type ON capital_flow_categories(flow_type);
CREATE INDEX IF NOT EXISTS idx_financial_classes_group ON financial_classes(group_id);
CREATE INDEX IF NOT EXISTS idx_financial_classes_dre ON financial_classes(dre_category_id);
CREATE INDEX IF NOT EXISTS idx_financial_classes_capital ON financial_classes(capital_flow_category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_class ON financial_transactions(financial_class_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date_range ON financial_transactions(transaction_date, financial_class_id) WHERE deleted_at IS NULL;

-- =====================================================
-- PASSO 4: TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_financial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_financial_groups_updated_at ON financial_groups;
CREATE TRIGGER update_financial_groups_updated_at BEFORE UPDATE ON financial_groups FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

DROP TRIGGER IF EXISTS update_dre_categories_updated_at ON dre_categories;
CREATE TRIGGER update_dre_categories_updated_at BEFORE UPDATE ON dre_categories FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

DROP TRIGGER IF EXISTS update_capital_flow_categories_updated_at ON capital_flow_categories;
CREATE TRIGGER update_capital_flow_categories_updated_at BEFORE UPDATE ON capital_flow_categories FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

DROP TRIGGER IF EXISTS update_financial_classes_updated_at ON financial_classes;
CREATE TRIGGER update_financial_classes_updated_at BEFORE UPDATE ON financial_classes FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

DROP TRIGGER IF EXISTS update_financial_budgets_updated_at ON financial_budgets;
CREATE TRIGGER update_financial_budgets_updated_at BEFORE UPDATE ON financial_budgets FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

-- =====================================================
-- PASSO 5: RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE financial_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_flow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_budgets ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura (todos autenticados)
DROP POLICY IF EXISTS "Authenticated users can read financial_groups" ON financial_groups;
CREATE POLICY "Authenticated users can read financial_groups" ON financial_groups FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read dre_categories" ON dre_categories;
CREATE POLICY "Authenticated users can read dre_categories" ON dre_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read capital_flow_categories" ON capital_flow_categories;
CREATE POLICY "Authenticated users can read capital_flow_categories" ON capital_flow_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read financial_classes" ON financial_classes;
CREATE POLICY "Authenticated users can read financial_classes" ON financial_classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read financial_transactions" ON financial_transactions;
CREATE POLICY "Authenticated users can read financial_transactions" ON financial_transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read financial_budgets" ON financial_budgets;
CREATE POLICY "Authenticated users can read financial_budgets" ON financial_budgets FOR SELECT TO authenticated USING (true);

-- Políticas de escrita (Admins)
DROP POLICY IF EXISTS "Admins can insert financial_groups" ON financial_groups;
CREATE POLICY "Admins can insert financial_groups" ON financial_groups FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update financial_groups" ON financial_groups;
CREATE POLICY "Admins can update financial_groups" ON financial_groups FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert dre_categories" ON dre_categories;
CREATE POLICY "Admins can insert dre_categories" ON dre_categories FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update dre_categories" ON dre_categories;
CREATE POLICY "Admins can update dre_categories" ON dre_categories FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert capital_flow_categories" ON capital_flow_categories;
CREATE POLICY "Admins can insert capital_flow_categories" ON capital_flow_categories FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update capital_flow_categories" ON capital_flow_categories;
CREATE POLICY "Admins can update capital_flow_categories" ON capital_flow_categories FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert financial_classes" ON financial_classes;
CREATE POLICY "Admins can insert financial_classes" ON financial_classes FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update financial_classes" ON financial_classes;
CREATE POLICY "Admins can update financial_classes" ON financial_classes FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert financial_transactions" ON financial_transactions;
CREATE POLICY "Authenticated users can insert financial_transactions" ON financial_transactions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own transactions" ON financial_transactions;
CREATE POLICY "Users can update their own transactions" ON financial_transactions FOR UPDATE TO authenticated 
USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert financial_budgets" ON financial_budgets;
CREATE POLICY "Admins can insert financial_budgets" ON financial_budgets FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update financial_budgets" ON financial_budgets;
CREATE POLICY "Admins can update financial_budgets" ON financial_budgets FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- PASSO 6: SEED DATA (DADOS INICIAIS)
-- =====================================================

-- GRUPOS FINANCEIROS
INSERT INTO financial_groups (name, description, display_order) VALUES
('SG&A', 'Selling, General & Administrative', 1),
('Sócios', 'Despesas e operações relacionadas a sócios', 2),
('Despesas Operacionais', 'Despesas operacionais gerais', 3),
('Comissão de Vendas', 'Comissões sobre vendas', 4),
('Estoque', 'Movimentações de estoque', 5),
('Despesas Escritório', 'Despesas do escritório', 6),
('Marketing & Comercial', 'Despesas de marketing e comercial', 7),
('Manutenção Mercadoria Vendida', 'Manutenção de produtos vendidos', 8),
('Utilidades e Veículos', 'Despesas com utilidades e veículos', 9),
('Empréstimo a terceiros', 'Empréstimos concedidos', 10),
('Contas a Receber', 'Valores a receber', 11),
('CUSTO DAS MERCADORIAS VENDIDAS (CMV)', 'Custo das mercadorias vendidas', 12),
('DESPESAS DE ESCRITÓRIO', 'Despesas gerais de escritório', 13),
('DISTRIBUIÇÃO DE LUCRO', 'Distribuição de lucros', 14),
('Despesas Gerais e Administrativas (SG&A)', 'SG&A consolidado', 15)
ON CONFLICT (name) DO NOTHING;

-- CATEGORIAS DRE
INSERT INTO dre_categories (name, category_type, display_order, is_subtotal, is_total) VALUES
('Receita Bruta', 'revenue', 1, false, false),
('(-) Custo da Mercadoria Vendida (CMV)', 'expense', 2, false, false),
('(-) Manutenção Mercadoria Vendida', 'expense', 3, false, false),
('(-) Comissões', 'expense', 4, false, false),
('(-) Frete de compra de mercadorias', 'expense', 5, false, false),
('(-) Desconto / Prejuízo', 'expense', 6, false, false),
('(-) Pedidos Cancelados', 'expense', 7, false, false),
('(-) Impostos', 'expense', 8, false, false),
('LUCRO BRUTO', 'calculation', 9, true, false),
('(-) Despesas Operacionais (SG&A)', 'expense', 10, false, false),
('Outras despesas / receitas', 'expense', 11, false, false),
('(-) Participação nos Resultados', 'expense', 12, false, false),
('EBIT (Lucro Operacional)', 'calculation', 13, true, false),
('(-) Impostos sobre lucro', 'expense', 14, false, false),
('Outras Receitas', 'revenue', 15, false, false),
('Lucro Líquido', 'calculation', 16, false, true),
('Lucro Líquido %', 'calculation', 17, false, false),
('Estoque', 'neutral', 18, false, false),
('DISTRIBUIÇÃO DE LUCRO', 'expense', 19, false, false),
('Contas a Receber', 'neutral', 20, false, false)
ON CONFLICT (name) DO NOTHING;

-- CATEGORIAS BATIMENTO CAPITAL
INSERT INTO capital_flow_categories (name, flow_type, display_order) VALUES
('EXPENSE', 'outflow', 1),
('PURCHASE ORDER', 'outflow', 2),
('Empréstimo a terceiros', 'outflow', 3),
('DISTRIBUIÇÃO DE LUCRO', 'outflow', 4),
('Contas a Receber', 'inflow', 5),
('INCOME', 'inflow', 6),
('Banco', 'neutral', 7)
ON CONFLICT (name) DO NOTHING;

-- CLASSES FINANCEIRAS
DO $$
DECLARE
    v_sga_id UUID;
    v_socios_id UUID;
    v_desp_op_id UUID;
    v_comissao_id UUID;
    v_estoque_id UUID;
    v_desp_escrit_id UUID;
    v_marketing_id UUID;
    v_manut_merc_id UUID;
    v_utilidades_id UUID;
    v_emprestimo_id UUID;
    v_contas_rec_id UUID;
    v_cmv_id UUID;
    v_distrib_lucro_id UUID;
    
    v_dre_desp_op_id UUID;
    v_dre_comissoes_id UUID;
    v_dre_estoque_id UUID;
    v_dre_distrib_id UUID;
    v_dre_contas_rec_id UUID;
    v_dre_frete_id UUID;
    v_dre_participacao_id UUID;
    
    v_cap_expense_id UUID;
    v_cap_purchase_id UUID;
    v_cap_emprestimo_id UUID;
    v_cap_distrib_id UUID;
BEGIN
    SELECT id INTO v_sga_id FROM financial_groups WHERE name = 'SG&A';
    SELECT id INTO v_socios_id FROM financial_groups WHERE name = 'Sócios';
    SELECT id INTO v_desp_op_id FROM financial_groups WHERE name = 'Despesas Operacionais';
    SELECT id INTO v_comissao_id FROM financial_groups WHERE name = 'Comissão de Vendas';
    SELECT id INTO v_estoque_id FROM financial_groups WHERE name = 'Estoque';
    SELECT id INTO v_desp_escrit_id FROM financial_groups WHERE name = 'Despesas Escritório';
    SELECT id INTO v_marketing_id FROM financial_groups WHERE name = 'Marketing & Comercial';
    SELECT id INTO v_manut_merc_id FROM financial_groups WHERE name = 'Manutenção Mercadoria Vendida';
    SELECT id INTO v_utilidades_id FROM financial_groups WHERE name = 'Utilidades e Veículos';
    SELECT id INTO v_emprestimo_id FROM financial_groups WHERE name = 'Empréstimo a terceiros';
    SELECT id INTO v_contas_rec_id FROM financial_groups WHERE name = 'Contas a Receber';
    SELECT id INTO v_cmv_id FROM financial_groups WHERE name = 'CUSTO DAS MERCADORIAS VENDIDAS (CMV)';
    SELECT id INTO v_distrib_lucro_id FROM financial_groups WHERE name = 'DISTRIBUIÇÃO DE LUCRO';
    
    SELECT id INTO v_dre_desp_op_id FROM dre_categories WHERE name = '(-) Despesas Operacionais (SG&A)';
    SELECT id INTO v_dre_comissoes_id FROM dre_categories WHERE name = '(-) Comissões';
    SELECT id INTO v_dre_estoque_id FROM dre_categories WHERE name = 'Estoque';
    SELECT id INTO v_dre_distrib_id FROM dre_categories WHERE name = 'DISTRIBUIÇÃO DE LUCRO';
    SELECT id INTO v_dre_contas_rec_id FROM dre_categories WHERE name = 'Contas a Receber';
    SELECT id INTO v_dre_frete_id FROM dre_categories WHERE name = '(-) Frete de compra de mercadorias';
    SELECT id INTO v_dre_participacao_id FROM dre_categories WHERE name = '(-) Participação nos Resultados';
    
    SELECT id INTO v_cap_expense_id FROM capital_flow_categories WHERE name = 'EXPENSE';
    SELECT id INTO v_cap_purchase_id FROM capital_flow_categories WHERE name = 'PURCHASE ORDER';
    SELECT id INTO v_cap_emprestimo_id FROM capital_flow_categories WHERE name = 'Empréstimo a terceiros';
    SELECT id INTO v_cap_distrib_id FROM capital_flow_categories WHERE name = 'DISTRIBUIÇÃO DE LUCRO';
    
    INSERT INTO financial_classes (name, group_id, dre_category_id, capital_flow_category_id, subcategory, display_order) VALUES
    ('Advogado', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 1),
    ('Aluguel Escritório', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Office Expenses:Rent', 2),
    ('Aporte Socios', v_socios_id, v_dre_desp_op_id, NULL, NULL, 3),
    ('Cartão de Crédito', v_desp_op_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 4),
    ('Combustível', v_desp_op_id, v_dre_desp_op_id, v_cap_expense_id, 'Vehicle expenses:Vehicle gas & fuel', 5),
    ('Comissão de Vendas', v_comissao_id, v_dre_comissoes_id, v_cap_expense_id, 'Commissions & fees', 6),
    ('Compra de Produtos - Novos', v_estoque_id, v_dre_estoque_id, v_cap_purchase_id, NULL, 7),
    ('Compra de Produtos - Usados', v_estoque_id, v_dre_estoque_id, v_cap_purchase_id, NULL, 8),
    ('Consultoria empresarial', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Business Consultancy', 9),
    ('Contabilidade', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Business Consultancy', 10),
    ('Desbloqueio de Aparelho', v_manut_merc_id, v_dre_desp_op_id, v_cap_expense_id, 'Iphone Repairs', 11),
    ('Despesas com veículos', v_utilidades_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 12),
    ('Doação', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 13),
    ('Empréstimos a terceiros', v_emprestimo_id, v_dre_desp_op_id, v_cap_emprestimo_id, NULL, 14),
    ('Estacionamento', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Vehicle expenses:Parking & tolls', 15),
    ('Eventos Clientes', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, 'Entertainment with clients', 16),
    ('Frete', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Office expenses:Shipping & postage', 17),
    ('Frete de compra de mercadorias', v_cmv_id, v_dre_frete_id, v_cap_expense_id, 'Office expenses:Shipping & postage', 18),
    ('Limpeza Escritório', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Professional / Subcontracted Expense', 19),
    ('Manutenção Carro', v_desp_op_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 20),
    ('Mercado', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Meals:Office Meals (Cafe; water; etc)', 21),
    ('Monitoramento', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Office expenses:Security', 22),
    ('Participação nos Resultados', v_sga_id, v_dre_participacao_id, v_cap_expense_id, 'Professional / Subcontracted Expense', 23),
    ('Prestador de Serviço Interno', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Professional / Subcontracted Expense', 24),
    ('Publicidade e marketing', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, 'Advertising & marketing', 25),
    ('Recebimento a maior', v_contas_rec_id, v_dre_contas_rec_id, NULL, NULL, 26),
    ('Refeições de escritório (café, água, etc.)', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Meals:Employee''s Meals', 27),
    ('Refeições de funcionários e escritório', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Meals:Employee''s Meals', 28),
    ('Retirada Sócios', v_distrib_lucro_id, v_dre_distrib_id, v_cap_distrib_id, NULL, 29),
    ('Saga Properties (Compra Participação)', v_distrib_lucro_id, v_dre_distrib_id, v_cap_distrib_id, NULL, 30),
    ('Salário', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 31),
    ('Seguros empresariais', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Vehicle expenses:Vehicle insurance', 32),
    ('Site', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 33),
    ('Softwares e aplicativos', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Office expenses:Software & apps', 34)
    ON CONFLICT (name, group_id) DO NOTHING;
END $$;

-- =====================================================
-- VALIDAÇÃO FINAL
-- =====================================================

-- Contar registros
SELECT 'financial_groups' as tabela, COUNT(*) as total FROM financial_groups
UNION ALL
SELECT 'dre_categories', COUNT(*) FROM dre_categories
UNION ALL
SELECT 'capital_flow_categories', COUNT(*) FROM capital_flow_categories
UNION ALL
SELECT 'financial_classes', COUNT(*) FROM financial_classes;

-- Listar algumas classes
SELECT 
    fc.name as classe,
    fg.name as grupo,
    dc.name as dre,
    cf.name as batimento,
    fc.subcategory
FROM financial_classes fc
LEFT JOIN financial_groups fg ON fc.group_id = fg.id
LEFT JOIN dre_categories dc ON fc.dre_category_id = dc.id
LEFT JOIN capital_flow_categories cf ON fc.capital_flow_category_id = cf.id
ORDER BY fc.name
LIMIT 10;
