-- Corrigir conta Mercury que ficou duplicada
UPDATE bank_accounts 
SET name = 'Mercury'
WHERE name LIKE 'Mercury%8640%' AND account_type = 'Bank USA';

-- Verificar resultado
SELECT name, account_number, account_type FROM bank_accounts WHERE account_type = 'Bank USA' ORDER BY name;
