-- Migration to add created_by to inventory table
ALTER TABLE public.inventory 
ADD COLUMN created_by uuid REFERENCES public.profiles(id);

-- Update RLS if necessary (it should be fine since we already check auth.uid() in existing policies)
-- But we can add a comment for clarity
COMMENT ON COLUMN public.inventory.created_by IS 'The user who created this inventory item';
