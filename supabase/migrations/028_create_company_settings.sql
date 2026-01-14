-- Create company_settings table for storing legal/business information
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Legal Information
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    ein TEXT,
    
    -- Contact Information
    website TEXT,
    email TEXT,
    phone TEXT,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Additional Legal Info
    corporate_structure TEXT,
    state_of_incorporation TEXT,
    incorporation_date DATE,
    
    -- Branding
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read company settings" ON company_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update company settings" ON company_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert company settings" ON company_settings;

-- RLS Policies - Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
    ON company_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anon to read settings (for public access if needed)
CREATE POLICY "Allow anon to read company settings"
    ON company_settings
    FOR SELECT
    TO anon
    USING (true);

-- Insert default company settings if table is empty
INSERT INTO company_settings (legal_name, trade_name, country)
SELECT 'Your Company Name', 'Your Trade Name', 'US'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
