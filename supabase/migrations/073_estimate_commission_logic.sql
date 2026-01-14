-- Add deduct_discount_from_commission flag to estimates and sales_orders
ALTER TABLE public.estimates 
ADD COLUMN IF NOT EXISTS deduct_discount_from_commission BOOLEAN DEFAULT TRUE;

ALTER TABLE public.sales_orders 
ADD COLUMN IF NOT EXISTS deduct_discount_from_commission BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.estimates.deduct_discount_from_commission IS 'Whether the discount amount should be subtracted from profit for commission calculation';

NOTIFY pgrst, 'reload schema';
