-- Ensure ALL potential missing columns exist on estimates and sales_orders
-- Covering failures from 067, 069, and others.

DO $$ 
BEGIN 

-- Estimates: Bill To & Forwarder (from 067)
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='bill_to_name') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_name TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='bill_to_address') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_address TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='bill_to_city') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_city TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='bill_to_state') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_state TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='bill_to_zip') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_zip TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='bill_to_country') THEN
    ALTER TABLE public.estimates ADD COLUMN bill_to_country TEXT DEFAULT 'USA';
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='forwarder_id') THEN
    ALTER TABLE public.estimates ADD COLUMN forwarder_id UUID REFERENCES public.agents(id);
END IF;

-- Estimates: Dates & Payment (from 069)
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='due_date') THEN
    ALTER TABLE public.estimates ADD COLUMN due_date DATE;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='pay_at_destination') THEN
    ALTER TABLE public.estimates ADD COLUMN pay_at_destination BOOLEAN DEFAULT FALSE;
END IF;

-- Estimates: Commission Logic (from 073)
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='deduct_discount_from_commission') THEN
    ALTER TABLE public.estimates ADD COLUMN deduct_discount_from_commission BOOLEAN DEFAULT FALSE;
END IF;


-- Sales Orders: Mirroring Estimates
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='bill_to_name') THEN
    ALTER TABLE public.sales_orders ADD COLUMN bill_to_name TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='bill_to_address') THEN
    ALTER TABLE public.sales_orders ADD COLUMN bill_to_address TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='bill_to_city') THEN
    ALTER TABLE public.sales_orders ADD COLUMN bill_to_city TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='bill_to_state') THEN
    ALTER TABLE public.sales_orders ADD COLUMN bill_to_state TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='bill_to_zip') THEN
    ALTER TABLE public.sales_orders ADD COLUMN bill_to_zip TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='bill_to_country') THEN
    ALTER TABLE public.sales_orders ADD COLUMN bill_to_country TEXT DEFAULT 'USA';
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='forwarder_id') THEN
    ALTER TABLE public.sales_orders ADD COLUMN forwarder_id UUID REFERENCES public.agents(id);
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='due_date') THEN
    ALTER TABLE public.sales_orders ADD COLUMN due_date DATE;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_orders' AND column_name='pay_at_destination') THEN
    ALTER TABLE public.sales_orders ADD COLUMN pay_at_destination BOOLEAN DEFAULT FALSE;
END IF;

END $$;

NOTIFY pgrst, 'reload schema';
