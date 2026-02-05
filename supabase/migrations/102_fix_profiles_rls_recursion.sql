-- Migration 102: Corrigir recursão infinita na política SELECT de profiles
-- A política usava (SELECT company_id FROM profiles WHERE id = auth.uid()), o que dispara
-- RLS de novo ao ler profiles → recursão. Usar get_user_company_id() (SECURITY DEFINER) evita isso.
-- Data: 2026-02-04

-- Garantir que a função existe (criada na 090)
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Recriar a política de SELECT usando a função (sem ler profiles sob RLS)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.get_user_company_id() = company_id
);
