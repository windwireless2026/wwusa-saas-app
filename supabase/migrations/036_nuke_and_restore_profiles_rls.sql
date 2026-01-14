-- Total access reset for profiles to fix the "disappearing user" issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. DROP ALL existing policies to start fresh
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
    END_LOOP;
END $$;

-- 2. Allow ALL authenticated users to SEE every profile
CREATE POLICY "authenticated_select_all" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- 3. Allow ALL authenticated users to INSERT profiles (necessary for the repair logic)
CREATE POLICY "authenticated_insert_all" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Allow users to update their own profile OR Super Admins to update everything
-- We use a simple non-recursive check for Super Admin
CREATE POLICY "authenticated_update_profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = id 
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'super_admin')
)
WITH CHECK (true);

-- 5. Allow Super Admins to delete
CREATE POLICY "authenticated_delete_profiles" 
ON public.profiles FOR DELETE 
TO authenticated 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'super_admin');
