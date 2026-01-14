-- 1. Garante que oErik Admin existe e está com o nome correto
INSERT INTO public.profiles (id, email, full_name, role)
SELECT auth.uid(), email, COALESCE(raw_user_meta_data->>'full_name', email), 'super_admin'
FROM auth.users
WHERE email = 'erik@windwmiami.com'
ON CONFLICT (id) DO UPDATE 
SET full_name = 'Erik Admin', role = 'super_admin';

-- 2. Atualiza itens sem criador para o Erik (se ele existir)
UPDATE public.inventory
SET created_by = (SELECT id FROM public.profiles WHERE email = 'erik@windwmiami.com' LIMIT 1)
WHERE created_by IS NULL;

-- 3. Garante que o RLS está permitindo a leitura de perfis por todos autenticados (para o join funcionar)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de perfis para todos" ON public.profiles;
CREATE POLICY "Permitir leitura de perfis para todos" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);
