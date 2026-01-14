-- Create sequence for AP Number
CREATE SEQUENCE IF NOT EXISTS invoice_ap_seq START 1001;

-- Add ap_number to invoices
ALTER TABLE invoices 
ADD COLUMN ap_number VARCHAR(20) UNIQUE;

-- Function to generate AP Number automatically
CREATE OR REPLACE FUNCTION generate_ap_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ap_number IS NULL THEN
        NEW.ap_number := 'AP-' || to_char(current_date, 'YYYY') || '-' || LPAD(nextval('invoice_ap_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to apply AP Number before insert
CREATE TRIGGER trigger_generate_ap_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_ap_number();
