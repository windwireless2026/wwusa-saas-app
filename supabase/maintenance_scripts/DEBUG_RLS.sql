-- DEBUG: Verificar RLS e Policies

-- 1. Verificar se o usuário atual consegue ver profiles
SELECT 
    id,
    email, 
    full_name,
    role,
    created_at
FROM public.profiles
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- 2. Ver qual é o auth.uid() atual
SELECT auth.uid() as current_user_id;

-- 3. Ver o role do usuário atual
SELECT id, email, role 
FROM public.profiles 
WHERE id = auth.uid();

-- 4. Listar todas as policies em profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- 5. Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';
