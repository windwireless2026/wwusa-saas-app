-- Ensure deduct_discount_from_commission exists on sales_orders
-- Missed in 077

DO $$ 
BEGIN 

IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='deduct_discount_from_commission') THEN
    ALTER TABLE public.sales_orders ADD COLUMN deduct_discount_from_commission BOOLEAN DEFAULT FALSE;
END IF;

END $$;

NOTIFY pgrst, 'reload schema';
