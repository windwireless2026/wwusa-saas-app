-- Refine profiles RLS to ensure Super Admins have full control and users can manage themselves
DROP POLICY IF EXISTS "Super admins can delete (soft-delete) profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR 
         EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'))
  )
);

CREATE POLICY "Users can update own profile." ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure first_name and last_name are included in the select policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');
