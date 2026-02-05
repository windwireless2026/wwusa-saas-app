-- Script COMPLETO: Atualiza company_name E cria perfis em uma execução

DO $$
DECLARE
  v_company_name TEXT := 'WIND WIRELESS'; -- Nome da empresa
  v_administrador_id UUID;
  v_diretoria_id UUID;
  v_operacional_id UUID;
  v_cliente_id UUID;
BEGIN
  -- PASSO 1: Atualizar company_name do usuário atual
  UPDATE profiles
  SET company_name = v_company_name
  WHERE id = auth.uid();
  
  RAISE NOTICE 'Company_name atualizado para: %', v_company_name;
  
  -- PASSO 2: Criar perfis
  
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
  
  RAISE NOTICE 'Perfil Administrador criado';
  
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
  
  RAISE NOTICE 'Perfil Diretoria criado';
  
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
  
  RAISE NOTICE 'Perfil Operacional criado';
  
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
  
  RAISE NOTICE 'Perfil Cliente criado';
  
  RAISE NOTICE '✅ CONCLUÍDO! 4 perfis criados para: %', v_company_name;
END $$;

-- Verificar os perfis criados
SELECT 
  company_name,
  name,
  is_system_profile,
  created_at
FROM access_profiles
ORDER BY name;

-- Verificar permissões
SELECT 
  ap.name as perfil,
  COUNT(app.id) as total_permissoes
FROM access_profiles ap
LEFT JOIN access_profile_permissions app ON ap.id = app.profile_id
GROUP BY ap.name
ORDER BY ap.name;
