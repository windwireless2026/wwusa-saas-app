-- FIX: Criar perfil para erik@windwmiami.com

-- 1. Verificar se o perfil existe
SELECT * FROM public.profiles WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';

-- 2. Se não existir, criar o perfil
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
)
VALUES (
    '8dbaf29f-5caf-4344-ba37-f5dacac0d190',
    'erik@windwmiami.com',
    'Erik Admin',
    'super_admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = 'super_admin',
    updated_at = NOW();

-- 3. Verificar após inserção
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';
