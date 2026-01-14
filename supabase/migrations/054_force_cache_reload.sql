-- Force PostgREST cache reload by performing a dummy DDL change
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS _cache_reload_dummy BOOLEAN;
ALTER TABLE invoices DROP COLUMN IF EXISTS _cache_reload_dummy;

-- Ensure all columns for invoice_items are present just in case
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS ap_number_cache VARCHAR(20); -- Dummy
ALTER TABLE invoice_items DROP COLUMN IF EXISTS ap_number_cache;
