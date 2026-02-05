-- Add competence column to invoices table
-- This field stores the month/year reference (YYYY-MM format)

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS competence VARCHAR(7);

-- Add comment to document the column
COMMENT ON COLUMN invoices.competence IS 'Competência (mês/ano) no formato YYYY-MM';
