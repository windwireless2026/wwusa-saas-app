'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import AddProductModal from './AddProductModal';
import { useTranslations } from 'next-intl';
import ColumnFilter from '@/components/ui/ColumnFilter';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

interface ProductModel {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  release_year: number | null;
  created_at: string;
}

export default function CatalogPage() {
  const supabase = useSupabase(); // Hook com instância única
  const t = useTranslations('Dashboard.Catalog');
  const tTypes = useTranslations('Dashboard.ProductTypes');
  const tCommon = useTranslations('Dashboard.Common');
  const { alert, confirm, toast } = useUI();
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [manufacturerLogos, setManufacturerLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Filtros de coluna tipo Excel
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, [showDeleted]);

  const fetchInitialData = async () => {
    setLoading(true);
    // Fetch Manufacturers for logos
    const { data: mans } = await supabase.from('manufacturers').select('name, logo_url');
    if (mans) {
      const logoMap: Record<string, string> = {};
      mans.forEach((m: { name: string; logo_url: string | null }) => {
        if (m.logo_url) logoMap[m.name] = m.logo_url;
      });
      setManufacturerLogos(logoMap);
    }

    await fetchProducts();
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('product_catalog').select('*');

    if (showDeleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('CatalogPage fetch error:', error?.message || error?.code || error);
      setProducts([]);
      setLoading(false);
      return;
    }
    const list = data || [];
    const sorted = [...list].sort((a: ProductModel, b: ProductModel) => {
      if (a.release_year !== b.release_year) {
        return (b.release_year || 0) - (a.release_year || 0);
      }
      return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
    });
    setProducts(sorted);
    const years = Array.from(
      new Set(list.map((p: ProductModel) => p.release_year).filter((y: number | null) => y !== null))
    ) as number[];
    setAllYears(years.sort((a: number, b: number) => b - a));
    setLoading(false);
  };

  const handleRestore = async (id: string, name: string) => {
    const confirmed = await confirm(
      'Restaurar Modelo',
      `Deseja restaurar o modelo "${name}" para a lista de ativos?`,
      'info'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_catalog')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
      toast.success('Modelo restaurado com sucesso!');
    } catch (error: unknown) {
      toast.error('Erro ao restaurar: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: ProductModel) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  // Opções únicas para filtros Excel
  const uniqueTypes = useMemo(
    () => [...new Set(products.map((p: ProductModel) => p.type))].sort(),
    [products]
  );
  const uniqueModels = useMemo(
    () => [...new Set(products.map((p: ProductModel) => p.name))].sort(),
    [products]
  );
  const uniqueManufacturers = useMemo(
    () => [...new Set(products.map((p: ProductModel) => p.manufacturer))].sort(),
    [products]
  );
  const uniqueYears = useMemo(() => {
    const years = products.map((p: ProductModel) => p.release_year?.toString() || '(Sem ano)');
    return [...new Set(years)].sort().reverse();
  }, [products]);

  // Inicializar filtros
  useEffect(() => {
    if (products.length > 0 && !filtersInitialized) {
      setSelectedTypes(uniqueTypes);
      setSelectedModels(uniqueModels);
      setSelectedManufacturers(uniqueManufacturers);
      setSelectedYears(uniqueYears);
      setFiltersInitialized(true);
    }
  }, [products.length, filtersInitialized, uniqueTypes, uniqueModels, uniqueManufacturers, uniqueYears]);

  const filteredProducts = products.filter((p: ProductModel) => {
    // Busca global
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      (p.release_year?.toString() || '').includes(search);

    // Filtros de coluna Excel
    const matchesColumnType = selectedTypes.includes(p.type);
    const matchesColumnModel = selectedModels.includes(p.name);
    const matchesColumnManufacturer = selectedManufacturers.includes(p.manufacturer);
    const matchesColumnYear = selectedYears.includes(p.release_year?.toString() || '(Sem ano)');

    return (
      matchesSearch &&
      matchesColumnType &&
      matchesColumnModel &&
      matchesColumnManufacturer &&
      matchesColumnYear
    );
  });

  const clearFilters = () => {
    setSelectedTypes(uniqueTypes);
    setSelectedModels(uniqueModels);
    setSelectedManufacturers(uniqueManufacturers);
    setSelectedYears(uniqueYears);
    setSearch('');
  };

  const hasActiveFilters =
    selectedTypes.length !== uniqueTypes.length ||
    selectedModels.length !== uniqueModels.length ||
    selectedManufacturers.length !== uniqueManufacturers.length ||
    selectedYears.length !== uniqueYears.length ||
    search !== '';

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm(
      'Deletar Modelo',
      `Deseja realmente deletar o modelo "${name}"?`,
      'danger'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_catalog')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
      toast.success('Modelo deletado com sucesso!');
    } catch (error: unknown) {
      toast.error('Erro ao deletar: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const typeTagStyle = (type: string): React.CSSProperties => {
    const colors: Record<string, string> = {
      Celular: '#3B82F6',
      'Cell phone': '#3B82F6',
      Tablet: '#10B981',
      iPad: '#10B981',
      Relogio: '#F59E0B',
      Watch: '#F59E0B',
      Relógio: '#F59E0B',
      Fone: '#8B5CF6',
      AirPods: '#8B5CF6',
      Computador: '#EC4899',
      Macbook: '#EC4899',
      Accessory: '#64748b',
      TV: '#06B6D4',
    };
    const color = colors[type] || '#64748b';
    return {
      padding: '4px 10px',
      borderRadius: '6px',
      background: `${color}15`,
      color: color,
      fontSize: '12px',
      fontWeight: '600',
    };
  };

  const getManufacturerLogo = (name: string) => {
    return manufacturerLogos[name] || null;
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Catálogo de Modelos"
        description="Especificações e catálogo de produtos"
        icon="📱"
        breadcrumbs={[
          { label: 'OPERAÇÕES', href: '/operations', color: '#7c3aed' },
          { label: 'MODELOS', color: '#7c3aed' },
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
              {showDeleted ? t('viewActive') || 'Ver Ativos' : t('viewTrash') || 'Ver Lixeira'}
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
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
            {tCommon('clearFilters')}
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
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '20%' }}>
                <ColumnFilter
                  label={t('tableType')}
                  options={uniqueTypes}
                  selected={selectedTypes}
                  onChange={setSelectedTypes}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '20%' }}>
                <ColumnFilter
                  label={t('tableManufacturer')}
                  options={uniqueManufacturers}
                  selected={selectedManufacturers}
                  onChange={setSelectedManufacturers}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '30%' }}>
                <ColumnFilter
                  label={t('tableName')}
                  options={uniqueModels}
                  selected={selectedModels}
                  onChange={setSelectedModels}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '15%' }}>
                <ColumnFilter
                  label={t('tableYear')}
                  options={uniqueYears}
                  selected={selectedYears}
                  onChange={setSelectedYears}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '15%' }}>
                {tCommon('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>{tCommon('loading')}</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{tCommon('noRecords')}</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={typeTagStyle(p.type)}>{tTypes(p.type) || p.type}</span>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getManufacturerLogo(p.manufacturer) && (
                        <img
                          src={getManufacturerLogo(p.manufacturer) || ''}
                          alt={p.manufacturer}
                          style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }}
                        />
                      )}
                      {p.manufacturer}
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {p.release_year || '---'}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {!showDeleted ? (
                        <>
                          <button
                            onClick={() => handleEdit(p)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0ea5e9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(p.id, p.name)}
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
                          {tCommon('restore') || 'Restaurar'}
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

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        product={editingProduct}
      />

      <style jsx>{`
        .catalog-row:hover {
          background: rgba(0, 0, 0, 0.02);
        }
      `}</style>
    </div>
  );
}
