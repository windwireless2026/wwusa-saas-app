-- Desabilita e reabilita o RLS para limpar qualquer trava residual
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove TODAS as políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Profiles are viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Super admins full access" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage everything" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- 1. Permissão TOTAL de leitura para qualquer pessoa logada (Garate que você se veja)
CREATE POLICY "Allow select for all" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- 2. Permissão TOTAL de gerenciamento (Insert, Update, Delete) para Super Admins
-- Usando uma verificação que não causa recursão
CREATE POLICY "Allow admin manage all" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'super_admin'
  ) OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'super_admin')
)
WITH CHECK (true);

-- 3. Caso você queira editar seu próprio perfil mesmo sem ser admin (fallback)
CREATE POLICY "Allow individual update" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
