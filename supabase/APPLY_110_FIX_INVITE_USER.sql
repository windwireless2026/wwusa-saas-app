-- =============================================================================
-- CORREÇÃO: "Database error saving new user" ao convidar usuário
-- =============================================================================
-- Execute este script no Supabase: Dashboard → SQL Editor → New query → Cole e Run
--
-- 1) company_id: permitir NULL para o trigger inserir; a API preenche depois.
-- 2) Trigger: usar role_v2 (a coluna "role" foi removida).
-- 3) RLS: o trigger roda como usuário do banco; é preciso uma política que
--    permita esse INSERT (senão o INSERT do handle_new_user é bloqueado).
-- =============================================================================

-- 1) Permitir NULL em company_id
ALTER TABLE public.profiles ALTER COLUMN company_id DROP NOT NULL;

-- 2) Política para o trigger conseguir inserir em profiles
--    (o trigger roda como postgres/supabase_admin; sem esta política o INSERT é bloqueado por RLS)
DROP POLICY IF EXISTS "profiles_insert_trigger" ON public.profiles;
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin')
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    role_v2,
    company_id
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'first_name',
    'operacional'::user_role,
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
