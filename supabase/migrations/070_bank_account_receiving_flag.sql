-- Add is_receiving_account column to bank_accounts
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS is_receiving_account BOOLEAN DEFAULT true;

-- Update existing accounts to be receiving accounts by default
UPDATE public.bank_accounts SET is_receiving_account = true WHERE is_receiving_account IS NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
