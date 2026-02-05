-- Trigger B2B: preencher cost_price e descrição padrão nos estimate_items criados automaticamente
CREATE OR REPLACE FUNCTION public.handle_auto_estimate_on_stock_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_location RECORD;
    v_estimate_id UUID;
    v_cost_price DECIMAL(12,2);
    v_unit_price DECIMAL(12,2);
    v_margin_percent DECIMAL(10,2);
    v_description TEXT;
BEGIN
    SELECT * INTO v_location FROM public.stock_locations WHERE id = NEW.location_id;

    IF v_location.auto_create_estimate AND v_location.default_customer_id IS NOT NULL THEN

        SELECT id INTO v_estimate_id
        FROM public.estimates
        WHERE customer_id = v_location.default_customer_id
          AND status = 'draft'
          AND notes LIKE '%' || NEW.purchase_invoice || '%'
          LIMIT 1;

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

        v_cost_price := COALESCE(NEW.price, 0);
        v_unit_price := v_cost_price * 1.2;
        v_margin_percent := CASE WHEN v_cost_price > 0 THEN ((v_unit_price - v_cost_price) / v_cost_price) * 100 ELSE 0 END;
        v_description := 'UNLOCKED (AUCTION - NO TEST - NO WARRANTY)';

        INSERT INTO public.estimate_items (
            estimate_id,
            model,
            capacity,
            grade,
            quantity,
            unit_price,
            cost_price,
            margin_percent,
            description
        ) VALUES (
            v_estimate_id,
            NEW.model,
            COALESCE(NEW.capacity, ''),
            COALESCE(NEW.grade, ''),
            1,
            v_unit_price,
            v_cost_price,
            v_margin_percent,
            v_description
        );

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
