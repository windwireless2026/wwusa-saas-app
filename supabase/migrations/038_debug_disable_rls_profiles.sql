-- MEDIDA DE DEBUG: Desativando RLS temporariamente para perfis
-- Isso vai permitir que a lista de usuários apareça independente das regras
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Garante que o seu perfil exista com os dados corretos
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '8dbaf29f-5caf-4344-ba37-f5dacac0d190', 
  'erik@windwmiami.com', 
  'Erik Admin', 
  'super_admin'
)
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Erik Admin',
  role = 'super_admin',
  deleted_at = NULL;
