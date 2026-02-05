'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import AccessProfileModal from '@/components/dashboard/AccessProfileModal';

interface AccessProfile {
  id: string;
  name: string;
  description: string | null;
  is_system_profile: boolean;
  created_at: string;
}

interface AccessProfilePermission {
  id: string;
  profile_id: string;
  module_key: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export default function AccessProfilesPage() {
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [permissions, setPermissions] = useState<Record<string, AccessProfilePermission[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<AccessProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = useSupabase();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Carregando perfis...');
      
      // Load profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('access_profiles')
        .select('*')
        .order('name');

      console.log('📊 Perfis retornados:', profilesData);
      console.log('❌ Erro perfis:', profilesError);

      if (profilesError) throw profilesError;

      // Load all permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('access_profile_permissions')
        .select('*');

      console.log('🔑 Permissões retornadas:', permissionsData);
      console.log('❌ Erro permissões:', permissionsError);

      if (permissionsError) throw permissionsError;

      // Group permissions by profile_id
      const permissionsByProfile: Record<string, AccessProfilePermission[]> = {};
      (permissionsData ?? []).forEach((perm: AccessProfilePermission) => {
        if (!permissionsByProfile[perm.profile_id]) {
          permissionsByProfile[perm.profile_id] = [];
        }
        permissionsByProfile[perm.profile_id].push(perm);
      });

      setProfiles(profilesData || []);
      setPermissions(permissionsByProfile);
    } catch (error) {
      console.error('Error loading profiles:', error);
      showToast({ type: 'error', message: 'Erro ao carregar perfis de acesso' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: AccessProfile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = async (profile: AccessProfile) => {
    if (profile.is_system_profile) {
      showToast({ type: 'error', message: 'Perfis do sistema não podem ser deletados' });
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar o perfil "${profile.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('access_profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      showToast({ type: 'success', message: 'Perfil deletado com sucesso' });
      loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      showToast({ type: 'error', message: 'Erro ao deletar perfil' });
    }
  };

  const handleModalClose = (saved: boolean) => {
    setIsModalOpen(false);
    setSelectedProfile(null);
    if (saved) {
      loadProfiles();
    }
  };

  const getPermissionSummary = (profileId: string) => {
    const perms = permissions[profileId] || [];
    const viewCount = perms.filter(p => p.can_view).length;
    const editCount = perms.filter(p => p.can_edit).length;
    const deleteCount = perms.filter(p => p.can_delete).length;

    return `${viewCount} visualizar, ${editCount} editar, ${deleteCount} excluir`;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
        <PageHeader
          title="Perfis de Acesso"
          description="Carregando..."
          icon="🔐"
          breadcrumbs={[
            { label: 'SEGURANÇA', href: '/security', color: '#dc2626' },
            { label: 'PERFIS DE ACESSO', color: '#dc2626' },
          ]}
          moduleColor="#dc2626"
        />
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Carregando perfis...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Perfis de Acesso"
        description="Gerencie perfis e permissões de acesso ao sistema"
        icon="🔐"
        breadcrumbs={[
          { label: 'SEGURANÇA', href: '/security', color: '#dc2626' },
          { label: 'PERFIS DE ACESSO', color: '#dc2626' },
        ]}
        moduleColor="#dc2626"
      />

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          {profiles.length} perfil(is) cadastrado(s)
        </div>
        <button
          onClick={handleCreateProfile}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
        >
          + Novo Perfil
        </button>
      </div>

      {/* Profiles Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '2px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            style={{
              padding: '20px 24px',
              borderBottom: index < profiles.length - 1 ? '1px solid #f1f5f9' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            {/* Nome e Descrição */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                  {profile.name}
                </h3>
                {profile.is_system_profile && (
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600',
                  }}>
                    SISTEMA
                  </span>
                )}
              </div>
              {profile.description && (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  {profile.description}
                </p>
              )}
            </div>

            {/* Permissões */}
            <div style={{
              background: '#f8fafc',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#475569',
              minWidth: '280px',
            }}>
              <strong>Permissões:</strong> {getPermissionSummary(profile.id)}
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEditProfile(profile)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                title="Editar"
              >
                ✏️
              </button>
              {!profile.is_system_profile && (
                <button
                  onClick={() => handleDeleteProfile(profile)}
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                  title="Deletar"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          border: '2px dashed #e2e8f0',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Nenhum perfil cadastrado
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Crie perfis de acesso para gerenciar permissões de usuários
          </p>
          <button
            onClick={handleCreateProfile}
            style={{
              background: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Criar Primeiro Perfil
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AccessProfileModal
          profile={selectedProfile}
          permissions={selectedProfile ? permissions[selectedProfile.id] : undefined}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
