'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import AddProductTypeModal from './AddProductTypeModal';
import ColumnFilter from '@/components/ui/ColumnFilter';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

interface ProductType {
  id: string;
  name: string;
  tracking_method: string;
  icon: string | null;
  created_at: string;
}

export default function ProductTypesPage() {
  const supabase = useSupabase(); // Hook com instância única
  const t = useTranslations('Dashboard.Registration.product_types');
  const tReg = useTranslations('Dashboard.Registration');
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const { alert, confirm, toast } = useUI();

  // Filtros de coluna tipo Excel
  const [selectedTypeNames, setSelectedTypeNames] = useState<string[]>([]);
  const [selectedTrackingMethods, setSelectedTrackingMethods] = useState<string[]>([]);

  useEffect(() => {
    fetchTypes();
  }, [showDeleted]);

  const fetchTypes = async () => {
    setLoading(true);
    let query = supabase.from('product_types').select('*').order('name');

    if (showDeleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) {
      console.error('ProductTypesPage fetch error:', error?.message || error?.code || error);
      setTypes([]);
    } else {
      setTypes(data || []);
    }
    setLoading(false);
  };

  const handleRestore = async (id: string, name: string) => {
    const confirmed = await confirm(
      'Restaurar Categoria',
      `Deseja restaurar "${name}" para a lista de ativos?`,
      'info'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_types')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;
      await fetchTypes();
      toast.success('Categoria restaurada com sucesso!');
    } catch (error: unknown) {
      toast.error('Erro ao restaurar: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: ProductType) => {
    setEditingType(type);
    setIsAddModalOpen(true);
  };

  // Opções únicas para filtros
  const uniqueTypeNames = useMemo(
    () => [...new Set(types.map(t => t.name))].sort(),
    [types]
  );
  const uniqueTrackingMethods = useMemo(
    () => [...new Set(types.map(t => t.tracking_method))].sort(),
    [types]
  );

  // Inicializar filtros
  useEffect(() => {
    if (types.length > 0 && !filtersInitialized) {
      setSelectedTypeNames(uniqueTypeNames);
      setSelectedTrackingMethods(uniqueTrackingMethods);
      setFiltersInitialized(true);
    }
  }, [types.length, filtersInitialized, uniqueTypeNames, uniqueTrackingMethods]);

  // Filtrar dados
  const filteredTypes = types.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(search.toLowerCase());
    const matchesNameFilter = selectedTypeNames.includes(type.name);
    const matchesTrackingFilter = selectedTrackingMethods.includes(type.tracking_method);

    return matchesSearch && matchesNameFilter && matchesTrackingFilter;
  });

  const clearFilters = () => {
    setSelectedTypeNames(uniqueTypeNames);
    setSelectedTrackingMethods(uniqueTrackingMethods);
    setSearch('');
  };

  const hasActiveFilters =
    selectedTypeNames.length !== uniqueTypeNames.length ||
    selectedTrackingMethods.length !== uniqueTrackingMethods.length ||
    search !== '';

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm(
      tReg('confirmDeleteTitle'),
      `${tReg('confirmDeleteMessage')} "${name}"?`,
      'danger'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_types')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchTypes();
      toast.success(tReg('deleteSuccess'));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    overflow: 'hidden',
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    background: '#f8fafc',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#64748b',
    borderBottom: '2px solid rgba(0,0,0,0.05)',
  };

  const cellStyle: React.CSSProperties = {
    padding: '18px 24px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid rgba(0,0,0,0.03)',
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Tipos de Produto"
        description="Categorias e métodos de rastreamento (IMEI/Serial)"
        icon="🏷️"
        breadcrumbs={[
          { label: 'OPERAÇÕES', href: '/operations', color: '#7c3aed' },
          { label: 'TIPOS DE PRODUTO', color: '#7c3aed' },
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
                setEditingType(null);
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
                  options={uniqueTypeNames}
                  selected={selectedTypeNames}
                  onChange={setSelectedTypeNames}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '35%' }}>
                <ColumnFilter
                  label={t('tableTracking')}
                  options={uniqueTrackingMethods}
                  selected={selectedTrackingMethods}
                  onChange={setSelectedTrackingMethods}
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
            ) : filteredTypes.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{tReg('noData')}</td></tr>
            ) : (
              filteredTypes.map((type) => (
                <tr key={type.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{type.icon || '📦'}</span>
                      {type.name}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    <span style={{
                      background: type.tracking_method === 'serial' ? '#dcfce7' : '#fef9c3',
                      color: type.tracking_method === 'serial' ? '#166534' : '#854d0e',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {type.tracking_method}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {!showDeleted ? (
                        <>
                          <button
                            onClick={() => handleEdit(type)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0ea5e9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(type.id, type.name)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(type.id, type.name)}
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

      <AddProductTypeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingType(null);
        }}
        onSuccess={fetchTypes}
        productType={editingType || undefined}
      />
    </div >
  );
}
