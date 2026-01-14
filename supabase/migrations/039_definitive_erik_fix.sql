-- Limpeza e reinserção definitiva
-- 1. Remove qualquer registro previo para evitar conflitos de ID ou email
DELETE FROM public.profiles WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';
DELETE FROM public.profiles WHERE email = 'erik@windwmiami.com';

-- 2. Insere novamente com todos os campos necessarios
INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    first_name, 
    last_name, 
    role, 
    created_at, 
    updated_at
)
VALUES (
    '8dbaf29f-5caf-4344-ba37-f5dacac0d190',
    'erik@windwmiami.com',
    'Erik Admin',
    'Erik',
    'Admin',
    'super_admin',
    now(),
    now()
);

-- 3. Garante que o RLS está escancarado para teste
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso_Geral_Autenticado" ON public.profiles;
CREATE POLICY "Acesso_Geral_Autenticado" 
ON public.profiles FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
