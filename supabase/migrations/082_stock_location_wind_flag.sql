-- =====================================================
-- 082_STOCK_LOCATION_WIND_FLAG: Identificar estoque próprio
-- =====================================================

-- 1. Adicionar campo para identificar se o local é estoque da Wind Wireless (Próprio)
ALTER TABLE public.stock_locations 
ADD COLUMN IF NOT EXISTS is_wind_stock BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.stock_locations.is_wind_stock IS 'Se este local representa o estoque próprio da Wind Wireless (usado para filtros padrão)';

-- Notificar recarregamento do PostgREST
NOTIFY pgrst, 'reload schema';
