-- Script para FORÇAR criação de perfis de acesso

-- ============================================
-- PASSO 1: Ver todas as empresas
-- ============================================
SELECT DISTINCT company_name 
FROM profiles 
WHERE company_name IS NOT NULL;

-- ============================================
-- PASSO 2: FORÇAR criação de perfis para TODAS as empresas
-- ============================================
DO $$
DECLARE
  v_company_name TEXT;
  v_administrador_id UUID;
  v_diretoria_id UUID;
  v_operacional_id UUID;
  v_cliente_id UUID;
BEGIN
  -- Para cada empresa encontrada
  FOR v_company_name IN 
    SELECT DISTINCT company_name 
    FROM public.profiles 
    WHERE company_name IS NOT NULL
  LOOP
    RAISE NOTICE 'Criando perfis para: %', v_company_name;
    
    -- Perfil Administrador
    INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
    VALUES (v_company_name, 'Administrador (acesso total)', 'Acesso completo a todos os módulos do sistema', TRUE)
    RETURNING id INTO v_administrador_id;
    
    INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
    VALUES
      (v_administrador_id, 'dashboard', 'write'),
      (v_administrador_id, 'cadastro', 'write'),
      (v_administrador_id, 'operations', 'write'),
      (v_administrador_id, 'inventory', 'write'),
      (v_administrador_id, 'comercial', 'write'),
      (v_administrador_id, 'financeiro', 'write'),
      (v_administrador_id, 'socios', 'write'),
      (v_administrador_id, 'security', 'write'),
      (v_administrador_id, 'settings', 'write');
    
    -- Perfil Diretoria
    INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
    VALUES (v_company_name, 'Diretoria (gestão executiva)', 'Acesso executivo com visualização de sócios', TRUE)
    RETURNING id INTO v_diretoria_id;
    
    INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
    VALUES
      (v_diretoria_id, 'dashboard', 'write'),
      (v_diretoria_id, 'cadastro', 'write'),
      (v_diretoria_id, 'operations', 'write'),
      (v_diretoria_id, 'inventory', 'write'),
      (v_diretoria_id, 'comercial', 'write'),
      (v_diretoria_id, 'financeiro', 'write'),
      (v_diretoria_id, 'socios', 'write'),
      (v_diretoria_id, 'security', 'read'),
      (v_diretoria_id, 'settings', 'write');
    
    -- Perfil Operacional
    INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
    VALUES (v_company_name, 'Operacional (gestão)', 'Acesso de gestão operacional e administrativa', TRUE)
    RETURNING id INTO v_operacional_id;
    
    INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
    VALUES
      (v_operacional_id, 'dashboard', 'write'),
      (v_operacional_id, 'cadastro', 'write'),
      (v_operacional_id, 'operations', 'write'),
      (v_operacional_id, 'inventory', 'write'),
      (v_operacional_id, 'comercial', 'write'),
      (v_operacional_id, 'financeiro', 'write'),
      (v_operacional_id, 'socios', 'none'),
      (v_operacional_id, 'security', 'read'),
      (v_operacional_id, 'settings', 'write');
    
    -- Perfil Cliente
    INSERT INTO public.access_profiles (company_name, name, description, is_system_profile)
    VALUES (v_company_name, 'Cliente (visualização)', 'Acesso de visualização limitado', TRUE)
    RETURNING id INTO v_cliente_id;
    
    INSERT INTO public.access_profile_permissions (profile_id, module_key, permission_level)
    VALUES
      (v_cliente_id, 'dashboard', 'read'),
      (v_cliente_id, 'cadastro', 'none'),
      (v_cliente_id, 'operations', 'none'),
      (v_cliente_id, 'inventory', 'read'),
      (v_cliente_id, 'comercial', 'read'),
      (v_cliente_id, 'financeiro', 'read'),
      (v_cliente_id, 'socios', 'none'),
      (v_cliente_id, 'security', 'none'),
      (v_cliente_id, 'settings', 'none');
    
    RAISE NOTICE 'Perfis criados para: %', v_company_name;
  END LOOP;
  
  RAISE NOTICE 'CONCLUÍDO! Total de empresas processadas: %', 
    (SELECT COUNT(DISTINCT company_name) FROM public.profiles WHERE company_name IS NOT NULL);
END $$;

-- ============================================
-- PASSO 3: VERIFICAR se foram criados
-- ============================================
SELECT 
  company_name,
  name,
  is_system_profile,
  created_at
FROM access_profiles
ORDER BY company_name, name;

-- ============================================
-- PASSO 4: VERIFICAR permissões
-- ============================================
SELECT 
  ap.company_name,
  ap.name as perfil,
  COUNT(app.id) as total_permissoes
FROM access_profiles ap
LEFT JOIN access_profile_permissions app ON ap.id = app.profile_id
GROUP BY ap.company_name, ap.name
ORDER BY ap.company_name, ap.name;
