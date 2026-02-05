-- 1. Adicionar local de estoque padrão na Invoice (para automação)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS stock_location_id UUID REFERENCES public.stock_locations(id);

-- 2. Adicionar Lot ID no inventário para rastreabilidade
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS lot_id VARCHAR(100);

COMMENT ON COLUMN public.inventory.lot_id IS 'ID do Lote de compra (Lot ID)';
