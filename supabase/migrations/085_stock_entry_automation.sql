-- =====================================================
-- 085_STCOK_ENTRY_AUTOMATION: Melhorias para Back-to-Back
-- =====================================================

-- 1. Adicionar local de estoque nas Estimates (Cotações)
ALTER TABLE public.estimates 
ADD COLUMN IF NOT EXISTS stock_location_id UUID REFERENCES public.stock_locations(id);

COMMENT ON COLUMN public.estimates.stock_location_id IS 'Local de estoque de onde os itens serão retirados (para automação Back-to-Back)';

-- 2. Adicionar flag para distinguir Invoices (Contas a Receber vs Contas a Pagar)
-- Embora o agent_id indique a origem, uma flag explícita ajuda no filtro financeiro.
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS is_receivable BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.invoices.is_receivable IS 'True se for Conta a Receber (Venda/Serviço), False se for Conta a Pagar (Gasto/Compra)';

-- 3. Colunas de reserva no inventário
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS reserved_for_customer_id UUID REFERENCES public.agents(id),
ADD COLUMN IF NOT EXISTS linked_estimate_id UUID REFERENCES public.estimates(id);

COMMENT ON COLUMN public.inventory.reserved_for_customer_id IS 'Cliente para o qual o item está reservado (Back-to-Back)';
COMMENT ON COLUMN public.inventory.linked_estimate_id IS 'Estimate (Cotação) vinculada a esta reserva';

-- 4. Atualizar invoices existentes vinculadas a clientes para serem receivables
UPDATE public.invoices
SET is_receivable = true
WHERE agent_id IN (
    SELECT id FROM public.agents WHERE 'cliente' = ANY(roles)
);

-- Notificar recarregamento do PostgREST
NOTIFY pgrst, 'reload schema';
