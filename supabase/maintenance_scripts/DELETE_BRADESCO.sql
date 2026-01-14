-- Deletar conta Bradesco
DELETE FROM bank_accounts WHERE name = 'Bradesco' AND account_type = 'Bank BR';

-- Verificar contas restantes
SELECT name, account_type, currency FROM bank_accounts WHERE deleted_at IS NULL ORDER BY account_type, name;
