'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/errors';

interface AccessProfile {
  id: string;
  name: string;
  description: string | null;
  is_system_profile: boolean;
}

interface AccessProfilePermission {
  id?: string;
  profile_id?: string;
  module_key: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface AccessProfileModalProps {
  profile: AccessProfile | null;
  permissions?: AccessProfilePermission[];
  onClose: (saved: boolean) => void;
}

// Complete route structure with hierarchy
const ROUTE_STRUCTURE = [
  {
    module: 'Dashboard',
    icon: '📊',
    routes: [
      { key: 'dashboard', name: 'Dashboard Principal' },
    ],
  },
  {
    module: 'Cadastro',
    icon: '📝',
    routes: [
      { key: 'cadastro', name: 'Cadastro (Módulo)' },
      { key: 'cadastro/catalog', name: 'Catálogo de Produtos' },
      { key: 'cadastro/manufacturers', name: 'Fabricantes' },
      { key: 'cadastro/product-types', name: 'Tipos de Produto' },
    ],
  },
  {
    module: 'Operações',
    icon: '📦',
    routes: [
      { key: 'operations', name: 'Operações (Módulo)' },
      { key: 'operations/inventory', name: 'Inteligência de Estoque' },
      { key: 'operations/product-types', name: 'Tipos de Produto' },
      { key: 'operations/manufacturers', name: 'Fabricantes' },
      { key: 'operations/models', name: 'Modelos' },
      { key: 'operations/stock-locations', name: 'Locais de Estoque' },
    ],
  },
  {
    module: 'Comercial',
    icon: '💼',
    routes: [
      { key: 'comercial', name: 'Comercial (Módulo)' },
      { key: 'comercial/budgets', name: 'Orçamentos' },
      { key: 'comercial/sales', name: 'Vendas' },
    ],
  },
  {
    module: 'Financeiro',
    icon: '💰',
    routes: [
      { key: 'financeiro', name: 'Financeiro (Módulo)' },
      { key: 'financeiro/accounts', name: 'Contas' },
      { key: 'financeiro/transactions', name: 'Transações' },
      { key: 'financeiro/reports', name: 'Relatórios' },
    ],
  },
  {
    module: 'Sócios',
    icon: '👥',
    routes: [
      { key: 'socios', name: 'Sócios (Módulo)' },
      { key: 'socios/partners', name: 'Parceiros' },
      { key: 'socios/distributions', name: 'Distribuições' },
    ],
  },
  {
    module: 'Segurança',
    icon: '🛡️',
    routes: [
      { key: 'security', name: 'Segurança (Módulo)' },
      { key: 'security/access-profiles', name: 'Perfis de Acesso' },
      { key: 'security/audit-logs', name: 'Logs de Auditoria' },
      { key: 'security/users', name: 'Usuários' },
    ],
  },
  {
    module: 'Configurações',
    icon: '⚙️',
    routes: [
      { key: 'settings', name: 'Configurações (Módulo)' },
      { key: 'settings/company', name: 'Dados da Empresa' },
      { key: 'settings/preferences', name: 'Preferências' },
    ],
  },
];

export default function AccessProfileModal({ profile, permissions, onClose }: AccessProfileModalProps) {
  const [name, setName] = useState(profile?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [routePermissions, setRoutePermissions] = useState<Record<string, { view: boolean; edit: boolean; delete: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const supabase = useSupabase();

  useEffect(() => {
    // Initialize permissions from existing data
    const initialPermissions: Record<string, { view: boolean; edit: boolean; delete: boolean }> = {};
    
    ROUTE_STRUCTURE.forEach(group => {
      group.routes.forEach(route => {
        const existingPerm = permissions?.find(p => p.module_key === route.key);
        initialPermissions[route.key] = {
          view: existingPerm?.can_view || false,
          edit: existingPerm?.can_edit || false,
          delete: existingPerm?.can_delete || false,
        };
      });
    });

    setRoutePermissions(initialPermissions);
  }, [permissions]);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', message: 'Digite um nome para o perfil' });
      return;
    }

    try {
      setSaving(true);
      console.log('🔵 Iniciando salvamento de perfil...');

      let profileId = profile?.id;

      if (profile) {
        console.log('🔵 Atualizando perfil existente:', profile.id);
        const { error: updateError } = await supabase
          .from('access_profiles')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar perfil:', updateError);
          throw updateError;
        }
        console.log('✅ Perfil atualizado com sucesso');
      } else {
        console.log('🔵 Criando novo perfil...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error('❌ Erro ao buscar usuário autenticado:', authError);
          throw new Error('Usuário não autenticado');
        }
        console.log('✅ Usuário autenticado:', authUser.id);

        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', authUser.id)
          .single();

        if (userError) {
          console.error('❌ Erro ao buscar company_id:', userError);
          throw userError;
        }
        console.log('✅ Dados do usuário:', userData);
        
        if (!userData?.company_id) {
          throw new Error('Usuário sem company_id definido');
        }
        console.log('✅ Company ID encontrado:', userData.company_id);

        console.log('🔵 Inserindo novo perfil...');
        const { data: newProfile, error: createError } = await supabase
          .from('access_profiles')
          .insert({
            company_id: userData.company_id,
            name: name.trim(),
            description: description.trim() || null,
            is_system_profile: false,
            created_by: authUser.id,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar perfil:', createError);
          throw createError;
        }
        console.log('✅ Perfil criado:', newProfile);
        profileId = newProfile.id;
      }

      // Delete existing permissions
      if (profile) {
        console.log('🔵 Deletando permissões antigas...');
        const { error: deleteError } = await supabase
          .from('access_profile_permissions')
          .delete()
          .eq('profile_id', profileId);
        
        if (deleteError) {
          console.error('❌ Erro ao deletar permissões:', deleteError);
          throw deleteError;
        }
        console.log('✅ Permissões antigas deletadas');
      }

      // Insert new permissions
      const permissionsToInsert = Object.entries(routePermissions).map(([routeKey, perms]) => ({
        profile_id: profileId,
        module_key: routeKey,
        can_view: perms.view,
        can_edit: perms.edit,
        can_delete: perms.delete,
      }));

      console.log('🔵 Inserindo permissões:', permissionsToInsert.length);
      const { error: permError } = await supabase
        .from('access_profile_permissions')
        .insert(permissionsToInsert);

      if (permError) {
        console.error('❌ Erro ao inserir permissões:', permError);
        throw permError;
      }
      console.log('✅ Permissões inseridas com sucesso');

      showToast({
        type: 'success',
        message: profile ? 'Perfil atualizado com sucesso' : 'Perfil criado com sucesso',
      });
      onClose(true);
    } catch (error: unknown) {
      console.error('❌ Error saving profile:', error);
      const errorMessage = getErrorMessage(error);
      console.error('❌ Error details:', errorMessage);
      showToast({ type: 'error', message: `Erro ao salvar perfil: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = (routeKey: string, permission: 'view' | 'edit' | 'delete', value: boolean) => {
    setRoutePermissions(prev => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        [permission]: value,
      },
    }));
  };

  const hasAnyPermission = (routeKey: string) => {
    const perms = routePermissions[routeKey];
    return perms?.view || perms?.edit || perms?.delete;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Header */}
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
          {profile ? 'Editar Perfil' : 'Novo Perfil'}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          Configure as permissões de acesso por módulo
        </p>

        {/* Profile Info */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
            Nome do Perfil
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gerente de Operações"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Acesso completo a operações e estoque"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Permissions Table */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            Permissões por Módulo
          </h3>

          {ROUTE_STRUCTURE.map((group, groupIndex) => (
            <div key={group.module} style={{
              marginBottom: groupIndex < ROUTE_STRUCTURE.length - 1 ? '24px' : '0',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Module Header */}
              <div style={{
                background: '#f8fafc',
                padding: '12px 16px',
                borderBottom: '2px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '20px' }}>{group.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                  {group.module}
                </span>
              </div>

              {/* Routes */}
              {group.routes.map((route, routeIndex) => {
                const perms = routePermissions[route.key] || { view: false, edit: false, delete: false };
                const noAccess = !hasAnyPermission(route.key);
                
                return (
                  <div
                    key={route.key}
                    style={{
                      padding: '16px',
                      borderBottom: routeIndex < group.routes.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: noAccess ? '#fafafa' : 'white',
                    }}
                  >
                    {/* Route Name */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: noAccess ? '#94a3b8' : '#475569',
                      }}>
                        {route.name}
                      </span>
                    </div>

                    {/* Sem Acesso Button + Checkboxes */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                    }}>
                      {/* Sem Acesso */}
                      <button
                        type="button"
                        onClick={() => {
                          setRoutePermissions(prev => ({
                            ...prev,
                            [route.key]: { view: false, edit: false, delete: false },
                          }));
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: noAccess ? '2px solid #dc2626' : '2px solid #e2e8f0',
                          background: noAccess ? '#fef2f2' : 'white',
                          color: noAccess ? '#dc2626' : '#64748b',
                          fontSize: '12px',
                          fontWeight: noAccess ? '600' : '500',
                          cursor: 'pointer',
                          minWidth: '90px',
                          transition: 'all 0.2s',
                        }}
                      >
                        Sem Acesso
                      </button>

                      <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                      {/* Visualizar */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        minWidth: '100px',
                      }}>
                        <input
                          type="checkbox"
                          checked={perms.view}
                          onChange={(e) => handlePermissionChange(route.key, 'view', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', color: '#475569' }}>Visualizar</span>
                      </label>

                      {/* Editar */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        minWidth: '80px',
                      }}>
                        <input
                          type="checkbox"
                          checked={perms.edit}
                          onChange={(e) => handlePermissionChange(route.key, 'edit', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', color: '#475569' }}>Editar</span>
                      </label>

                      {/* Excluir */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        minWidth: '80px',
                      }}>
                        <input
                          type="checkbox"
                          checked={perms.delete}
                          onChange={(e) => handlePermissionChange(route.key, 'delete', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', color: '#475569' }}>Excluir</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => onClose(false)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: saving ? '#94a3b8' : '#dc2626',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      </div>
    </div>
  );
}
