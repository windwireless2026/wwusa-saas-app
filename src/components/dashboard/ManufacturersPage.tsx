'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import AddManufacturerModal from './AddManufacturerModal';
import ColumnFilter from '@/components/ui/ColumnFilter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

interface Manufacturer {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  created_at: string;
}

export default function ManufacturersPage() {
  const supabase = useSupabase();
  const t = useTranslations('Dashboard.Registration.manufacturers');
  const tReg = useTranslations('Dashboard.Registration');
  const { alert, confirm, toast } = useUI();
  const queryClient = useQueryClient();

  // State
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Column selection state
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);

  // React Query Fetching
  const { data: manufacturers = [], isLoading: loading } = useQuery({
    queryKey: ['manufacturers', showDeleted],
    queryFn: async () => {
      let query = supabase.from('manufacturers').select('*').order('name');
      if (showDeleted) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }
      const { data, error } = await query;
      if (error) {
        console.error('ManufacturersPage fetch error:', error?.message || error?.code || error);
        return [];
      }
      return (data || []) as Manufacturer[];
    },
  });

  // Mutations
  const restoreMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('manufacturers')
        .update({ deleted_at: null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Fabricante restaurado com sucesso!');
    },
    onError: (error: unknown) => {
      toast.error('Erro ao restaurar: ' + getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('manufacturers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      alert(tReg('success'), tReg('deleteSuccess'), 'success');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Handlers
  const handleRestore = async (id: string, name: string) => {
    const confirmed = await confirm(
      'Restaurar Fabricante',
      `Deseja restaurar "${name}" para a lista de ativos?`,
      'info'
    );
    if (confirmed) restoreMutation.mutate({ id });
  };

  const handleEdit = (m: Manufacturer) => {
    setEditingManufacturer(m);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm(
      tReg('confirmDeleteTitle'),
      `${tReg('confirmDeleteMessage')} "${name}"?`,
      'danger'
    );
    if (confirmed) deleteMutation.mutate({ id });
  };

  // Filter logic
  const uniqueNames = useMemo(
    () => [...new Set(manufacturers.map(m => m.name))].sort(),
    [manufacturers]
  );
  const uniqueWebsites = useMemo(
    () => [...new Set(manufacturers.map(m => m.website || '(Sem website)'))].sort(),
    [manufacturers]
  );

  useEffect(() => {
    if (manufacturers.length > 0 && !filtersInitialized) {
      setSelectedNames(uniqueNames);
      setSelectedWebsites(uniqueWebsites);
      setFiltersInitialized(true);
    }
  }, [manufacturers.length, filtersInitialized, uniqueNames, uniqueWebsites]);

  const filteredManufacturers = manufacturers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesNameFilter = selectedNames.includes(m.name);
    const matchesWebsiteFilter = selectedWebsites.includes(m.website || '(Sem website)');
    return matchesSearch && matchesNameFilter && matchesWebsiteFilter;
  });

  const clearFilters = () => {
    setSelectedNames(uniqueNames);
    setSelectedWebsites(uniqueWebsites);
    setSearch('');
  };

  const hasActiveFilters =
    selectedNames.length !== uniqueNames.length ||
    selectedWebsites.length !== uniqueWebsites.length ||
    search !== '';

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Fabricantes"
        description="Gestão de marcas e fabricantes de produtos"
        icon="🏭"
        breadcrumbs={[
          { label: 'OPERAÇÕES', href: '/operations', color: '#7c3aed' },
          { label: 'FABRICANTES', color: '#7c3aed' },
        ]}
        moduleColor="#7c3aed"
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
              {showDeleted ? 'Ver Ativos' : 'Ver Lixeira'}
            </button>
            <button
              onClick={() => {
                setEditingManufacturer(null);
                setIsAddModalOpen(true);
              }}
              style={{
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
              }}
            >
              {t('addNew')}
            </button>
          </div>
        }
      />

      {/* Search and Clear Filters */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
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
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '35%' }}>
                <ColumnFilter
                  label={t('tableName')}
                  options={uniqueNames}
                  selected={selectedNames}
                  onChange={setSelectedNames}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '35%' }}>
                <ColumnFilter
                  label={t('tableWebsite')}
                  options={uniqueWebsites}
                  selected={selectedWebsites}
                  onChange={setSelectedWebsites}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '30%' }}>
                {tReg('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center' }}>{tReg('loading')}</td></tr>
            ) : filteredManufacturers.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{tReg('noData')}</td></tr>
            ) : (
              filteredManufacturers.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {m.logo_url && (
                        <img src={m.logo_url} alt={m.name} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                      )}
                      {m.name}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {m.website ? (
                      <a
                        href={m.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {m.website.replace('https://', '').replace('www.', '')}
                      </a>
                    ) : (
                      '---'
                    )}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {!showDeleted ? (
                        <>
                          <button
                            onClick={() => handleEdit(m)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0ea5e9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(m.id, m.name)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(16,185,129,0.2)',
                            background: 'rgba(16,185,129,0.1)',
                            color: '#10B981',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Restaurar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddManufacturerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingManufacturer(null);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['manufacturers'] })}
        manufacturer={editingManufacturer || undefined}
      />
    </div>
  );
}
