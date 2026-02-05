'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import AddUserModal from '@/components/dashboard/AddUserModal';
import ColumnFilter from '@/components/ui/ColumnFilter';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: string;
  role_v2?: string | null;
  access_profile_id?: string | null;
  address: string | null;
  phone_country_code?: string | null;
  phone_number?: string | null;
  created_at: string;
  deleted_at: string | null;
  job_title?: string;
  access_profile?: {
    name: string;
    is_system_profile: boolean;
  };
};

export default function UsersPage() {
  const t = useTranslations('Dashboard.Users');
  const { alert, confirm, toast } = useUI();
  const supabase = useSupabase(); // Hook com instância única global

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Filtros de coluna
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [showDeleted]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profiles').select('*');
      if (showDeleted) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }
      const { data: profileData, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      const list = profileData || [];
      const accessProfileIds = [...new Set(list.map((p: { access_profile_id?: string | null }) => p.access_profile_id).filter(Boolean))] as string[];
      let accessProfileMap: Record<string, { name: string; is_system_profile: boolean }> = {};
      if (accessProfileIds.length > 0) {
        const { data: apData } = await supabase
          .from('access_profiles')
          .select('id, name, is_system_profile')
          .in('id', accessProfileIds);
        if (apData) {
          apData.forEach((row: { id: string; name: string; is_system_profile: boolean }) => {
            accessProfileMap[row.id] = { name: row.name, is_system_profile: row.is_system_profile };
          });
        }
      }
      const roleLabel: Record<string, string> = {
        operacional: 'Operacional',
        socio: 'Sócio',
        administrador: 'Administrador',
        cliente: 'Cliente',
      };
      const normalized: UserProfile[] = list.map((user: { access_profile_id?: string | null; role_v2?: string | null } & Record<string, unknown>) => {
        const ap = user.access_profile_id ? accessProfileMap[user.access_profile_id] : null;
        return {
          ...user,
          role: ap?.name || roleLabel[user.role_v2 as string] || user.role_v2 || 'Sem perfil',
          access_profile: ap ?? undefined,
        } as UserProfile;
      });
      setUsers(normalized);
    } catch (error: unknown) {
      console.error('Fetch Error:', error);
      toast.error(getErrorMessage(error));
      setUsers(prev => (prev.length > 0 ? prev : []));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const isDeactivating = !user.deleted_at;
    const actionText = isDeactivating ? 'Inativar' : 'Reativar';

    const confirmed = await confirm(
      `${actionText} Usuário`,
      `Deseja realmente ${actionText.toLowerCase()} o usuário ${user.full_name || user.email}?`,
      isDeactivating ? 'danger' : 'info'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: isDeactivating ? new Date().toISOString() : null })
        .eq('id', user.id);

      if (error) throw error;
      await alert(
        'Sucesso',
        `Usuário ${isDeactivating ? 'inativado' : 'reativado'} com sucesso!`,
        'success'
      );
      fetchUsers();
    } catch (error: unknown) {
      toast.error('Erro ao alterar status: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Extrair opções únicas para os filtros
  const uniqueNames = useMemo(
    () => [...new Set(users.map(u => u.full_name || '---'))].sort(),
    [users]
  );
  const uniqueEmails = useMemo(
    () => [...new Set(users.map(u => u.email))].sort(),
    [users]
  );
  const uniqueRoles = useMemo(
    () => [...new Set(users.map(u => u.role))].sort(),
    [users]
  );

  // Inicializar filtros com todos selecionados
  useEffect(() => {
    if (users.length > 0 && !filtersInitialized) {
      setSelectedNames(uniqueNames);
      setSelectedEmails(uniqueEmails);
      setSelectedRoles(uniqueRoles);
      setFiltersInitialized(true);
    }
  }, [users.length, filtersInitialized, uniqueNames, uniqueEmails, uniqueRoles]);

  const clearFilters = () => {
    setSelectedNames(uniqueNames);
    setSelectedEmails(uniqueEmails);
    setSelectedRoles(uniqueRoles);
    setSearch('');
  };

  const hasActiveFilters =
    selectedNames.length !== uniqueNames.length ||
    selectedEmails.length !== uniqueEmails.length ||
    selectedRoles.length !== uniqueRoles.length ||
    search !== '';

  const filteredUsers = users.filter(user => {
    // Filtro por busca global
    const term = search.toLowerCase();
    const matchesSearch =
      user.full_name?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term);

    // Filtros por coluna
    const matchesName = selectedNames.includes(user.full_name || '---');
    const matchesEmail = selectedEmails.includes(user.email);
    const matchesRole = selectedRoles.includes(user.role);

    return matchesSearch && matchesName && matchesEmail && matchesRole;
  });

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Gestão de Usuários"
        description="Administre os membros da sua equipe e permissões"
        icon="👥"
        breadcrumbs={[
          { label: 'SEGURANÇA', href: '/security', color: '#dc2626' },
          { label: 'USUÁRIOS', color: '#dc2626' },
        ]}
        moduleColor="#dc2626"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              style={{
                background: showDeleted ? '#64748b' : 'white',
                color: showDeleted ? 'white' : '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {showDeleted ? 'Ver Ativos' : 'Ver Inativos'}
            </button>
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsModalOpen(true);
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
              }}
            >
              + Convidar Usuário
            </button>
          </div>
        }
      />

      {/* Search and Clear Filters */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t('searchPlaceholder') || 'Buscar usuário...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
          }}
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🗑️ Limpar Filtros
          </button>
        )}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        overflowY: 'auto',
        overflowX: 'visible',
        height: '65vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
        position: 'relative',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 100 }}>
            <tr>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '22%' }}>
                <ColumnFilter
                  label="Nome"
                  options={uniqueNames}
                  selected={selectedNames}
                  onChange={setSelectedNames}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '25%' }}>
                <ColumnFilter
                  label="Email"
                  options={uniqueEmails}
                  selected={selectedEmails}
                  onChange={setSelectedEmails}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '18%' }}>
                Telefone
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '20%' }}>
                <ColumnFilter
                  label="Perfil"
                  options={uniqueRoles}
                  selected={selectedRoles}
                  onChange={setSelectedRoles}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '15%' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Carregando usuários...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum usuário encontrado</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {user.full_name || '---'}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '13px', color: '#475569' }}>
                    {user.phone_number ? (
                      <span>{user.phone_country_code} {user.phone_number}</span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>---</span>
                    )}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={roleTagStyle(user.role, user.access_profile?.is_system_profile)}>
                      {user.role}
                      {user.access_profile?.is_system_profile && ' 🔒'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#3b82f6', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: user.deleted_at ? '#10b981' : '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        title={user.deleted_at ? 'Reativar' : 'Inativar'}
                      >
                        {user.deleted_at ? '♻️' : '🚫'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </div>
  );
}

const roleTagStyle = (role: string, isSystemProfile?: boolean) =>
  ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: isSystemProfile 
      ? '#fef2f2' 
      : role.toLowerCase().includes('admin') || role.toLowerCase().includes('administrador')
      ? '#fef2f2'
      : '#f0f9ff',
    color: isSystemProfile
      ? '#dc2626'
      : role.toLowerCase().includes('admin') || role.toLowerCase().includes('administrador')
      ? '#ef4444'
      : '#0369a1',
  }) as any;
