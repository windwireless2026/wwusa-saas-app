-- Add lot_id to invoice_items to support tracking of specific lots
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS lot_id VARCHAR(100);

COMMENT ON COLUMN public.invoice_items.lot_id IS 'Identificação do lote (Lot ID) para produtos em estoque';
