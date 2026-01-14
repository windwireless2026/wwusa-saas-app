-- Ensure columns exist and reload schema
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS default_financial_class_id UUID REFERENCES public.financial_classes(id);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS resale_certificate_expiry_year INTEGER DEFAULT (EXTRACT(YEAR FROM CURRENT_DATE));

COMMENT ON COLUMN public.agents.default_financial_class_id IS 'Classe financeira padrão para transações com este agente';

NOTIFY pgrst, 'reload schema';
