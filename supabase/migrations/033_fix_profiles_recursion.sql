-- Fix for infinite recursion in profiles policy
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 1. Permite que qualquer usuário autenticado veja os perfis (evita problemas na listagem)
CREATE POLICY "Profiles are viewable by authenticated" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- 2. Permite que o usuário edite o SEU PRÓPRIO perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Regra de Super Admin sem recursão: 
-- Em vez de olhar na tabela 'profiles', verificamos o metadado do usuário no Auth
CREATE POLICY "Super admins can manage everything" 
ON public.profiles FOR ALL 
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'super_admin') 
  OR 
  (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'))
);
