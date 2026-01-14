-- Add resale_certificate_expiry_year to agents table
alter table agents add column if not exists resale_certificate_expiry_year int;
