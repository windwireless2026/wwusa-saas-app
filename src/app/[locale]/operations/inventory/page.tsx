'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import AddItemModal from '@/components/dashboard/AddItemModal';
import { useTranslations } from 'next-intl';
import { processInventoryFile } from '@/lib/inventoryImport';
import ColumnFilter from '@/components/ui/ColumnFilter';
import StockEntryWizard from '@/components/dashboard/StockEntryWizard';
import PageHeader from '@/components/ui/PageHeader';

type InventoryItem = {
  id: string;
  model: string;
  capacity: string;
  color: string;
  grade: string;
  price: number;
  status: string;
  imei?: string;
  serial_number?: string;
  purchase_invoice?: string;
  created_at: string;
  created_by?: string;
  location_id?: string | null;
  profiles?: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email?: string | null;
  } | null;
  stock_locations?: { name: string | null; is_wind_stock?: boolean } | null;
};

export default function InventoryPage() {
  const t = useTranslations('Dashboard.Inventory');
  const supabase = useSupabase(); // Hook com instância única
  const tCommon = useTranslations('Dashboard.Common');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { alert } = useUI();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Available');

  const [allModels, setAllModels] = useState<string[]>([]);
  const [allCapacities, setAllCapacities] = useState<string[]>([]);
  const [allColors, setAllColors] = useState<string[]>([]);
  const [allGrades, setAllGrades] = useState<string[]>([]);

  // Filtros de coluna tipo Excel
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [windLocations, setWindLocations] = useState<string[]>([]);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('Available');
    setSelectedModels(allModels);
    setSelectedCapacities(allCapacities);
    setSelectedColors(allColors);
    setSelectedGrades(allGrades);
    setSelectedStatuses(uniqueStatuses);
    setSelectedLocations(windLocations.length > 0 ? windLocations : allLocations);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    // Fetch inventory sem join para evitar erro de RLS/relação; locais buscados separadamente
    const { data: invData, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (invError) {
      console.error('Error fetching inventory:', invError?.message || invError?.code || invError);
      setItems([]);
      setLoading(false);
      return;
    }

    const list = (invData || []) as InventoryItem[];
    const locationIds = [...new Set(list.map((i: InventoryItem) => i.location_id).filter(Boolean))] as string[];
    let locationMap: Record<string, { name: string | null; is_wind_stock?: boolean }> = {};
    if (locationIds.length > 0) {
      const { data: locData } = await supabase
        .from('stock_locations')
        .select('id, name, is_wind_stock')
        .in('id', locationIds);
      if (locData) {
        locData.forEach((row: { id: string; name: string | null; is_wind_stock?: boolean }) => {
          locationMap[row.id] = { name: row.name, is_wind_stock: row.is_wind_stock ?? false };
        });
      }
    }

    const createdByIds = [...new Set(list.map((i: InventoryItem) => i.created_by).filter(Boolean))] as string[];
    let profilesMap: Record<string, { full_name: string | null; first_name: string | null; last_name: string | null; email?: string }> = {};
    if (createdByIds.length > 0) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, email')
        .in('id', createdByIds);
      if (profData) {
        profData.forEach((row: { id: string; full_name: string | null; first_name: string | null; last_name: string | null; email?: string }) => {
          profilesMap[row.id] = { full_name: row.full_name, first_name: row.first_name, last_name: row.last_name, email: row.email };
        });
      }
    }

    const itemsWithLocations = list.map((i: InventoryItem) => ({
      ...i,
      stock_locations: i.location_id ? locationMap[i.location_id] ?? null : null,
      profiles: i.created_by ? profilesMap[i.created_by] ?? null : null,
    }));

    setItems(itemsWithLocations);
    setAllModels(Array.from(new Set(list.map((i: InventoryItem) => i.model))).sort() as string[]);
    setAllCapacities(Array.from(new Set(list.map((i: InventoryItem) => i.capacity))).sort() as string[]);
    setAllColors(Array.from(new Set(list.map((i: InventoryItem) => i.color).filter(Boolean))).sort() as string[]);
    setAllGrades(Array.from(new Set(list.map((i: InventoryItem) => i.grade).filter(Boolean))).sort() as string[]);
    const allLocs = Array.from(new Set(itemsWithLocations.map((i: InventoryItem) => i.stock_locations?.name || 'Sem Local'))).sort() as string[];
    setAllLocations(allLocs);
    const windLocs = Array.from(new Set(itemsWithLocations.filter((i: InventoryItem) => i.stock_locations?.is_wind_stock).map((i: InventoryItem) => i.stock_locations?.name || 'Sem Local'))).sort() as string[];
    setWindLocations(windLocs);
    setLoading(false);
  };

  // Opções únicas para filtros
  const uniqueStatuses = useMemo(
    () => ['Available', 'Sold', 'Reserved', 'RMA', 'Damaged'],
    []
  );

  // Sincronizar filtros: Garante que novos modelos/capacidades/etc sejam selecionados por padrão
  useEffect(() => {
    if (items.length > 0) {
      setSelectedModels(prev => {
        if (prev.length === 0 && allModels.length > 0) return allModels;
        const newItems = allModels.filter(m => !prev.includes(m));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
      setSelectedCapacities(prev => {
        if (prev.length === 0 && allCapacities.length > 0) return allCapacities;
        const newItems = allCapacities.filter(c => !prev.includes(c));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
      setSelectedColors(prev => {
        if (prev.length === 0 && allColors.length > 0) return allColors;
        const newItems = allColors.filter(c => !prev.includes(c));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
      setSelectedGrades(prev => {
        if (prev.length === 0 && allGrades.length > 0) return allGrades;
        const newItems = allGrades.filter(g => !prev.includes(g));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
      setSelectedStatuses(prev => {
        if (prev.length === 0) return uniqueStatuses;
        return prev;
      });
      setSelectedLocations(prev => {
        if (prev.length === 0 && (windLocations.length > 0 || allLocations.length > 0)) {
          return windLocations.length > 0 ? windLocations : allLocations;
        }
        const newItems = (windLocations.length > 0 ? windLocations : allLocations).filter(l => !prev.includes(l));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
  }, [allModels, allCapacities, allColors, allGrades, uniqueStatuses, windLocations, allLocations, items.length]);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      await processInventoryFile(file, alert);
      await fetchInventory();
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const filteredItems = items.filter(item => {
    // Only show inventory tied to stock locations marked as WIND (estoque)
    if (item.stock_locations && !item.stock_locations.is_wind_stock) return false;

    // Filtro por busca global
    const matchesGlobal =
      search === '' ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      (item.imei || '').includes(search) ||
      (item.serial_number || '').toLowerCase().includes(search.toLowerCase());

    // Filtros de coluna (tipo Excel)
    const matchesColumnModel = selectedModels.length === 0 || selectedModels.includes(item.model);
    const matchesColumnCapacity = selectedCapacities.length === 0 || selectedCapacities.includes(item.capacity);
    // For color and grade, also allow empty values if no filter is set
    const matchesColumnColor = selectedColors.length === 0 || selectedColors.includes(item.color || '') || (!item.color && allColors.length === 0);
    const matchesColumnGrade = selectedGrades.length === 0 || selectedGrades.includes(item.grade || '') || (!item.grade && allGrades.length === 0);
    const matchesColumnStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchesColumnLocation = selectedLocations.length === 0 || selectedLocations.includes(item.stock_locations?.name || 'Sem Local');

    return (
      matchesGlobal &&
      matchesColumnModel &&
      matchesColumnCapacity &&
      matchesColumnColor &&
      matchesColumnGrade &&
      matchesColumnStatus &&
      matchesColumnLocation &&
      (filterStatus === '' || item.status === filterStatus)
    );
  });

  const getAvailability = (status: string) => {
    switch (status) {
      case 'Available':
        return { label: 'Em estoque', color: '#0ea5e9', bg: '#e0f2fe' };
      case 'Reserved':
        return { label: 'Em trânsito', color: '#f59e0b', bg: '#fef3c7' };
      case 'Sold':
        return { label: 'Vendido', color: '#ef4444', bg: '#fee2e2' };
      default:
        return { label: status || '-', color: '#94a3b8', bg: '#f8fafc' };
    }
  };

  const thStyle = {
    padding: '16px 24px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid #e2e8f0',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ padding: '40px', width: '100%', minWidth: 0 }}>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInventory}
        item={editingItem}
      />

      <StockEntryWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={fetchInventory}
      />

      <PageHeader
        title="Estoque"
        description="Gerenciar itens do estoque"
        icon="📦"
        breadcrumbs={[
          { label: 'OPERAÇÕES', href: '/operations', color: '#7c3aed' },
          { label: 'ESTOQUE', color: '#7c3aed' },
        ]}
        moduleColor="#7c3aed"
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '24px',
          padding: '4px'
        }}
      >
        <button
          onClick={() => setSelectedLocations(windLocations.length > 0 ? windLocations : allLocations)}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: selectedLocations.length === (windLocations.length > 0 ? windLocations.length : allLocations.length) ? '#7c3aed' : '#fff',
            color: selectedLocations.length === (windLocations.length > 0 ? windLocations.length : allLocations.length) ? '#fff' : '#64748b',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: selectedLocations.length === (windLocations.length > 0 ? windLocations.length : allLocations.length) ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none'
          }}
        >
          📍 Todos os Locais
        </button>
        {(windLocations.length > 0 ? windLocations : allLocations).filter(l => l !== 'Sem Local').map(loc => {
          const isSelected = selectedLocations.length === 1 && selectedLocations[0] === loc;
          return (
            <button
              key={loc}
              onClick={() => setSelectedLocations([loc])}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: isSelected ? '#7c3aed' : '#fff',
                color: isSelected ? '#fff' : '#475569',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.15)' : 'none'
              }}
            >
              🏢 {loc}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
        }}
      >
        <div style={{ position: 'relative', width: '400px', flexShrink: 0 }}>
          <span
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.5,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Pesquisar por modelo, IMEI, serial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              fontSize: '15px',
              outline: 'none',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.3,
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontWeight: '700',
                color: '#1e293b',
                appearance: 'none',
                background: '#fff',
                cursor: 'pointer',
                minWidth: '160px',
                textAlign: 'center',
              }}
            >
              <option value="">📁 {tCommon('all')}</option>
              <option value="Available">🟢 Disponíveis</option>
              <option value="Reserved">🟡 Reservados</option>
              <option value="Sold">🔴 Vendidos</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                fontSize: '10px',
                opacity: 0.3,
              }}
            >
              ▼
            </div>
          </div>

          <button
            onClick={resetFilters}
            style={{
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            🧹 Limpar
          </button>

          <button
            onClick={handleNewItem}
            style={{
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            + Novo Item
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            style={{
              background: '#fff',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📥 Planilha
          </button>
        </div>
      </div>


      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'visible',
          boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ position: 'sticky', top: -1, zIndex: 100 }}>
            <tr style={{ background: '#f8fafc' }}>
              <th style={thStyle}>
                <ColumnFilter
                  label={t('table.model')}
                  options={allModels}
                  selected={selectedModels}
                  onChange={setSelectedModels}
                />
              </th>
              <th style={thStyle}>{t('table.imei')}</th>
              <th style={thStyle}>
                <ColumnFilter
                  label={t('table.capacity')}
                  options={allCapacities}
                  selected={selectedCapacities}
                  onChange={setSelectedCapacities}
                />
              </th>
              <th style={thStyle}>
                <ColumnFilter
                  label={t('table.color')}
                  options={allColors}
                  selected={selectedColors}
                  onChange={setSelectedColors}
                />
              </th>
              <th style={thStyle}>
                <ColumnFilter
                  label={t('table.grade')}
                  options={allGrades}
                  selected={selectedGrades}
                  onChange={setSelectedGrades}
                />
              </th>
              <th style={thStyle}>
                <ColumnFilter
                  label="Disponibilidade"
                  options={['Available', 'Reserved', 'Sold']}
                  selected={selectedStatuses}
                  onChange={setSelectedStatuses}
                />
              </th>
              <th style={thStyle}>{t('table.price')}</th>
              <th style={thStyle}>Criado por</th>
              <th style={thStyle}>
                <ColumnFilter
                  label="Local"
                  options={windLocations.length > 0 ? windLocations : allLocations}
                  selected={selectedLocations}
                  onChange={setSelectedLocations}
                />
              </th>
              <th style={thStyle}>{t('table.date')}</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                  Carregando estoque...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                >
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0f172a' }}>
                    {item.model}
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        fontWeight: '500',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background:
                            item.status === 'Available'
                              ? '#10b981'
                              : item.status === 'Sold'
                                ? '#ef4444'
                                : '#f59e0b',
                        }}
                      />
                      {item.status === 'Available'
                        ? 'Disponível'
                        : item.status === 'Sold'
                          ? 'Vendido'
                          : 'Reservado'}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '16px 24px',
                      color: '#475569',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    }}
                  >
                    {item.imei || item.serial_number || '---'}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{item.capacity}</td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{item.color}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {(() => {
                      const { label, color, bg } = getAvailability(item.status);
                      return (
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: '10px',
                            background: bg,
                            color,
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '800', color: '#0f172a' }}>
                    ${item.price}
                  </td>
                  <td
                    style={{
                      padding: '16px 24px',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    {item.profiles?.full_name ||
                      (item.profiles?.first_name ? `${item.profiles.first_name} ${item.profiles.last_name || ''}`.trim() : null) ||
                      item.profiles?.email?.split('@')[0] ||
                      '---'}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>
                    {item.stock_locations?.name || '---'}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '12px' }}>
                    {new Date(item.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        tr:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
