-- Add due_date and pay_at_destination to estimates and sales_orders
ALTER TABLE public.estimates 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS pay_at_destination BOOLEAN DEFAULT FALSE;

ALTER TABLE public.sales_orders 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS pay_at_destination BOOLEAN DEFAULT FALSE;
