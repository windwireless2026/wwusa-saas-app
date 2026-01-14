-- Add default financial class to agents
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS default_financial_class_id UUID REFERENCES public.financial_classes(id);

COMMENT ON COLUMN public.agents.default_financial_class_id IS 'Classe financeira padrão para transações com este agente (útil para pré-preencher faturas)';
