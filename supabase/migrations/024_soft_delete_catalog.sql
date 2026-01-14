-- Add deleted_at column to product_catalog for soft delete support
alter table public.product_catalog add column if not exists deleted_at timestamp with time zone;
