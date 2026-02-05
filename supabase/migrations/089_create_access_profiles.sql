-- Migration 089: Create Access Profiles and Permissions System
-- Sistema de Perfis de Acesso com permissões granulares por módulo

-- ============================================
-- STEP 1: Create access_profiles table
-- ============================================

CREATE TABLE IF NOT EXISTS public.access_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL, -- Nome da empresa (não há tabela companies)
  name TEXT NOT NULL,
  description TEXT,
  is_system_profile BOOLEAN DEFAULT FALSE, -- Perfis do sistema não podem ser deletados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT unique_profile_name_per_company UNIQUE(company_name, name)
);

-- ============================================
-- STEP 2: Create access_profile_permissions table
-- ============================================

CREATE TYPE permission_level AS ENUM ('none', 'read', 'write');

CREATE TABLE IF NOT EXISTS public.access_profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.access_profiles(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL, -- Ex: 'dashboard', 'cadastro', 'financeiro', etc
  permission_level permission_level NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT unique_profile_module UNIQUE(profile_id, module_key)
);

-- ============================================
-- STEP 3: Add profile_id to profiles table
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_profile_id UUID REFERENCES public.access_profiles(id) ON DELETE SET NULL;

-- ============================================
-- STEP 4: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_access_profiles_company ON public.access_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_access_profile_permissions_profile ON public.access_profile_permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_access_profile ON public.profiles(access_profile_id);

-- ============================================
-- STEP 5: Enable RLS
-- ============================================

ALTER TABLE public.access_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_profile_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies for access_profiles
-- ============================================

-- Allow authenticated users to see profiles from their company
CREATE POLICY "Users can view access profiles from their company"
  ON public.access_profiles
  FOR SELECT
  USING (
    company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
  );

-- Only operacional and socio can manage access profiles
CREATE POLICY "Operacional and socio can manage access profiles"
  ON public.access_profiles
  FOR ALL
  USING (
    company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
  )
  WITH CHECK (
    company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
  );

-- ============================================
-- STEP 7: Create RLS Policies for access_profile_permissions
-- ============================================

-- Allow authenticated users to see permissions from profiles in their company
CREATE POLICY "Users can view permissions from their company profiles"
  ON public.access_profile_permissions
  FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM access_profiles 
      WHERE company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
    )
  );

-- Only operacional and socio can manage permissions
CREATE POLICY "Operacional and socio can manage permissions"
  ON public.access_profile_permissions
  FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM access_profiles 
      WHERE company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
    )
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM access_profiles 
      WHERE company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
    )
    AND (SELECT role_v2 FROM profiles WHERE id = auth.uid()) IN ('operacional', 'socio')
  );

-- ============================================
-- STEP 8: Create default system profiles
-- ============================================

-- Função para criar perfis padrão para uma empresa específica
CREATE OR REPLACE FUNCTION create_default_access_profiles_for_company(p_company_name TEXT)
RETURNS void AS $$
DECLARE
  v_administrador_profile_id UUID;
  v_diretoria_profile_id UUID;
  v_operacional_profile_id UUID;
  v_cliente_profile_id UUID;
  v_profile_exists INTEGER;
