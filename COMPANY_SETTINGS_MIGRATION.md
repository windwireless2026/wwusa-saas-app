# Company Settings Migration

Execute este SQL no Supabase Dashboard (SQL Editor) para criar a tabela de configurações da empresa:

```sql
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

-- RLS Policies
CREATE POLICY "Allow authenticated users to read company settings"
    ON company_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update company settings"
    ON company_settings FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert company settings"
    ON company_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Insert default company settings
INSERT INTO company_settings (legal_name, trade_name, country)
VALUES ('Your Company Name', 'Your Trade Name', 'US');
```

## Para criar o bucket de storage (opcional):

1. Vá em **Storage** no Supabase Dashboard
2. Clique em **New bucket**
3. Nome: `public`
4. Deixe **Public bucket** marcado
5. Clique em **Create bucket**
