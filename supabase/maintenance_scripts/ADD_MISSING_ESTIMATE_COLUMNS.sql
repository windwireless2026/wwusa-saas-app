-- =====================================================
-- Adiciona colunas faltantes em estimates (e estimate_items)
-- para a tela de Novo/Editar Estimate funcionar.
-- Idempotente: só adiciona se a coluna não existir.
-- Rode no SQL Editor do Supabase.
-- =====================================================

DO $$
BEGIN
  -- ---------- ESTIMATES: Bill To & Forwarder (067) ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'bill_to_name') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'bill_to_address') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'bill_to_city') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'bill_to_state') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_state TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'bill_to_zip') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_zip TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'bill_to_country') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_country TEXT DEFAULT 'USA';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'forwarder_id') THEN
    ALTER TABLE public.estimates ADD COLUMN forwarder_id UUID REFERENCES public.agents(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'freteiro_id') THEN
    ALTER TABLE public.estimates ADD COLUMN freteiro_id UUID REFERENCES public.agents(id);
  END IF;

  -- ---------- ESTIMATES: Datas e pagamento (069) ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'due_date') THEN
    ALTER TABLE public.estimates ADD COLUMN due_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'pay_at_destination') THEN
    ALTER TABLE public.estimates ADD COLUMN pay_at_destination BOOLEAN DEFAULT FALSE;
  END IF;

  -- ---------- ESTIMATES: Comissão (073) ----------
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimates' AND column_name = 'deduct_discount_from_commission') THEN
    ALTER TABLE public.estimates ADD COLUMN deduct_discount_from_commission BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ---------- ESTIMATE_ITEMS: custo e margem (072) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimate_items' AND column_name = 'cost_price') THEN
    ALTER TABLE public.estimate_items ADD COLUMN cost_price DECIMAL(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'estimate_items' AND column_name = 'margin_percent') THEN
    ALTER TABLE public.estimate_items ADD COLUMN margin_percent DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Comentários (opcional)
COMMENT ON COLUMN public.estimates.bill_to_name IS 'Nome que aparecerá no Bill To (ex: Cliente C/O Transportadora)';
COMMENT ON COLUMN public.estimates.forwarder_id IS 'ID da transportadora (Exempt) selecionada';
COMMENT ON COLUMN public.estimates.freteiro_id IS 'ID do freteiro (cadastro em Financeiro > Agentes) selecionado';
COMMENT ON COLUMN public.estimate_items.cost_price IS 'Custo médio do item no momento da cotação';
COMMENT ON COLUMN public.estimate_items.margin_percent IS 'Margem de lucro percentual aplicada ao custo';

NOTIFY pgrst, 'reload schema';

-- Verificação: listar colunas de estimates após o script
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'estimates'
ORDER BY ordinal_position;
