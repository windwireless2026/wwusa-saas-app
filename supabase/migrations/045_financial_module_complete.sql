-- =====================================================
-- MÓDULO FINANCEIRO COMPLETO
-- Wind Wireless - Sistema de Gestão Financeira
-- =====================================================

-- 1. GRUPOS FINANCEIROS
-- Categorização principal (SG&A, Sócios, Despesas Operacionais, etc)
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

COMMENT ON TABLE financial_groups IS 'Grupos de classificação financeira (SG&A, Marketing, etc)';

-- 2. CATEGORIAS DRE (Gerencial)
-- Estrutura do DRE Gerencial
CREATE TABLE IF NOT EXISTS dre_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES dre_categories(id) ON DELETE SET NULL,
    category_type VARCHAR(50) NOT NULL, -- 'revenue', 'expense', 'calculation'
    formula TEXT, -- Para itens calculados como "Lucro Bruto", "EBIT", etc
    display_order INTEGER DEFAULT 0,
    is_subtotal BOOLEAN DEFAULT false,
    is_total BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE dre_categories IS 'Categorias do DRE Gerencial (Receita Bruta, CMV, Despesas Operacionais, etc)';
COMMENT ON COLUMN dre_categories.category_type IS 'Tipo: revenue (receita), expense (despesa), calculation (cálculo)';
COMMENT ON COLUMN dre_categories.formula IS 'Fórmula para cálculos (ex: lucro_bruto = receita - cmv)';

-- 3. CATEGORIAS DE BATIMENTO CAPITAL (Fluxo de Caixa)
-- Classificação para controle de capital
CREATE TABLE IF NOT EXISTS capital_flow_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    flow_type VARCHAR(50) NOT NULL, -- 'inflow', 'outflow', 'neutral'
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE capital_flow_categories IS 'Categorias de Batimento Capital (EXPENSE, PURCHASE ORDER, etc)';
COMMENT ON COLUMN capital_flow_categories.flow_type IS 'Tipo de fluxo: inflow (entrada), outflow (saída), neutral (neutro)';

-- 4. CLASSES FINANCEIRAS (Principal)
-- Cadastro completo de classes financeiras
CREATE TABLE IF NOT EXISTS financial_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    
    -- Relacionamentos
    group_id UUID REFERENCES financial_groups(id) ON DELETE SET NULL,
    dre_category_id UUID REFERENCES dre_categories(id) ON DELETE SET NULL,
    capital_flow_category_id UUID REFERENCES capital_flow_categories(id) ON DELETE SET NULL,
    
    -- Classificações adicionais
    subcategory VARCHAR(255), -- Ex: "Office Expenses:Rent", "Vehicle expenses:Insurance"
    
    -- Configurações
    is_tax_deductible BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Metadados
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(name, group_id)
);

COMMENT ON TABLE financial_classes IS 'Classes Financeiras completas com classificações DRE e Batimento Capital';

-- 5. TRANSAÇÕES FINANCEIRAS
-- Movimentações financeiras detalhadas
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classificação
    financial_class_id UUID NOT NULL REFERENCES financial_classes(id) ON DELETE RESTRICT,
    
    -- Dados da transação
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    
    -- Referências
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL, -- Fornecedor/Cliente
    invoice_number VARCHAR(100),
    payment_method VARCHAR(50), -- 'cash', 'credit_card', 'bank_transfer', etc
    
    -- Status e aprovação
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Detalhes adicionais
    notes TEXT,
    attachments JSONB, -- Array de URLs de anexos
    
    -- Recorrência
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- RRULE format
    parent_transaction_id UUID REFERENCES financial_transactions(id) ON DELETE SET NULL,
    
    -- Auditoria
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_amount CHECK (amount <> 0),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('income', 'expense'))
);

COMMENT ON TABLE financial_transactions IS 'Transações financeiras com classificação completa';
COMMENT ON COLUMN financial_transactions.transaction_type IS 'Tipo: income (receita), expense (despesa)';
COMMENT ON COLUMN financial_transactions.recurrence_rule IS 'Regra de recorrência no formato RRULE';

