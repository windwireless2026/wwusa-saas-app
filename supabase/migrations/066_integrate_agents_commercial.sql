-- =====================================================
-- INTEGRAÇÃO: Adicionar campos comerciais à tabela agents
-- =====================================================

-- Adicionar campos comerciais para quando o agente é do tipo 'cliente'
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS default_commission_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'COD';

-- Comentários para documentação
COMMENT ON COLUMN public.agents.default_commission_percent IS 'Percentual de comissão padrão para vendas a este cliente';
COMMENT ON COLUMN public.agents.credit_limit IS 'Limite de crédito do cliente';
COMMENT ON COLUMN public.agents.payment_terms IS 'Condições de pagamento padrão (COD, NET30, NET60, etc)';

-- Recriar tabela estimates para usar agents em vez de customers
DROP TABLE IF EXISTS public.estimate_items CASCADE;
DROP TABLE IF EXISTS public.estimates CASCADE;

CREATE TABLE public.estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_number SERIAL,
    
    -- Cliente (agente do tipo 'cliente')
    customer_id UUID REFERENCES public.agents(id),
    
    -- Ship To
    ship_to_name TEXT,
    ship_to_address TEXT,
    ship_to_city TEXT,
    ship_to_state TEXT,
    ship_to_zip TEXT,
    ship_to_country TEXT,
    ship_to_phone TEXT,
    
    -- Datas
    estimate_date DATE DEFAULT CURRENT_DATE,
    ship_date DATE,
    valid_until DATE,
    
    -- Vendedor
    salesperson_id UUID REFERENCES auth.users(id),
    commission_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Valores
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired', 'converted')),
    
    -- Observações
    notes TEXT,
    customer_notes TEXT,
    terms TEXT,
    payment_methods TEXT,
    
    -- Controle
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.product_catalog(id),
    model TEXT NOT NULL,
    capacity TEXT,
    grade TEXT,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recriar sales_orders
DROP TABLE IF EXISTS public.sales_order_items CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.sales_orders CASCADE;

CREATE TABLE public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    estimate_id UUID REFERENCES public.estimates(id),
    customer_id UUID NOT NULL REFERENCES public.agents(id),
    ship_to_name TEXT,
    ship_to_address TEXT,
    ship_to_city TEXT,
    ship_to_state TEXT,
    ship_to_zip TEXT,
    ship_to_country TEXT,
    ship_to_phone TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_ship_date DATE,
    actual_ship_date DATE,
    delivery_date DATE,
    salesperson_id UUID REFERENCES auth.users(id),
    commission_percent DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    shipping_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.product_catalog(id),
    model TEXT NOT NULL,
    capacity TEXT,
    grade TEXT,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    quantity_shipped INTEGER DEFAULT 0,
    quantity_pending INTEGER GENERATED ALWAYS AS (quantity - quantity_shipped) STORED,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.sales_orders(id),
    salesperson_id UUID NOT NULL REFERENCES auth.users(id),
    order_total DECIMAL(12,2) NOT NULL,
    commission_percent DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) GENERATED ALWAYS AS (order_total * commission_percent / 100) STORED,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'paid', 'cancelled')),
    released_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "estimates_all_authenticated" ON public.estimates;
DROP POLICY IF EXISTS "estimate_items_all_authenticated" ON public.estimate_items;
DROP POLICY IF EXISTS "sales_orders_all_authenticated" ON public.sales_orders;
DROP POLICY IF EXISTS "sales_order_items_all_authenticated" ON public.sales_order_items;
DROP POLICY IF EXISTS "commissions_all_authenticated" ON public.commissions;

CREATE POLICY "estimates_all_authenticated" ON public.estimates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_items_all_authenticated" ON public.estimate_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sales_orders_all_authenticated" ON public.sales_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sales_order_items_all_authenticated" ON public.sales_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "commissions_all_authenticated" ON public.commissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Drop old customers table (not needed anymore)
DROP TABLE IF EXISTS public.customers CASCADE;

NOTIFY pgrst, 'reload schema';
