-- =====================================================
-- MIGRATION: GAAP-COMPLIANT CHART OF ACCOUNTS
-- Wind Wireless LLC - Wholesale/Retail Electronics
-- Following US GAAP Standards
-- =====================================================

-- 1. Adicionar campos GAAP às financial_classes
ALTER TABLE financial_classes 
ADD COLUMN IF NOT EXISTS account_code VARCHAR(10) UNIQUE,
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS account_subtype VARCHAR(50),
ADD COLUMN IF NOT EXISTS parent_account_id UUID REFERENCES financial_classes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS normal_balance VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_contra BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_summary BOOLEAN DEFAULT false;

-- 2. Criar ENUM para account_type (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type_enum') THEN
        CREATE TYPE account_type_enum AS ENUM (
            'Asset',
            'Liability', 
            'Equity',
            'Revenue',
            'Expense'
        );
    END IF;
END $$;

-- 3. Criar ENUM para normal_balance
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'normal_balance_enum') THEN
        CREATE TYPE normal_balance_enum AS ENUM ('Debit', 'Credit');
    END IF;
END $$;

-- 4. Adicionar constraints e índices
CREATE INDEX IF NOT EXISTS idx_financial_classes_account_code ON financial_classes(account_code);
CREATE INDEX IF NOT EXISTS idx_financial_classes_account_type ON financial_classes(account_type);
CREATE INDEX IF NOT EXISTS idx_financial_classes_parent ON financial_classes(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_financial_classes_level ON financial_classes(level);

-- 5. Adicionar comentários
COMMENT ON COLUMN financial_classes.account_code IS 'GAAP account code (e.g., 4000, 4010)';
COMMENT ON COLUMN financial_classes.account_type IS 'Asset, Liability, Equity, Revenue, or Expense';
COMMENT ON COLUMN financial_classes.account_subtype IS 'Subcategory (e.g., Current Asset, Fixed Asset)';
COMMENT ON COLUMN financial_classes.parent_account_id IS 'Parent account for hierarchical structure';
COMMENT ON COLUMN financial_classes.normal_balance IS 'Debit or Credit';
COMMENT ON COLUMN financial_classes.is_contra IS 'True for contra accounts (e.g., Accumulated Depreciation)';
COMMENT ON COLUMN financial_classes.level IS 'Hierarchy level (1 = top level)';
COMMENT ON COLUMN financial_classes.is_summary IS 'True if account is summary only (has children)';

-- =====================================================
-- CHART OF ACCOUNTS - WIND WIRELESS LLC
-- Wholesale/Retail Electronics Business
-- =====================================================

-- Limpar dados de teste antigos (cuidado: só fazer na primeira instalação!)
-- DELETE FROM financial_classes WHERE account_code IS NULL;

-- ASSETS (1000-1999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('1000', 'ASSETS', 'Asset', 'Summary', 'Debit', 1, true, true),
('1100', 'Current Assets', 'Asset', 'Current Asset', 'Debit', 2, true, true),
('1110', 'Cash and Cash Equivalents', 'Asset', 'Current Asset', 'Debit', 3, true, true),
('1111', 'Cash - Operating Account', 'Asset', 'Current Asset', 'Debit', 4, false, true),
('1112', 'Cash - Savings', 'Asset', 'Current Asset', 'Debit', 4, false, true),
('1113', 'Cash - Crypto Wallet', 'Asset', 'Current Asset', 'Debit', 4, false, true),
('1120', 'Accounts Receivable', 'Asset', 'Current Asset', 'Debit', 3, true, true),
('1121', 'Accounts Receivable - Trade', 'Asset', 'Current Asset', 'Debit', 4, false, true),
('1129', 'Allowance for Doubtful Accounts', 'Asset', 'Current Asset', 'Credit', 4, false, true),
('1150', 'Inventory', 'Asset', 'Current Asset', 'Debit', 3, true, true),
('1151', 'Inventory - New Products', 'Asset', 'Current Asset', 'Debit', 4, false, true),
('1152', 'Inventory - Used Products', 'Asset', 'Current Asset', 'Debit', 4, false, true),
('1160', 'Prepaid Expenses', 'Asset', 'Current Asset', 'Debit', 3, false, true),
('1200', 'Fixed Assets', 'Asset', 'Fixed Asset', 'Debit', 2, true, true),
('1210', 'Equipment', 'Asset', 'Fixed Asset', 'Debit', 3, false, true),
('1220', 'Furniture & Fixtures', 'Asset', 'Fixed Asset', 'Debit', 3, false, true),
('1230', 'Vehicles', 'Asset', 'Fixed Asset', 'Debit', 3, false, true),
('1299', 'Accumulated Depreciation', 'Asset', 'Fixed Asset', 'Credit', 3, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for Assets
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1000') WHERE account_code = '1100';
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1000') WHERE account_code = '1200';
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1100') WHERE account_code IN ('1110', '1120', '1150', '1160');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1110') WHERE account_code IN ('1111', '1112', '1113');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1120') WHERE account_code IN ('1121', '1129');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1150') WHERE account_code IN ('1151', '1152');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '1200') WHERE account_code IN ('1210', '1220', '1230', '1299');
UPDATE financial_classes SET is_contra = true WHERE account_code IN ('1129', '1299');

