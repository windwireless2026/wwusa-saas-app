-- Add address fields to stock_locations
alter table public.stock_locations 
add column address text,
add column city text,
add column state text,
add column country text default 'USA',
add column zip_code text;
