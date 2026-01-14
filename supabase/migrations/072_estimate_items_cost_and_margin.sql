-- Add cost_price and margin_percent to estimate_items for better commerciale tracking
ALTER TABLE public.estimate_items 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_percent DECIMAL(10,2) DEFAULT 0;

-- Also add to sales_order_items to maintain history when converted
ALTER TABLE public.sales_order_items 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_percent DECIMAL(10,2) DEFAULT 0;

-- Update the view or documentation if necessary
COMMENT ON COLUMN public.estimate_items.cost_price IS 'Average cost of the product at the time of estimate';
COMMENT ON COLUMN public.estimate_items.margin_percent IS 'Profit margin percentage applied to the cost price';

-- Logic for existing items: if unit_price > 0 and cost_price is 0, we leave as is or try to guess? 
-- Better leave as 0 for now to avoid wrong historical data.

NOTIFY pgrst, 'reload schema';
