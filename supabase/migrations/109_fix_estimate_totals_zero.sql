-- Recalcula subtotal e total dos estimates que estão zerados a partir dos itens
UPDATE public.estimates e
SET
    subtotal = COALESCE((SELECT SUM(ei.quantity * ei.unit_price) FROM public.estimate_items ei WHERE ei.estimate_id = e.id), 0),
    total   = COALESCE((SELECT SUM(ei.quantity * ei.unit_price) FROM public.estimate_items ei WHERE ei.estimate_id = e.id), 0)
             - COALESCE(e.discount_amount, 0) + COALESCE(e.shipping_cost, 0)
WHERE (e.total = 0 OR e.total IS NULL)
  AND EXISTS (SELECT 1 FROM public.estimate_items ei WHERE ei.estimate_id = e.id);

NOTIFY pgrst, 'reload schema';
