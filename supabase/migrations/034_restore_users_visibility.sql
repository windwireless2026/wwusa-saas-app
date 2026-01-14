-- Simplificando as regras para garantir visibilidade
DROP POLICY IF EXISTS "Profiles are viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Regra definitiva para visualização (SELECT)
CREATE POLICY "Enable read access for all authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Garante que o Super Admin tenha acesso total sem recursão (usando metadados do Auth)
DROP POLICY IF EXISTS "Super admins can manage everything" ON public.profiles;
CREATE POLICY "Super admins full access"
ON public.profiles FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'super_admin')
);