-- LIABILITIES (2000-2999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('2000', 'LIABILITIES', 'Liability', 'Summary', 'Credit', 1, true, true),
('2100', 'Current Liabilities', 'Liability', 'Current Liability', 'Credit', 2, true, true),
('2110', 'Accounts Payable', 'Liability', 'Current Liability', 'Credit', 3, false, true),
('2120', 'Accrued Expenses', 'Liability', 'Current Liability', 'Credit', 3, false, true),
('2130', 'Sales Tax Payable', 'Liability', 'Current Liability', 'Credit', 3, false, true),
('2140', 'Payroll Liabilities', 'Liability', 'Current Liability', 'Credit', 3, false, true),
('2150', 'Credit Card Payable', 'Liability', 'Current Liability', 'Credit', 3, false, true),
('2200', 'Long-term Liabilities', 'Liability', 'Long-term Liability', 'Credit', 2, true, true),
('2210', 'Notes Payable', 'Liability', 'Long-term Liability', 'Credit', 3, false, true),
('2220', 'Loans Payable', 'Liability', 'Long-term Liability', 'Credit', 3, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for Liabilities
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '2000') WHERE account_code IN ('2100', '2200');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '2100') WHERE account_code IN ('2110', '2120', '2130', '2140', '2150');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '2200') WHERE account_code IN ('2210', '2220');

-- EQUITY (3000-3999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('3000', 'EQUITY', 'Equity', 'Summary', 'Credit', 1, true, true),
('3100', 'Owner''s Capital', 'Equity', 'Capital', 'Credit', 2, true, true),
('3110', 'Capital - Lupari', 'Equity', 'Capital', 'Credit', 3, false, true),
('3120', 'Capital - Victorem', 'Equity', 'Capital', 'Credit', 3, false, true),
('3200', 'Owner Distributions', 'Equity', 'Distributions', 'Debit', 2, true, true),
('3210', 'Distributions - Lupari', 'Equity', 'Distributions', 'Debit', 3, false, true),
('3220', 'Distributions - Victorem', 'Equity', 'Distributions', 'Debit', 3, false, true),
('3300', 'Retained Earnings', 'Equity', 'Retained Earnings', 'Credit', 2, false, true),
('3900', 'Current Year Earnings', 'Equity', 'Net Income', 'Credit', 2, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for Equity
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '3000') WHERE account_code IN ('3100', '3200', '3300', '3900');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '3100') WHERE account_code IN ('3110', '3120');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '3200') WHERE account_code IN ('3210', '3220');

-- REVENUE (4000-4999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('4000', 'REVENUE', 'Revenue', 'Summary', 'Credit', 1, true, true),
('4100', 'Sales Revenue', 'Revenue', 'Operating Revenue', 'Credit', 2, true, true),
('4110', 'Sales - New Products', 'Revenue', 'Operating Revenue', 'Credit', 3, false, true),
('4120', 'Sales - Used Products', 'Revenue', 'Operating Revenue', 'Credit', 3, false, true),
('4130', 'Service Revenue', 'Revenue', 'Operating Revenue', 'Credit', 3, false, true),
('4140', 'Repair Revenue', 'Revenue', 'Operating Revenue', 'Credit', 3, false, true),
('4900', 'Other Income', 'Revenue', 'Non-Operating Revenue', 'Credit', 2, true, true),
('4910', 'Interest Income', 'Revenue', 'Non-Operating Revenue', 'Credit', 3, false, true),
('4920', 'Gain on Sale of Assets', 'Revenue', 'Non-Operating Revenue', 'Credit', 3, false, true),
('4930', 'Miscellaneous Income', 'Revenue', 'Non-Operating Revenue', 'Credit', 3, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for Revenue
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '4000') WHERE account_code IN ('4100', '4900');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '4100') WHERE account_code IN ('4110', '4120', '4130', '4140');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '4900') WHERE account_code IN ('4910', '4920', '4930');

-- COST OF GOODS SOLD (5000-5999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('5000', 'COST OF GOODS SOLD', 'Expense', 'COGS', 'Debit', 1, true, true),
('5100', 'Product Costs', 'Expense', 'COGS', 'Debit', 2, true, true),
('5110', 'COGS - New Products', 'Expense', 'COGS', 'Debit', 3, false, true),
('5120', 'COGS - Used Products', 'Expense', 'COGS', 'Debit', 3, false, true),
('5200', 'Freight & Shipping In', 'Expense', 'COGS', 'Debit', 2, false, true),
('5300', 'Purchase Returns', 'Expense', 'COGS', 'Credit', 2, false, true),
('5400', 'Purchase Discounts', 'Expense', 'COGS', 'Credit', 2, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for COGS
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '5000') WHERE account_code IN ('5100', '5200', '5300', '5400');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '5100') WHERE account_code IN ('5110', '5120');
UPDATE financial_classes SET is_contra = true WHERE account_code IN ('5300', '5400');

