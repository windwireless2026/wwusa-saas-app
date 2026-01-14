-- =====================================================
-- MÓDULO COMERCIAL: Estrutura de Banco de Dados
-- =====================================================

-- 1. CUSTOMERS (Clientes)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados básicos
    name TEXT NOT NULL,
    trade_name TEXT, -- Nome fantasia
    document_type TEXT DEFAULT 'CNPJ', -- CNPJ, CPF, RUC, EIN, etc
    document_number TEXT,
    
    -- Contato
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    contact_person TEXT, -- Pessoa de contato
    
    -- Endereço de cobrança
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip TEXT,
    billing_country TEXT DEFAULT 'USA',
    
    -- Endereço de entrega (pode ser diferente)
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT DEFAULT 'USA',
    
    -- Comercial
    default_commission_percent DECIMAL(5,2) DEFAULT 0, -- % comissão padrão para vendas
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'NET30', -- NET30, NET60, COD, etc
    
    -- Observações
    notes TEXT,
    
    -- Controle
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. ESTIMATES (Cotações)
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Número sequencial
    estimate_number SERIAL,
    
    -- Cliente
    customer_id UUID REFERENCES public.customers(id),
    
    -- Ship To (pode ser diferente do cliente)
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
    valid_until DATE, -- Validade da cotação
    
    -- Vendedor
    salesperson_id UUID REFERENCES auth.users(id),
    commission_percent DECIMAL(5,2) DEFAULT 0, -- % comissão desta venda
    
    -- Valores
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired', 'converted')),
    
    -- Observações
    notes TEXT, -- Notas internas
    customer_notes TEXT, -- Notas visíveis ao cliente
    terms TEXT, -- Termos e condições
    payment_methods TEXT, -- Métodos de pagamento aceitos
    
    -- Controle
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3. ESTIMATE_ITEMS (Itens da Cotação)
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    
    -- Produto (referência ao catálogo ou texto livre)
    product_id UUID REFERENCES public.product_catalog(id),
    
    -- Dados do item (pode ser diferente do catálogo)
    model TEXT NOT NULL,
    capacity TEXT,
    grade TEXT, -- LEILAO, A, B, C, etc
    description TEXT, -- Descrição adicional (ex: "AUCTION - NO TEST - NO WARRANTY")
    
    -- Quantidades e valores
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Ordem de exibição
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SALES_ORDERS (Pedidos de Venda)
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Número sequencial
    order_number SERIAL,
    
    -- Origem
    estimate_id UUID REFERENCES public.estimates(id), -- Pedido veio de qual cotação
    
    -- Cliente
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    
    -- Ship To
    ship_to_name TEXT,
    ship_to_address TEXT,
    ship_to_city TEXT,
    ship_to_state TEXT,
    ship_to_zip TEXT,
    ship_to_country TEXT,
    ship_to_phone TEXT,
    
    -- Datas
    order_date DATE DEFAULT CURRENT_DATE,
    expected_ship_date DATE,
    actual_ship_date DATE,
    delivery_date DATE,
    
    -- Vendedor
    salesperson_id UUID REFERENCES auth.users(id),
    commission_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Valores
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    
    -- Status do pedido
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Status do pagamento
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMPTZ,
    
    -- Notas
    notes TEXT,
    shipping_notes TEXT,
    
    -- Controle
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. SALES_ORDER_ITEMS (Itens do Pedido)
CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    
    -- Produto
    product_id UUID REFERENCES public.product_catalog(id),
    
    -- Dados do item
    model TEXT NOT NULL,
    capacity TEXT,
    grade TEXT,
    description TEXT,
    
    -- Quantidades
    quantity INTEGER NOT NULL DEFAULT 1,
    quantity_shipped INTEGER DEFAULT 0, -- Quantidade já expedida
    quantity_pending INTEGER GENERATED ALWAYS AS (quantity - quantity_shipped) STORED,
    
    -- Valores
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Ordem
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMISSIONS (Comissões)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referência
    order_id UUID NOT NULL REFERENCES public.sales_orders(id),
    salesperson_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Valores
    order_total DECIMAL(12,2) NOT NULL,
    commission_percent DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) GENERATED ALWAYS AS (order_total * commission_percent / 100) STORED,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'paid', 'cancelled')),
    -- pending = aguardando pagamento do cliente
    -- released = cliente pagou, comissão liberada
    -- paid = comissão paga ao vendedor
    -- cancelled = cancelada
    
    -- Datas
    released_at TIMESTAMPTZ, -- Quando foi liberada (cliente pagou)
    paid_at TIMESTAMPTZ, -- Quando foi paga ao vendedor
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRICE_TABLE (Tabela de Preços / Markup)
CREATE TABLE IF NOT EXISTS public.price_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Produto
    product_id UUID REFERENCES public.product_catalog(id),
    model TEXT, -- Pode ser por modelo (sem produto específico)
    capacity TEXT,
    grade TEXT,
    
    -- Preços
    cost_price DECIMAL(12,2), -- Preço de custo (referência)
    markup_percent DECIMAL(5,2) DEFAULT 20, -- Margem padrão
    suggested_price DECIMAL(12,2), -- Preço sugerido de venda
    minimum_price DECIMAL(12,2), -- Preço mínimo permitido
    
    -- Validade
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    -- Controle
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_document ON public.customers(document_number);
CREATE INDEX IF NOT EXISTS idx_estimates_customer ON public.estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON public.estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_date ON public.estimates(estimate_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON public.sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_commissions_salesperson ON public.commissions(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_table ENABLE ROW LEVEL SECURITY;

-- Customers: todos autenticados podem ver e gerenciar
CREATE POLICY "customers_select_authenticated" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_insert_authenticated" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "customers_update_authenticated" ON public.customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Estimates: todos autenticados podem ver e gerenciar
CREATE POLICY "estimates_select_authenticated" ON public.estimates FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimates_insert_authenticated" ON public.estimates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimates_update_authenticated" ON public.estimates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Estimate Items
CREATE POLICY "estimate_items_select_authenticated" ON public.estimate_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_items_insert_authenticated" ON public.estimate_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_items_update_authenticated" ON public.estimate_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_items_delete_authenticated" ON public.estimate_items FOR DELETE TO authenticated USING (true);

-- Sales Orders
CREATE POLICY "sales_orders_select_authenticated" ON public.sales_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_orders_insert_authenticated" ON public.sales_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sales_orders_update_authenticated" ON public.sales_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Sales Order Items
CREATE POLICY "sales_order_items_select_authenticated" ON public.sales_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_order_items_insert_authenticated" ON public.sales_order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sales_order_items_update_authenticated" ON public.sales_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sales_order_items_delete_authenticated" ON public.sales_order_items FOR DELETE TO authenticated USING (true);

-- Commissions: vendedores veem suas próprias comissões, admins veem todas
CREATE POLICY "commissions_select_own" ON public.commissions FOR SELECT TO authenticated 
USING (
    salesperson_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'finance_manager')
    )
);
CREATE POLICY "commissions_insert_admin" ON public.commissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "commissions_update_admin" ON public.commissions FOR UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'finance_manager')
    )
);

