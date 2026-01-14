-- =====================================================
-- AJUSTE COMERCIAL: Flexibilidade de Bill To e Ship To
-- =====================================================

ALTER TABLE public.estimates
ADD COLUMN IF NOT EXISTS bill_to_name TEXT,
ADD COLUMN IF NOT EXISTS bill_to_address TEXT,
ADD COLUMN IF NOT EXISTS bill_to_city TEXT,
ADD COLUMN IF NOT EXISTS bill_to_state TEXT,
ADD COLUMN IF NOT EXISTS bill_to_zip TEXT,
ADD COLUMN IF NOT EXISTS bill_to_country TEXT DEFAULT 'USA',
-- Referência opcional à transportadora (freteiro)
ADD COLUMN IF NOT EXISTS forwarder_id UUID REFERENCES public.agents(id);

-- O mesmo para sales_orders (quando for convertido)
ALTER TABLE public.sales_orders
ADD COLUMN IF NOT EXISTS bill_to_name TEXT,
ADD COLUMN IF NOT EXISTS bill_to_address TEXT,
ADD COLUMN IF NOT EXISTS bill_to_city TEXT,
ADD COLUMN IF NOT EXISTS bill_to_state TEXT,
ADD COLUMN IF NOT EXISTS bill_to_zip TEXT,
ADD COLUMN IF NOT EXISTS bill_to_country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS forwarder_id UUID REFERENCES public.agents(id);

COMMENT ON COLUMN public.estimates.bill_to_name IS 'Nome que aparecerá no Bill To (ex: Cliente C/O Transportadora)';
COMMENT ON COLUMN public.estimates.forwarder_id IS 'ID da transportadora/freteiro selecionado';

NOTIFY pgrst, 'reload schema';
