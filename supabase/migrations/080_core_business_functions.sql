-- =====================================================
-- 080_CORE_BUSINESS_FUNCTIONS: Lógica de Missão Crítica
-- =====================================================

-- 1. Melhoria na Estrutura para Rastreabilidade
-- Adiciona link opcional para o item físico (IMEI) no pedido de venda
ALTER TABLE public.sales_order_items 
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory(id);

-- 2. FUNÇÃO: Converter Estimate em Sales Order (Atômico)
-- Esta função garante que o processo de aprovação seja feito em uma única transação
CREATE OR REPLACE FUNCTION public.convert_estimate_to_order(target_estimate_id UUID)
RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
    v_estimate RECORD;
BEGIN
    -- 1. Buscar dados do Estimate
    SELECT * INTO v_estimate FROM public.estimates WHERE id = target_estimate_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Estimate não encontrado.';
    END IF;

    IF v_estimate.status = 'converted' THEN
        RAISE EXCEPTION 'Este Estimate já foi convertido em pedido.';
    END IF;

    -- 2. Criar o Sales Order
    INSERT INTO public.sales_orders (
        estimate_id,
        customer_id,
        ship_to_name, ship_to_address, ship_to_city, ship_to_state, ship_to_zip, ship_to_country, ship_to_phone,
        salesperson_id,
        commission_percent,
        subtotal,
        discount_percent,
        discount_amount,
        shipping_cost,
        total,
        status,
        pay_at_destination, -- Campo adicionado em migrações recentes
        created_by
    ) VALUES (
        v_estimate.id,
        v_estimate.customer_id,
        v_estimate.ship_to_name, v_estimate.ship_to_address, v_estimate.ship_to_city, v_estimate.ship_to_state, v_estimate.ship_to_zip, v_estimate.ship_to_country, v_estimate.ship_to_phone,
        v_estimate.salesperson_id,
        v_estimate.commission_percent,
        v_estimate.subtotal,
        v_estimate.discount_percent,
        v_estimate.discount_amount,
        v_estimate.shipping_cost,
        v_estimate.total,
        'pending',
        COALESCE(v_estimate.pay_at_destination, false),
        auth.uid()
    ) RETURNING id INTO new_order_id;

    -- 3. Copiar Itens
    INSERT INTO public.sales_order_items (
        order_id,
        product_id,
        model,
        capacity,
        grade,
        description,
        quantity,
        unit_price,
        sort_order
    )
    SELECT 
        new_order_id,
        product_id,
        model,
        capacity,
        grade,
        description,
        quantity,
        unit_price,
        sort_order
    FROM public.estimate_items
    WHERE estimate_id = target_estimate_id;

    -- 4. Atualizar status do Estimate
    UPDATE public.estimates 
    SET status = 'converted', 
        updated_at = NOW() 
    WHERE id = target_estimate_id;

    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO: Baixa de Estoque Automática
-- Garante que nenhum item seja "Duplamente Vendido"
CREATE OR REPLACE FUNCTION public.handle_inventory_status_on_sale_link()
RETURNS TRIGGER AS $$
BEGIN
    -- Se um item de inventário (IMEI) foi vinculado ao pedido
    IF NEW.inventory_item_id IS NOT NULL AND (OLD.inventory_item_id IS NULL OR NEW.inventory_item_id != OLD.inventory_item_id) THEN
        -- Marcar como Reservado imediatamente
        UPDATE public.inventory 
        SET status = 'Sold', -- Ou 'Reserved' dependendo do workflow
            updated_at = NOW()
        WHERE id = NEW.inventory_item_id;
    END IF;

    -- Se desvincular o item (ex: mudou o IMEI do pedido), volta para Available
    IF OLD.inventory_item_id IS NOT NULL AND NEW.inventory_item_id IS NULL THEN
        UPDATE public.inventory 
        SET status = 'Available',
            updated_at = NOW()
        WHERE id = OLD.inventory_item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_inventory_on_sale
AFTER UPDATE OF inventory_item_id ON public.sales_order_items
FOR EACH ROW EXECUTE FUNCTION public.handle_inventory_status_on_sale_link();

-- 4. FUNÇÃO: Proteção de Deletes
-- Impede deletar itens de inventário que já foram vendidos
CREATE OR REPLACE FUNCTION public.prevent_delete_sold_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'Sold' THEN
        RAISE EXCEPTION 'Não é permitido excluir um item que já consta como Vendido.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_delete_sold
BEFORE DELETE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.prevent_delete_sold_inventory();

-- Notificar recarregamento do PostgREST
NOTIFY pgrst, 'reload schema';
