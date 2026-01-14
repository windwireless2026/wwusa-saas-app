-- Força a criação/atualização do perfil do Erik como Super Admin
-- Usando o ID que vimos no seu print do Supabase
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '8dbaf29f-5caf-4344-ba37-f5dacac0d190', 
  'erik@windwmiami.com', 
  'Erik', 
  'super_admin', 
  now(), 
  now()
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'super_admin',
  full_name = 'Erik',
  deleted_at = NULL; -- Garante que não está na lixeira

-- Garante que o trigger de novos usuários também os coloque como super_admin por enquanto (para facilitar seu teste)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'super_admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
