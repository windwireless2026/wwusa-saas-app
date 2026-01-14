-- Add commercial template columns to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS estimate_notes_template TEXT DEFAULT 'AUCTION - NO TEST - NO WARRANTY',
ADD COLUMN IF NOT EXISTS estimate_terms_template TEXT DEFAULT 'FOB Miami, USA. Wind Wireless, LLC does not guarantee battery percentage or product colors. This invoice documents a sale to the client listed in "Bill To." Final delivery is made per the customer''s instructions.',
ADD COLUMN IF NOT EXISTS estimate_payment_methods_template TEXT DEFAULT '1) CITIBANK: Wind Wireless Enterprises LLC, 175 SW 7th St, Ste 1602, Miami, FL 33130. 2) Zelle: wind.wireless2022@gmail.com. 3) Conduit Technology Inc (USDT).',
ADD COLUMN IF NOT EXISTS sales_order_notes_template TEXT,
ADD COLUMN IF NOT EXISTS sales_order_terms_template TEXT,
ADD COLUMN IF NOT EXISTS sales_order_payment_methods_template TEXT;

-- Update the upsert_company_settings function to handle the new fields
-- Since we don't have the original source, we create a robust one that handles a jsonb object
CREATE OR REPLACE FUNCTION public.upsert_company_settings(settings_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.company_settings) THEN
        UPDATE public.company_settings
        SET 
            legal_name = COALESCE(settings_data->>'legal_name', legal_name),
            trade_name = COALESCE(settings_data->>'trade_name', trade_name),
            ein = COALESCE(settings_data->>'ein', ein),
            website = COALESCE(settings_data->>'website', website),
            email = COALESCE(settings_data->>'email', email),
            phone = COALESCE(settings_data->>'phone', phone),
            address_line1 = COALESCE(settings_data->>'address_line1', address_line1),
            address_line2 = COALESCE(settings_data->>'address_line2', address_line2),
            city = COALESCE(settings_data->>'city', city),
            state = COALESCE(settings_data->>'state', state),
            zip_code = COALESCE(settings_data->>'zip_code', zip_code),
            country = COALESCE(settings_data->>'country', country),
            corporate_structure = COALESCE(settings_data->>'corporate_structure', corporate_structure),
            state_of_incorporation = COALESCE(settings_data->>'state_of_incorporation', state_of_incorporation),
            incorporation_date = (settings_data->>'incorporation_date')::date,
            estimate_notes_template = COALESCE(settings_data->>'estimate_notes_template', estimate_notes_template),
            estimate_terms_template = COALESCE(settings_data->>'estimate_terms_template', estimate_terms_template),
            estimate_payment_methods_template = COALESCE(settings_data->>'estimate_payment_methods_template', estimate_payment_methods_template),
            sales_order_notes_template = COALESCE(settings_data->>'sales_order_notes_template', sales_order_notes_template),
            sales_order_terms_template = COALESCE(settings_data->>'sales_order_terms_template', sales_order_terms_template),
            sales_order_payment_methods_template = COALESCE(settings_data->>'sales_order_payment_methods_template', sales_order_payment_methods_template),
            updated_at = NOW();
    ELSE
        INSERT INTO public.company_settings (
            legal_name, trade_name, ein, website, email, phone, 
            address_line1, address_line2, city, state, zip_code, country,
            corporate_structure, state_of_incorporation, incorporation_date,
            estimate_notes_template, estimate_terms_template, estimate_payment_methods_template,
            sales_order_notes_template, sales_order_terms_template, sales_order_payment_methods_template
        ) VALUES (
            COALESCE(settings_data->>'legal_name', 'Your Company'),
            settings_data->>'trade_name',
            settings_data->>'ein',
            settings_data->>'website',
            settings_data->>'email',
            settings_data->>'phone',
            settings_data->>'address_line1',
            settings_data->>'address_line2',
            settings_data->>'city',
            settings_data->>'state',
            settings_data->>'zip_code',
            COALESCE(settings_data->>'country', 'US'),
            settings_data->>'corporate_structure',
            settings_data->>'state_of_incorporation',
            (settings_data->>'incorporation_date')::date,
            settings_data->>'estimate_notes_template',
            settings_data->>'estimate_terms_template',
            settings_data->>'estimate_payment_methods_template',
            settings_data->>'sales_order_notes_template',
            settings_data->>'sales_order_terms_template',
            settings_data->>'sales_order_payment_methods_template'
        );
    END IF;
END;
$$;
