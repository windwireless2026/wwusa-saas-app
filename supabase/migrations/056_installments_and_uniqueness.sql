-- 1. Fix existing null AP numbers if any
UPDATE invoices 
SET ap_number = 'AP-' || to_char(created_at, 'YYYY') || '-' || LPAD(nextval('invoice_ap_seq')::text, 4, '0')
WHERE ap_number IS NULL;

-- 2. Add installment columns
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_invoice_id UUID REFERENCES invoices(id);

-- 3. Unique index (Per vendor + Invoice Number + Installment)
-- This prevents creating the same invoice multiple times by mistake, but allows reuse if deleted
DROP INDEX IF EXISTS unique_agent_invoice_installment;
CREATE UNIQUE INDEX unique_agent_invoice_installment 
ON invoices (agent_id, invoice_number, installment_number) 
WHERE (deleted_at IS NULL);
