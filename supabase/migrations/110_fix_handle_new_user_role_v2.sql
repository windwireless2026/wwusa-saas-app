-- Fix handle_new_user: profiles uses role_v2; company_id nullable; RLS policy for trigger insert.
-- Invite was failing: 1) role column dropped 2) company_id NOT NULL 3) RLS blocking trigger INSERT.

ALTER TABLE public.profiles ALTER COLUMN company_id DROP NOT NULL;

-- Allow trigger (runs as postgres/supabase_admin) to insert into profiles
DROP POLICY IF EXISTS "profiles_insert_trigger" ON public.profiles;
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles
  FOR INSERT
  WITH CHECK (current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    role_v2,
    company_id
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'first_name',
    'operacional'::user_role,
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
