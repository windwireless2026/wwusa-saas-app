-- Add entry_date to inventory to track when items arrived in stock
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS entry_date DATE;

-- Update existing items to use created_at date as default entry_date
UPDATE public.inventory SET entry_date = created_at::DATE WHERE entry_date IS NULL;

-- Create an index for performance when filtering by entry date
CREATE INDEX IF NOT EXISTS idx_inventory_entry_date ON public.inventory(entry_date);