-- 6. ORÇAMENTOS (Budgets)
-- Planejamento financeiro
CREATE TABLE IF NOT EXISTS financial_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classificação
    financial_class_id UUID NOT NULL REFERENCES financial_classes(id) ON DELETE CASCADE,
    
    -- Período
    year INTEGER NOT NULL,
    month INTEGER, -- NULL para orçamento anual
    
    -- Valores
    budgeted_amount DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    
    -- Auditoria
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(financial_class_id, year, month),
    CONSTRAINT valid_year CHECK (year >= 2020 AND year <= 2100),
    CONSTRAINT valid_month CHECK (month IS NULL OR (month >= 1 AND month <= 12))
);

COMMENT ON TABLE financial_budgets IS 'Orçamentos financeiros por classe e período';

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Financial Groups
CREATE INDEX idx_financial_groups_active ON financial_groups(active) WHERE deleted_at IS NULL;

-- DRE Categories
CREATE INDEX idx_dre_categories_parent ON dre_categories(parent_id);
CREATE INDEX idx_dre_categories_type ON dre_categories(category_type);
CREATE INDEX idx_dre_categories_active ON dre_categories(active) WHERE deleted_at IS NULL;

-- Capital Flow Categories
CREATE INDEX idx_capital_flow_type ON capital_flow_categories(flow_type);
CREATE INDEX idx_capital_flow_active ON capital_flow_categories(active) WHERE deleted_at IS NULL;

-- Financial Classes
CREATE INDEX idx_financial_classes_group ON financial_classes(group_id);
CREATE INDEX idx_financial_classes_dre ON financial_classes(dre_category_id);
CREATE INDEX idx_financial_classes_capital ON financial_classes(capital_flow_category_id);
CREATE INDEX idx_financial_classes_active ON financial_classes(active) WHERE deleted_at IS NULL;

-- Financial Transactions
CREATE INDEX idx_transactions_class ON financial_transactions(financial_class_id);
CREATE INDEX idx_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_agent ON financial_transactions(agent_id);
CREATE INDEX idx_transactions_created_by ON financial_transactions(created_by);
CREATE INDEX idx_transactions_not_deleted ON financial_transactions(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_date_range ON financial_transactions(transaction_date, financial_class_id) WHERE deleted_at IS NULL;

-- Financial Budgets
CREATE INDEX idx_budgets_class ON financial_budgets(financial_class_id);
CREATE INDEX idx_budgets_period ON financial_budgets(year, month);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_financial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_financial_groups_updated_at
    BEFORE UPDATE ON financial_groups
    FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

CREATE TRIGGER update_dre_categories_updated_at
    BEFORE UPDATE ON dre_categories
    FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

CREATE TRIGGER update_capital_flow_categories_updated_at
    BEFORE UPDATE ON capital_flow_categories
    FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

CREATE TRIGGER update_financial_classes_updated_at
    BEFORE UPDATE ON financial_classes
    FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

CREATE TRIGGER update_financial_budgets_updated_at
    BEFORE UPDATE ON financial_budgets
    FOR EACH ROW EXECUTE FUNCTION update_financial_updated_at();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE financial_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dre_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_flow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_budgets ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários autenticados podem ler tudo
CREATE POLICY "Authenticated users can read financial_groups"
    ON financial_groups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read dre_categories"
    ON dre_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read capital_flow_categories"
    ON capital_flow_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read financial_classes"
    ON financial_classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read financial_transactions"
    ON financial_transactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read financial_budgets"
    ON financial_budgets FOR SELECT
    TO authenticated
    USING (true);

-- Políticas: Apenas admins podem criar/editar/deletar
CREATE POLICY "Admins can insert financial_groups"
    ON financial_groups FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update financial_groups"
    ON financial_groups FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can delete financial_groups"
    ON financial_groups FOR DELETE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Repetir para outras tabelas de cadastro
CREATE POLICY "Admins can insert dre_categories"
    ON dre_categories FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update dre_categories"
    ON dre_categories FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert capital_flow_categories"
    ON capital_flow_categories FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update capital_flow_categories"
    ON capital_flow_categories FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert financial_classes"
    ON financial_classes FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update financial_classes"
    ON financial_classes FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transações: qualquer usuário autenticado pode criar
CREATE POLICY "Authenticated users can insert financial_transactions"
    ON financial_transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own transactions"
    ON financial_transactions FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Orçamentos: apenas admins
CREATE POLICY "Admins can insert financial_budgets"
    ON financial_budgets FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update financial_budgets"
    ON financial_budgets FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
