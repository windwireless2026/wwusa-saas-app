-- Add deleted_at to inventory table for soft deletes
alter table public.inventory add column deleted_at timestamp with time zone;
