-- Garante que estimates.stock_location_id existe (ex.: se 085 não foi aplicada ou cache desatualizado)
-- Erro: "Could not find the 'stock_location_id' column of 'estimates' in the schema cache"

ALTER TABLE public.estimates
ADD COLUMN IF NOT EXISTS stock_location_id UUID REFERENCES public.stock_locations(id);

COMMENT ON COLUMN public.estimates.stock_location_id IS 'Local de estoque de onde os itens serão retirados (para automação Back-to-Back)';

NOTIFY pgrst, 'reload schema';
