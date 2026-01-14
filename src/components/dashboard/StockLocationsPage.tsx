'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import ColumnFilter from '@/components/ui/ColumnFilter';

interface StockLocation {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  created_at: string;
}

export default function StockLocationsPage() {
  const supabase = useSupabase(); // Hook com instância única
  const t = useTranslations('Dashboard.StockLocations');
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StockLocation | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState('');
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    zip_code: '',
  });
  const { alert, confirm } = useUI();

  // Filtros de coluna tipo Excel
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  useEffect(() => {
    fetchLocations();
  }, [showDeleted]);

  const fetchLocations = async () => {
    setLoading(true);
    let query = supabase.from('stock_locations').select('*').order('name');

    if (showDeleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data } = await query;
    if (data) setLocations(data);
    setLoading(false);
  };

  // Opções únicas para filtros
  const uniqueNames = useMemo(
    () => [...new Set(locations.map(l => l.name))].sort(),
    [locations]
  );
  const uniqueCities = useMemo(
    () => [...new Set(locations.map(l => l.city || '(Sem cidade)'))].sort(),
    [locations]
  );
  const uniqueStates = useMemo(
    () => [...new Set(locations.map(l => l.state || '(Sem estado)'))].sort(),
    [locations]
  );

  // Inicializar filtros
  useEffect(() => {
    if (locations.length > 0 && !filtersInitialized) {
      setSelectedNames(uniqueNames);
      setSelectedCities(uniqueCities);
      setSelectedStates(uniqueStates);
      setFiltersInitialized(true);
    }
  }, [locations.length, filtersInitialized, uniqueNames, uniqueCities, uniqueStates]);

  // Filtrar locations
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase());
    const matchesName = selectedNames.includes(loc.name);
    const matchesCity = selectedCities.includes(loc.city || '(Sem cidade)');
    const matchesState = selectedStates.includes(loc.state || '(Sem estado)');
    return matchesSearch && matchesName && matchesCity && matchesState;
  });

  const clearFilters = () => {
    setSelectedNames(uniqueNames);
    setSelectedCities(uniqueCities);
    setSelectedStates(uniqueStates);
    setSearch('');
  };

  const hasActiveFilters =
    selectedNames.length !== uniqueNames.length ||
    selectedCities.length !== uniqueCities.length ||
    selectedStates.length !== uniqueStates.length ||
    search !== '';

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: 'USA',
      zip_code: '',
    });
    setEditingLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip_code: formData.zip_code,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('stock_locations')
          .update(payload)
          .eq('id', editingLocation.id);
        if (error) throw error;
        await alert('Sucesso', t('messages.successUpdate'), 'success');
      } else {
        const { error } = await supabase.from('stock_locations').insert([payload]);
        if (error) throw error;
        await alert('Sucesso', t('messages.successAdd'), 'success');
      }
      setIsAddModalOpen(false);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      await alert('Erro', t('messages.errorSave') + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: StockLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'USA',
      zip_code: location.zip_code || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm(
      t('messages.deleteTitle'),
      t('messages.confirmDelete', { name }),
      'danger'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('stock_locations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchLocations();
    } catch (error: any) {
      await alert('Erro', t('messages.errorDelete') + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stock_locations')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;
      await fetchLocations();
      await alert('Sucesso', t('messages.successRestore'), 'success');
    } catch (error: any) {
      await alert('Erro', t('messages.errorRestore') + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0px', minHeight: '100vh', background: 'transparent' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
        📋 <a href="/dashboard/registration" style={{ fontWeight: '600', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}>Cadastro</a> › Locais de Estoque
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            🏢 {t('title')}
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            {t('subtitle')}
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
            {showDeleted ? 'Ver Ativos' : 'Ver Lixeira'}
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            style={{
              background: '#0EA5E9',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
            }}
          >
            {t('newButton')}
          </button>
        </div>
      </div>

      {/* Search and Clear Filters */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t('searchPlaceholder') || 'Buscar local...'}
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
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '25%' }}>
                <ColumnFilter
                  label={t('table.name')}
                  options={uniqueNames}
                  selected={selectedNames}
                  onChange={setSelectedNames}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '20%' }}>
                <ColumnFilter
                  label={t('table.city')}
                  options={uniqueCities}
                  selected={selectedCities}
                  onChange={setSelectedCities}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', position: 'relative', overflow: 'visible', width: '15%' }}>
                <ColumnFilter
                  label={t('table.state')}
                  options={uniqueStates}
                  selected={selectedStates}
                  onChange={setSelectedStates}
                />
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '25%' }}>
                {t('table.address')}
              </th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '15%' }}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>{t('loading')}</td></tr>
            ) : filteredLocations.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('noData')}</td></tr>
            ) : (
              filteredLocations.map((loc) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>
                    {loc.name}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {loc.city || '-'}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {loc.state || '-'}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b' }}>
                    {loc.address || '-'}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {!showDeleted ? (
                        <>
                          <button
                            onClick={() => handleEdit(loc)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0ea5e9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(loc.id, loc.name)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(loc.id, loc.name)}
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

      {/* Modal */}
      {isAddModalOpen && (
        <div
          style={{
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
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '24px',
              width: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
              {editingLocation ? t('modal.editTitle') : t('modal.newTitle')}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t('modal.nameLabel')}
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('modal.namePlaceholder')}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t('modal.addressLabel')}
                </label>
                <input
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('modal.addressPlaceholder')}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {t('modal.cityLabel')}
                  </label>
                  <input
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t('modal.cityPlaceholder')}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {t('modal.stateLabel')}
                  </label>
                  <input
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder={t('modal.statePlaceholder')}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {t('modal.countryLabel')}
                  </label>
                  <input
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder={t('modal.countryPlaceholder')}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {t('modal.zipLabel')}
                  </label>
                  <input
                    value={formData.zip_code}
                    onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder={t('modal.zipPlaceholder')}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t('modal.descLabel')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('modal.descPlaceholder')}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', height: '80px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#0EA5E9', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                >
                  {t('modal.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
