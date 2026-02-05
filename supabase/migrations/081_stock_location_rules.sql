-- =====================================================
-- 081_STOCK_LOCATION_RULES: Regras de Negócio por Local de Estoque
-- =====================================================

-- 1. Adicionar campos de configuração à tabela stock_locations
ALTER TABLE public.stock_locations 
ADD COLUMN IF NOT EXISTS include_in_avg_cost BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS include_in_inventory_valuation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_create_estimate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_customer_id UUID REFERENCES public.agents(id);

-- 2. Comentários para documentação
COMMENT ON COLUMN public.stock_locations.include_in_avg_cost IS 'Se os itens neste local devem ser considerados no cálculo de preço médio';
COMMENT ON COLUMN public.stock_locations.include_in_inventory_valuation IS 'Se os itens deste local devem aparecer no valor total de estoque do dashboard';
COMMENT ON COLUMN public.stock_locations.auto_create_estimate IS 'Se o sistema deve gerar automaticamente um Estimate quando um item for adicionado a este local';
COMMENT ON COLUMN public.stock_locations.default_customer_id IS 'Cliente padrão para o Estimate automático (ex: America Asset)';

-- 3. FUNÇÃO: Gerar Estimate Automático para Locais "Back-to-Back"
CREATE OR REPLACE FUNCTION public.handle_auto_estimate_on_stock_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_location RECORD;
    v_estimate_id UUID;
BEGIN
    -- Verificar se o local tem auto_create_estimate ativo
    SELECT * INTO v_location FROM public.stock_locations WHERE id = NEW.location_id;
    
    IF v_location.auto_create_estimate AND v_location.default_customer_id IS NOT NULL THEN
        
        -- Verificar se já existe um Estimate em rascunho (draft) para este cliente hoje
        -- para evitar criar centenas de estimates se importar uma planilha. 
        -- Melhor: Criar UM estimate por Invoice de Compra?
        -- Por enquanto, vamos criar um novo se não houver um 'draft' recente ou simplesmente criar um. 
        -- O usuário disse "CRIAR UMA ESTIMATE", vamos tentar agrupar por invoice de compra se disponível.
        
        SELECT id INTO v_estimate_id 
        FROM public.estimates 
        WHERE customer_id = v_location.default_customer_id 
          AND status = 'draft'
          AND notes LIKE '%' || NEW.purchase_invoice || '%' -- Tenta agrupar pela invoice de compra
          LIMIT 1;

        -- Se não houver, cria um novo
        IF v_estimate_id IS NULL THEN
            INSERT INTO public.estimates (
                customer_id,
                status,
                notes,
                created_by
            ) VALUES (
                v_location.default_customer_id,
                'draft',
                'Auto-gerado via entrada de estoque (Invoice: ' || COALESCE(NEW.purchase_invoice, 'N/A') || ')',
                NEW.created_by
            ) RETURNING id INTO v_estimate_id;
        END IF;

        -- Adiciona o item ao estimate
        INSERT INTO public.estimate_items (
            estimate_id,
            model,
            capacity,
            grade,
            quantity,
            unit_price, -- Valor sugerido? Por enquanto 0 ou preço de compra + 0
            description
        ) VALUES (
            v_estimate_id,
            NEW.model,
            NEW.capacity,
            NEW.grade,
            1,
            NEW.price, -- Venda pelo preço de compra no back-to-back?
            'IMEI: ' || COALESCE(NEW.imei, 'N/A')
        );

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para entrada de estoque
-- Removendo se já existir para evitar erro em re-run
DROP TRIGGER IF EXISTS trigger_auto_estimate_on_stock ON public.inventory;

CREATE TRIGGER trigger_auto_estimate_on_stock
AFTER INSERT ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.handle_auto_estimate_on_stock_entry();

-- Notificar recarregamento do PostgREST
NOTIFY pgrst, 'reload schema';
