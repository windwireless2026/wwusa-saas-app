const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres',
});

const sql = `
-- FIX BANK ACCOUNTS
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS is_receiving_account BOOLEAN DEFAULT true;
UPDATE public.bank_accounts SET is_receiving_account = true WHERE is_receiving_account IS NULL;

-- FIX ESTIMATES SEQUENCE
DO $$
BEGIN
    -- Add unique constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_estimate_number') THEN
        ALTER TABLE public.estimates ADD CONSTRAINT unique_estimate_number UNIQUE (estimate_number);
    END IF;

    -- Restart sequence
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'estimates_estimate_number_seq') THEN
        ALTER SEQUENCE estimates_estimate_number_seq RESTART WITH 1234;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
`;

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query(sql);
        console.log('SQL Executed Successfully');
    } catch (err) {
        console.error('Error executing SQL:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
