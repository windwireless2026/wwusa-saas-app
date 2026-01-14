-- =====================================================
-- MIGRATION: BANK ACCOUNTS (Contas Bancárias)
-- Para gestão de contas bancárias, crypto e gerenciais
-- =====================================================

-- 1. Criar tabela bank_accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'Bank USA', 'Bank BR', 'Crypto', 'Cash', 'Cartao', 'Gerencial'
  account_number VARCHAR(100), -- Últimos 4 dígitos ou identificador (para exibição)
  full_account_number VARCHAR(100), -- Número completo da conta (armazenado de forma segura)
  routing_number VARCHAR(20), -- Routing number (apenas para Bank USA)
  institution VARCHAR(255), -- Nome do banco/exchange
  currency VARCHAR(10) DEFAULT 'USD', -- USD, BRL, BTC, ETH, etc
  initial_balance DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  
  -- Campos específicos para integração futura
  account_code VARCHAR(20), -- Código da conta no Chart of Accounts (1111, 1112, etc)
  link_to_chart_account UUID REFERENCES financial_classes(id) ON DELETE SET NULL,
  
  -- Crypto específico
  wallet_address VARCHAR(255),
  blockchain VARCHAR(50), -- 'Bitcoin', 'Ethereum', 'Solana', etc
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_deleted ON bank_accounts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_code ON bank_accounts(account_code);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_bank_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bank_accounts_updated_at
BEFORE UPDATE ON bank_accounts
FOR EACH ROW
EXECUTE FUNCTION update_bank_accounts_updated_at();

-- 4. Row Level Security
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura (todos autenticados)
DROP POLICY IF EXISTS "Everyone can view active bank_accounts" ON bank_accounts;
CREATE POLICY "Everyone can view active bank_accounts" ON bank_accounts 
FOR SELECT TO authenticated 
USING (deleted_at IS NULL);

-- Políticas de escrita (Admins)
DROP POLICY IF EXISTS "Admins can insert bank_accounts" ON bank_accounts;
CREATE POLICY "Admins can insert bank_accounts" ON bank_accounts 
FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update bank_accounts" ON bank_accounts;
CREATE POLICY "Admins can update bank_accounts" ON bank_accounts 
FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete bank_accounts" ON bank_accounts;
CREATE POLICY "Admins can delete bank_accounts" ON bank_accounts 
FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Comentários
COMMENT ON TABLE bank_accounts IS 'Contas bancárias, wallets crypto e contas gerenciais';
COMMENT ON COLUMN bank_accounts.account_type IS 'Tipo: Bank USA, Bank BR, Crypto, Cash, Cartao, Gerencial';
COMMENT ON COLUMN bank_accounts.currency IS 'Moeda: USD, BRL, BTC, ETH, etc';
COMMENT ON COLUMN bank_accounts.account_code IS 'Código no Chart of Accounts (ex: 1111)';

-- =====================================================
-- DADOS INICIAIS (Seed Data)
-- =====================================================

INSERT INTO bank_accounts (name, account_type, account_number, institution, currency, is_active, description) VALUES
-- Bank USA
('Bank Of America', 'Bank USA', '••3295', 'Bank of America', 'USD', true, 'Conta corrente principal'),
('Bank Of America', 'Bank USA', '••4788', 'Bank of America', 'USD', true, 'Conta poupança'),
('Chase', 'Bank USA', '••8138', 'Chase Bank', 'USD', true, 'Conta empresarial'),
('CitiBank', 'Bank USA', '••5231', 'CitiBank', 'USD', true, 'Conta investimentos'),
('Citizens', 'Bank USA', '••5244', 'Citizens Bank', 'USD', true, 'Conta secundária'),
('Mercury Checking', 'Bank USA', '••8640', 'Mercury', 'USD', true, 'Conta startup'),
('PNC', 'Bank USA', '••2797', 'PNC Bank', 'USD', true, 'Conta comercial'),
('Wells Fargo', 'Bank USA', '••0206', 'Wells Fargo', 'USD', true, 'Conta corrente'),

-- Cash
('Cash', 'Cash', NULL, NULL, 'USD', true, 'Dinheiro em caixa'),

-- Cartão
('Amex', 'Cartao', '••1004', 'American Express', 'USD', true, 'Cartão de crédito'),

-- Crypto
('Crypto', 'Crypto', '••GDAE', NULL, 'BTC', true, 'Bitcoin wallet'),
('Crypto', 'Crypto', '••LU4A', NULL, 'ETH', true, 'Ethereum wallet'),
('Crypto', 'Crypto', '••Mmhc', NULL, 'USDT', true, 'Tether wallet'),
('Crypto', 'Crypto', '••M9eq', NULL, 'BTC', true, 'Bitcoin secundário'),
('Crypto', 'Crypto', '••TAwa', NULL, 'SOL', true, 'Solana wallet'),
('Crypto', 'Crypto', '••xZh3', NULL, 'ETH', true, 'Ethereum secundário'),

-- Bank BR
('RMA', 'Bank BR', NULL, 'Banco do Brasil', 'BRL', true, 'Conta Brasil'),
('Bradesco', 'Bank BR', NULL, 'Bradesco', 'BRL', true, 'Conta Bradesco'),
('Estoque Brasil', 'Bank BR', NULL, NULL, 'BRL', true, 'Estoque BRL'),

-- Gerencial
('Desconto', 'Gerencial', NULL, NULL, 'USD', true, 'Conta gerencial de descontos'),
('Adiantamento', 'Gerencial', NULL, NULL, 'USD', true, 'Adiantamentos a funcionários'),
('Prejuízo', 'Gerencial', NULL, NULL, 'USD', true, 'Registro de prejuízos'),
('Sócios', 'Gerencial', NULL, NULL, 'USD', true, 'Movimentação sócios'),
('Clientes', 'Gerencial', NULL, NULL, 'USD', true, 'Contas a receber'),
('Ativo', 'Gerencial', NULL, NULL, 'USD', true, 'Ativos gerenciais'),
('Pagamentos', 'Gerencial', NULL, NULL, 'USD', true, 'Contas a pagar'),
('Venda de produtos - Cancelado', 'Gerencial', NULL, NULL, 'USD', true, 'Vendas canceladas')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VALIDAÇÃO
-- =====================================================

-- Ver contas por tipo
SELECT 
    account_type,
    COUNT(*) as total_contas,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as ativas
FROM bank_accounts
WHERE deleted_at IS NULL
GROUP BY account_type
ORDER BY account_type;

-- Ver todas as contas
SELECT 
    name as conta,
    account_type as tipo,
    account_number as numero,
    institution as instituicao,
    currency as moeda,
    CASE WHEN is_active THEN 'Ativa' ELSE 'Inativa' END as status
FROM bank_accounts
WHERE deleted_at IS NULL
ORDER BY account_type, name;