-- Price Table
CREATE POLICY "price_table_select_authenticated" ON public.price_table FOR SELECT TO authenticated USING (true);
CREATE POLICY "price_table_manage_admin" ON public.price_table FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'sales_manager')
    )
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update estimate totals
CREATE OR REPLACE FUNCTION update_estimate_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.estimates
    SET 
        subtotal = (SELECT COALESCE(SUM(total_price), 0) FROM public.estimate_items WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)),
        total = (SELECT COALESCE(SUM(total_price), 0) FROM public.estimate_items WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)) 
                - COALESCE(discount_amount, 0) + COALESCE(shipping_cost, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.estimate_id, OLD.estimate_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_estimate_totals
AFTER INSERT OR UPDATE OR DELETE ON public.estimate_items
FOR EACH ROW EXECUTE FUNCTION update_estimate_totals();

-- Function to update sales order totals
CREATE OR REPLACE FUNCTION update_sales_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sales_orders
    SET 
        subtotal = (SELECT COALESCE(SUM(total_price), 0) FROM public.sales_order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)),
        total = (SELECT COALESCE(SUM(total_price), 0) FROM public.sales_order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)) 
                - COALESCE(discount_amount, 0) + COALESCE(shipping_cost, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sales_order_totals
AFTER INSERT OR UPDATE OR DELETE ON public.sales_order_items
FOR EACH ROW EXECUTE FUNCTION update_sales_order_totals();

-- Function to release commission when payment is received
CREATE OR REPLACE FUNCTION release_commission_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        UPDATE public.commissions
        SET 
            status = 'released',
            released_at = NOW(),
            updated_at = NOW()
        WHERE order_id = NEW.id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_release_commission_on_payment
AFTER UPDATE ON public.sales_orders
FOR EACH ROW EXECUTE FUNCTION release_commission_on_payment();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
