-- Ensure invoice_items table exists with proper relationships
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_type_id UUID REFERENCES product_types(id),
    product_id UUID REFERENCES product_catalog(id),
    financial_class_id UUID REFERENCES financial_classes(id),
    description TEXT,
    capacity VARCHAR(50),
    grade VARCHAR(50),
    quantity DECIMAL(15, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing foreign keys if they were missing (idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_product_id_fkey') THEN
        ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES product_catalog(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_product_type_id_fkey') THEN
        ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES product_types(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_items_financial_class_id_fkey') THEN
        ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_financial_class_id_fkey FOREIGN KEY (financial_class_id) REFERENCES financial_classes(id);
    END IF;
END $$;

-- Fix any RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read invoice_items" ON invoice_items;
CREATE POLICY "Allow authenticated users to read invoice_items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert invoice_items" ON invoice_items;
CREATE POLICY "Allow authenticated users to insert invoice_items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update invoice_items" ON invoice_items;
CREATE POLICY "Allow authenticated users to update invoice_items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete invoice_items" ON invoice_items;
CREATE POLICY "Allow authenticated users to delete invoice_items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (true);
