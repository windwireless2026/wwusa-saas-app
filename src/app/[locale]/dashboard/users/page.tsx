'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import AddUserModal from '@/components/dashboard/AddUserModal';
import ColumnFilter from '@/components/ui/ColumnFilter';

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: string;
  address: string | null;
  created_at: string;
  deleted_at: string | null;
  job_title?: string;
};

export default function UsersPage() {
  const t = useTranslations('Dashboard.Users');
  const { alert, confirm } = useUI();
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

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Fetch Error:', error);
      await alert('Erro', error.message, 'danger');
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
    } catch (error: any) {
      await alert('Erro', 'Erro ao alterar status: ' + error.message, 'danger');
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
    <div style={{ padding: '0px', minHeight: '100vh', background: 'transparent' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
        📋 <a href="/dashboard/registration" style={{ fontWeight: '600', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}>Cadastro</a> › Usuários
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            👥 {t('title') || 'Gestão de Usuários'}
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Administre os membros da sua equipe e permissões
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setShowDeleted(!showDeleted);
            }}
            style={{
              background: showDeleted ? '#64748b' : 'white',
              color: showDeleted ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            + Convidar Usuário
          </button>
        </div>
      </div>

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
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '30%' }}>
                <ColumnFilter
                  label="Nome"
                  options={uniqueNames}
                  selected={selectedNames}
                  onChange={setSelectedNames}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '30%' }}>
                <ColumnFilter
                  label="Email"
                  options={uniqueEmails}
                  selected={selectedEmails}
                  onChange={setSelectedEmails}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '25%' }}>
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
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>Carregando usuários...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum usuário encontrado</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {user.full_name || '---'}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={roleTagStyle(user.role)}>{user.role}</span>
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

const roleTagStyle = (role: string) =>
  ({
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: role.includes('admin') ? '#fef2f2' : '#f0f9ff',
    color: role.includes('admin') ? '#ef4444' : '#0369a1',
  }) as any;
