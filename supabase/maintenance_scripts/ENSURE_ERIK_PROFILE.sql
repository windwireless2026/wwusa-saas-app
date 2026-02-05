-- Garantir perfil para erik@windwmiami.com (User UID: 8dbaf29f-5caf-4344-ba37-f5dacac0d190)
-- Execute no Supabase: SQL Editor
-- Perfil Administrador (acesso total). Requer migration 101 para incluir 'administrador' nas políticas RLS.

-- 1) Verificar se existe company para vincular (opcional)
-- SELECT id, name FROM public.companies LIMIT 5;

-- 2) Inserir ou atualizar perfil (substitua COMPANY_ID pelo id real da tabela companies, se existir)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  first_name,
  last_name,
  company_id,
  role_v2,
  created_at,
  updated_at
) VALUES (
  '8dbaf29f-5caf-4344-ba37-f5dacac0d190',
  'erik@windwmiami.com',
  'Erik',
  'Erik',
  'Admin',
  (SELECT id FROM public.companies LIMIT 1),  -- usa primeira company se existir; senão NULL
  'administrador',
  COALESCE((SELECT created_at FROM public.profiles WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190'), NOW()),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_id = COALESCE(profiles.company_id, EXCLUDED.company_id),
  role_v2 = 'administrador',
  updated_at = NOW();

-- 3) Verificar
SELECT id, email, full_name, company_id, role_v2, updated_at
FROM public.profiles
WHERE id = '8dbaf29f-5caf-4344-ba37-f5dacac0d190';
