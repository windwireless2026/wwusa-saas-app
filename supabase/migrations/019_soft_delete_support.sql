-- Add deleted_at column for soft delete support
alter table public.manufacturers add column if not exists deleted_at timestamp with time zone;
alter table public.product_types add column if not exists deleted_at timestamp with time zone;
