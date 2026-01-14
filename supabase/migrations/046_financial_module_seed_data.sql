-- =====================================================
-- DADOS INICIAIS DO MÓDULO FINANCEIRO
-- Baseado na planilha fornecida
-- =====================================================

-- =====================================================
-- 1. GRUPOS FINANCEIROS
-- =====================================================
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

-- =====================================================
-- 2. CATEGORIAS DRE (GERENCIAL)
-- =====================================================
INSERT INTO dre_categories (name, category_type, display_order, is_subtotal, is_total) VALUES
-- Receitas
('Receita Bruta', 'revenue', 1, false, false),
('(-) Custo da Mercadoria Vendida (CMV)', 'expense', 2, false, false),
('(-) Manutenção Mercadoria Vendida', 'expense', 3, false, false),
('(-) Comissões', 'expense', 4, false, false),
('(-) Frete de compra de mercadorias', 'expense', 5, false, false),
('(-) Desconto / Prejuízo', 'expense', 6, false, false),
('(-) Pedidos Cancelados', 'expense', 7, false, false),
('(-) Impostos', 'expense', 8, false, false),
('LUCRO BRUTO', 'calculation', 9, true, false),

-- Despesas Operacionais
('(-) Despesas Operacionais (SG&A)', 'expense', 10, false, false),
('Outras despesas / receitas', 'expense', 11, false, false),
('(-) Participação nos Resultados', 'expense', 12, false, false),
('EBIT (Lucro Operacional)', 'calculation', 13, true, false),

-- Impostos e Lucro Final
('(-) Impostos sobre lucro', 'expense', 14, false, false),
('Outras Receitas', 'revenue', 15, false, false),
('Lucro Líquido', 'calculation', 16, false, true),
('Lucro Líquido %', 'calculation', 17, false, false),

-- Outros
('Estoque', 'neutral', 18, false, false),
('DISTRIBUIÇÃO DE LUCRO', 'expense', 19, false, false),
('Contas a Receber', 'neutral', 20, false, false)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. CATEGORIAS DE BATIMENTO CAPITAL
-- =====================================================
INSERT INTO capital_flow_categories (name, flow_type, display_order) VALUES
('EXPENSE', 'outflow', 1),
('PURCHASE ORDER', 'outflow', 2),
('Empréstimo a terceiros', 'outflow', 3),
('DISTRIBUIÇÃO DE LUCRO', 'outflow', 4),
('Contas a Receber', 'inflow', 5),
('INCOME', 'inflow', 6),
('Banco', 'neutral', 7)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. CLASSES FINANCEIRAS
-- Baseadas na planilha Excel fornecida
-- =====================================================

-- Obtendo IDs dos grupos (será usado nos inserts)
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
    
    v_cap_expense_id UUID;
    v_cap_purchase_id UUID;
    v_cap_emprestimo_id UUID;
    v_cap_distrib_id UUID;
    v_cap_contas_rec_id UUID;