-- OPERATING EXPENSES (6000-7999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('6000', 'OPERATING EXPENSES', 'Expense', 'Summary', 'Debit', 1, true, true),
('6100', 'Selling Expenses', 'Expense', 'Operating Expense', 'Debit', 2, true, true),
('6110', 'Sales Commissions', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6120', 'Marketing & Advertising', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6130', 'Freight Out / Shipping', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6140', 'Product Repairs & Maintenance', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6200', 'General & Administrative', 'Expense', 'SG&A', 'Debit', 2, true, true),
('6210', 'Salaries & Wages', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6220', 'Payroll Taxes', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6230', 'Rent Expense', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6240', 'Office Supplies', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6250', 'Professional Fees', 'Expense', 'SG&A', 'Debit', 3, true, true),
('6251', 'Legal Fees', 'Expense', 'SG&A', 'Debit', 4, false, true),
('6252', 'Accounting Fees', 'Expense', 'SG&A', 'Debit', 4, false, true),
('6253', 'Consulting Fees', 'Expense', 'SG&A', 'Debit', 4, false, true),
('6260', 'Insurance', 'Expense', 'SG&A', 'Debit', 3, true, true),
('6261', 'Business Insurance', 'Expense', 'SG&A', 'Debit', 4, false, true),
('6262', 'Vehicle Insurance', 'Expense', 'SG&A', 'Debit', 4, false, true),
('6270', 'Utilities', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6280', 'Software & Technology', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6290', 'Depreciation Expense', 'Expense', 'SG&A', 'Debit', 3, false, true),
('6300', 'Vehicle Expenses', 'Expense', 'Operating Expense', 'Debit', 2, true, true),
('6310', 'Vehicle Fuel', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6320', 'Vehicle Maintenance', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6330', 'Parking & Tolls', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6400', 'Meals & Entertainment', 'Expense', 'Operating Expense', 'Debit', 2, true, true),
('6410', 'Business Meals', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6420', 'Employee Meals', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6430', 'Office Meals (Cafe, Water, etc)', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6500', 'Bank & Financial Fees', 'Expense', 'Operating Expense', 'Debit', 2, true, true),
('6510', 'Bank Service Charges', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6520', 'Credit Card Fees', 'Expense', 'Operating Expense', 'Debit', 3, false, true),
('6530', 'Transaction Fees', 'Expense', 'Operating Expense', 'Debit', 3, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for Operating Expenses
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6000') WHERE account_code IN ('6100', '6200', '6300', '6400', '6500');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6100') WHERE account_code IN ('6110', '6120', '6130', '6140');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6200') WHERE account_code IN ('6210', '6220', '6230', '6240', '6250', '6260', '6270', '6280', '6290');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6250') WHERE account_code IN ('6251', '6252', '6253');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6260') WHERE account_code IN ('6261', '6262');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6300') WHERE account_code IN ('6310', '6320', '6330');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6400') WHERE account_code IN ('6410', '6420', '6430');
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '6500') WHERE account_code IN ('6510', '6520', '6530');

-- OTHER INCOME/EXPENSE (8000-8999)
INSERT INTO financial_classes (account_code, name, account_type, account_subtype, normal_balance, level, is_summary, active) VALUES
('8000', 'OTHER INCOME/EXPENSE', 'Expense', 'Summary', 'Debit', 1, true, true),
('8100', 'Interest Expense', 'Expense', 'Non-Operating Expense', 'Debit', 2, false, true),
('8200', 'Loss on Disposal of Assets', 'Expense', 'Non-Operating Expense', 'Debit', 2, false, true),
('8300', 'Miscellaneous Expense', 'Expense', 'Non-Operating Expense', 'Debit', 2, false, true)
ON CONFLICT (account_code) DO NOTHING;

-- Update parent relationships for Other Income/Expense
UPDATE financial_classes SET parent_account_id = (SELECT id FROM financial_classes WHERE account_code = '8000') WHERE account_code IN ('8100', '8200', '8300');

-- =====================================================
-- VALIDATION QUERY
-- =====================================================

-- Count accounts by type
SELECT 
    account_type,
    COUNT(*) as total_accounts,
    COUNT(CASE WHEN is_summary THEN 1 END) as summary_accounts,
    COUNT(CASE WHEN NOT is_summary THEN 1 END) as detail_accounts
FROM financial_classes
WHERE account_code IS NOT NULL
GROUP BY account_type
ORDER BY account_type;

-- Show hierarchy sample
SELECT 
    REPEAT('  ', level - 1) || account_code as code,
    REPEAT('  ', level - 1) || name as account_name,
    account_type,
    normal_balance,
    CASE WHEN is_summary THEN '(Summary)' ELSE '' END as type
FROM financial_classes
WHERE account_code LIKE '4%'  -- Show Revenue accounts
    AND account_code IS NOT NULL
ORDER BY account_code;
