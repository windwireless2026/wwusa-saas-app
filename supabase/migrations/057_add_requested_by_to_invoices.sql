-- Add requested_by column to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES profiles(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_requested_by ON invoices(requested_by);
