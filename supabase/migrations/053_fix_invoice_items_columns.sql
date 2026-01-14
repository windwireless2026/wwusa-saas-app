-- Add missing columns to invoice_items table to support detailed product tracking
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS product_type_id UUID,
ADD COLUMN IF NOT EXISTS financial_class_id UUID,
ADD COLUMN IF NOT EXISTS capacity VARCHAR(50),
ADD COLUMN IF NOT EXISTS grade VARCHAR(50);

-- Update description to be optional since we are using product IDs
ALTER TABLE invoice_items ALTER COLUMN description DROP NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_type_id ON invoice_items(product_type_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_financial_class_id ON invoice_items(financial_class_id);
