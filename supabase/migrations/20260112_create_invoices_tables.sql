    -- Create Cost Centers table
    CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
    );

    -- Create Invoices table
    CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agent relationship
    agent_id UUID REFERENCES agents(id),
    
    -- Invoice info
    invoice_number VARCHAR(100) NOT NULL,
    invoice_type VARCHAR(50), -- 'service', 'product', 'recurring', 'one-time', etc
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    
    -- Financial
    currency VARCHAR(3) DEFAULT 'USD', -- USD, BRL
    amount DECIMAL(15, 2) NOT NULL,
    amount_usd DECIMAL(15, 2), -- Converted to USD if currency is BRL
    exchange_rate DECIMAL(10, 4), -- Exchange rate used for conversion
    
    -- Payment info
    payment_method VARCHAR(50), -- 'wire', 'ach', 'check', 'zelle', 'pix', etc
    bank_id UUID REFERENCES agents(id), -- Link to agent of type 'banco'
    
    -- Cost Center
    cost_center_id UUID REFERENCES cost_centers(id),
    
    -- Board approval workflow
    board_submission_date DATE,
    board_approval_date DATE,
    board_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'submitted', 'approved', 'rejected'
    
    -- Recurrence
    payment_frequency VARCHAR(20), -- 'one-time', 'monthly', 'quarterly', 'yearly'
    
    -- Additional info
    notes TEXT,
    attachment_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_invoices_agent ON invoices(agent_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_cost_center ON invoices(cost_center_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
    CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_cost_centers_deleted ON cost_centers(deleted_at);

    -- Enable RLS
    ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for Cost Centers
    CREATE POLICY "Allow authenticated users to read cost_centers"
    ON cost_centers FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "Allow authenticated users to insert cost_centers"
    ON cost_centers FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "Allow authenticated users to update cost_centers"
    ON cost_centers FOR UPDATE
    TO authenticated
    USING (true);

    CREATE POLICY "Allow authenticated users to delete cost_centers"
    ON cost_centers FOR DELETE
    TO authenticated
    USING (true);

    -- RLS Policies for Invoices
    CREATE POLICY "Allow authenticated users to read invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "Allow authenticated users to insert invoices"
    ON invoices FOR INSERT
    TO authenticated
    WITH CHECK (true);

    CREATE POLICY "Allow authenticated users to update invoices"
    ON invoices FOR UPDATE
    TO authenticated
    USING (true);

    CREATE POLICY "Allow authenticated users to delete invoices"
    ON invoices FOR DELETE
    TO authenticated
    USING (true);

    -- Insert some default cost centers
    INSERT INTO cost_centers (name, code, description) VALUES
    ('Operations', 'OPS', 'Operational expenses'),
    ('Marketing', 'MKT', 'Marketing and advertising'),
    ('IT', 'IT', 'Information Technology'),
    ('HR', 'HR', 'Human Resources'),
    ('Facilities', 'FAC', 'Facilities and rent'),
    ('Legal', 'LEG', 'Legal and compliance'),
    ('Finance', 'FIN', 'Finance and accounting')
    ON CONFLICT DO NOTHING;
