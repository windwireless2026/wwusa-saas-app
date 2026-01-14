-- Migration to enhance profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Migrate full_name to first/last name if possible (simple split)
UPDATE public.profiles 
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = substring(full_name from position(' ' in full_name) + 1)
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- Update RLS for profiles to handle soft delete
CREATE POLICY "Super admins can delete (soft-delete) profiles" ON public.profiles
FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and role = 'super_admin'
  )
);