BEGIN
    -- Buscar IDs dos grupos
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
    
    -- Buscar IDs das categorias DRE
    SELECT id INTO v_dre_desp_op_id FROM dre_categories WHERE name = '(-) Despesas Operacionais (SG&A)';
    SELECT id INTO v_dre_comissoes_id FROM dre_categories WHERE name = '(-) Comissões';
    SELECT id INTO v_dre_estoque_id FROM dre_categories WHERE name = 'Estoque';
    SELECT id INTO v_dre_distrib_id FROM dre_categories WHERE name = 'DISTRIBUIÇÃO DE LUCRO';
    SELECT id INTO v_dre_contas_rec_id FROM dre_categories WHERE name = 'Contas a Receber';
    
    -- Buscar IDs das categorias de Batimento Capital
    SELECT id INTO v_cap_expense_id FROM capital_flow_categories WHERE name = 'EXPENSE';
    SELECT id INTO v_cap_purchase_id FROM capital_flow_categories WHERE name = 'PURCHASE ORDER';
    SELECT id INTO v_cap_emprestimo_id FROM capital_flow_categories WHERE name = 'Empréstimo a terceiros';
    SELECT id INTO v_cap_distrib_id FROM capital_flow_categories WHERE name = 'DISTRIBUIÇÃO DE LUCRO';
    SELECT id INTO v_cap_contas_rec_id FROM capital_flow_categories WHERE name = 'Contas a Receber';
    
    -- Inserir Classes Financeiras
    INSERT INTO financial_classes (name, group_id, dre_category_id, capital_flow_category_id, subcategory, display_order) VALUES
    -- SG&A
    ('Advogado', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 1),
    ('Aluguel Escritório', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Office Expenses:Rent', 2),
    ('Consultoria empresarial', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Business Consultancy', 3),
    ('Contabilidade', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Business Consultancy', 4),
    ('Frete', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Office expenses:Shipping & postage', 5),
    ('Limpeza Escritório', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Professional / Subcontracted Expense', 6),
    ('Prestador de Serviço Interno', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Professional / Subcontracted Expense', 7),
    ('Publicidade e marketing', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, 'Advertising & marketing', 8),
    ('Salário', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 9),
    ('Seguros empresariais', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Vehicle expenses:Vehicle insurance', 10),
    ('Site', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 11),
    ('Softwares e aplicativos', v_sga_id, v_dre_desp_op_id, v_cap_expense_id, 'Office expenses:Software & apps', 12),
    
    -- Sócios
    ('Aporte Socios', v_socios_id, v_dre_desp_op_id, NULL, NULL, 13),
    
    -- Despesas Operacionais diversas
    ('Cartão de Crédito', v_desp_op_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 14),
    ('Combustível', v_desp_op_id, v_dre_desp_op_id, v_cap_expense_id, 'Vehicle expenses:Vehicle gas & fuel', 15),
    ('Compra de Produtos - Novos', v_estoque_id, v_dre_estoque_id, v_cap_purchase_id, NULL, 16),
    ('Compra de Produtos - Usados', v_estoque_id, v_dre_estoque_id, v_cap_purchase_id, NULL, 17),
    ('Desbloqueio de Aparelho', v_manut_merc_id, v_dre_desp_op_id, v_cap_expense_id, 'Iphone Repairs', 18),
    ('Despesas com veículos', v_utilidades_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 19),
    ('Doação', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 20),
    ('Empréstimos a terceiros', v_emprestimo_id, v_dre_desp_op_id, v_cap_emprestimo_id, NULL, 21),
    ('Estacionamento', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Vehicle expenses:Parking & tolls', 22),
    ('Eventos Clientes', v_marketing_id, v_dre_desp_op_id, v_cap_expense_id, 'Entertainment with clients', 23),
    ('Frete de compra de mercadorias', v_cmv_id, (SELECT id FROM dre_categories WHERE name = '(-) Frete de compra de mercadorias'), v_cap_expense_id, 'Office expenses:Shipping & postage', 24),
    ('Manutenção Carro', v_desp_op_id, v_dre_desp_op_id, v_cap_expense_id, NULL, 25),
    ('Mercado', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Meals:Office Meals (Cafe; water; etc)', 26),
    ('Monitoramento', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Office expenses:Security', 27),
    ('Participação nos Resultados', v_sga_id, (SELECT id FROM dre_categories WHERE name = '(-) Participação nos Resultados'), v_cap_expense_id, 'Professional / Subcontracted Expense', 28),
    ('Recebimento a maior', v_contas_rec_id, v_dre_contas_rec_id, NULL, NULL, 29),
    ('Refeições de escritório (café, água, etc.)', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Meals:Employee''s Meals', 30),
    ('Refeições de funcionários e escritório', v_desp_escrit_id, v_dre_desp_op_id, v_cap_expense_id, 'Meals:Employee''s Meals', 31),
    ('Retirada Sócios', v_distrib_lucro_id, v_dre_distrib_id, v_cap_distrib_id, NULL, 32),
    ('Saga Properties (Compra Participação)', v_distrib_lucro_id, v_dre_distrib_id, v_cap_distrib_id, NULL, 33),
    
    -- Comissões
    ('Comissão de Vendas', v_comissao_id, v_dre_comissoes_id, v_cap_expense_id, 'Commissions & fees', 34)
    
    ON CONFLICT (name, group_id) DO NOTHING;
END $$;