BEGIN
  -- Verificar se já existem perfis para esta empresa
  SELECT COUNT(*) INTO v_profile_exists
  FROM public.access_profiles
  WHERE company_name = p_company_name;
  
  -- Se já existem perfis, não criar novamente
  IF v_profile_exists > 0 THEN
    RETURN;
  END IF;
  
  -- Perfil Administrador (acesso total)
  INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
  VALUES (p_company_name, 'Administrador (acesso total)', 'Acesso completo a todos os módulos do sistema', TRUE)
  RETURNING id INTO v_administrador_profile_id;
  
  -- Permissões do Administrador (write em tudo)
  INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
  VALUES
    (v_administrador_profile_id, 'dashboard', 'write'),
    (v_administrador_profile_id, 'cadastro', 'write'),
    (v_administrador_profile_id, 'operations', 'write'),
    (v_administrador_profile_id, 'inventory', 'write'),
    (v_administrador_profile_id, 'comercial', 'write'),
    (v_administrador_profile_id, 'financeiro', 'write'),
    (v_administrador_profile_id, 'socios', 'write'),
    (v_administrador_profile_id, 'security', 'write'),
    (v_administrador_profile_id, 'settings', 'write');
  
  -- Perfil Diretoria (gestão executiva)
  INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
  VALUES (p_company_name, 'Diretoria (gestão executiva)', 'Acesso executivo com visualização de sócios', TRUE)
  RETURNING id INTO v_diretoria_profile_id;
  
  -- Permissões da Diretoria
  INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
  VALUES
    (v_diretoria_profile_id, 'dashboard', 'write'),
    (v_diretoria_profile_id, 'cadastro', 'write'),
    (v_diretoria_profile_id, 'operations', 'write'),
    (v_diretoria_profile_id, 'inventory', 'write'),
    (v_diretoria_profile_id, 'comercial', 'write'),
    (v_diretoria_profile_id, 'financeiro', 'write'),
    (v_diretoria_profile_id, 'socios', 'write'),
    (v_diretoria_profile_id, 'security', 'read'),
    (v_diretoria_profile_id, 'settings', 'write');
  
  -- Perfil Operacional (gestão)
  INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
  VALUES (p_company_name, 'Operacional (gestão)', 'Acesso de gestão operacional e administrativa', TRUE)
  RETURNING id INTO v_operacional_profile_id;
  
  -- Permissões do Operacional
  INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
  VALUES
    (v_operacional_profile_id, 'dashboard', 'write'),
    (v_operacional_profile_id, 'cadastro', 'write'),
    (v_operacional_profile_id, 'operations', 'write'),
    (v_operacional_profile_id, 'inventory', 'write'),
    (v_operacional_profile_id, 'comercial', 'write'),
    (v_operacional_profile_id, 'financeiro', 'write'),
    (v_operacional_profile_id, 'socios', 'none'),
    (v_operacional_profile_id, 'security', 'read'),
    (v_operacional_profile_id, 'settings', 'write');
  
  -- Perfil Cliente (visualização)
  INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
  VALUES (p_company_name, 'Cliente (visualização)', 'Acesso de visualização limitado', TRUE)
  RETURNING id INTO v_cliente_profile_id;
  
  -- Permissões do Cliente
  INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
  VALUES
    (v_cliente_profile_id, 'dashboard', 'read'),
    (v_cliente_profile_id, 'cadastro', 'none'),
    (v_cliente_profile_id, 'operations', 'none'),
    (v_cliente_profile_id, 'inventory', 'read'),
    (v_cliente_profile_id, 'comercial', 'read'),
    (v_cliente_profile_id, 'financeiro', 'read'),
    (v_cliente_profile_id, 'socios', 'none'),
    (v_cliente_profile_id, 'security', 'none'),
    (v_cliente_profile_id, 'settings', 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 9: Create helper function to get user permissions
-- ============================================

CREATE OR REPLACE FUNCTION get_user_module_permission(p_user_id UUID, p_module_key TEXT)
RETURNS permission_level AS $$
DECLARE
  v_permission permission_level;
BEGIN
  SELECT permission_level INTO v_permission
  FROM access_profile_permissions
  WHERE profile_id = (SELECT access_profile_id FROM profiles WHERE id = p_user_id)
    AND module_key = p_module_key;
  
  RETURN COALESCE(v_permission, 'none'::permission_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 10: Populate default profiles for existing companies
-- ============================================

DO $$
DECLARE
  v_company_name TEXT;
BEGIN
  -- Criar perfis para cada empresa única encontrada nos profiles
  FOR v_company_name IN 
    SELECT DISTINCT company_name 
    FROM public.profiles 
    WHERE company_name IS NOT NULL
  LOOP
    PERFORM create_default_access_profiles_for_company(v_company_name);
  END LOOP;
  
  RAISE NOTICE 'Created default profiles for % companies', 
    (SELECT COUNT(DISTINCT company_name) FROM public.profiles WHERE company_name IS NOT NULL);
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 089 completed: Access Profiles system created successfully';
END $$;
