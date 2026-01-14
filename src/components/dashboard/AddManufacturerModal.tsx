'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUI } from '@/context/UIContext';

interface AddManufacturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  manufacturer?: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
  };
}

export default function AddManufacturerModal({
  isOpen,
  onClose,
  onSuccess,
  manufacturer,
}: AddManufacturerModalProps) {
  const [loading, setLoading] = useState(false);
  const { alert, confirm } = useUI();
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProductTypes();
      setFormData({
        name: manufacturer?.name || '',
        logo_url: manufacturer?.logo_url || '',
        website: manufacturer?.website || '',
      });
      if (manufacturer) {
        fetchManufacturerProductTypes(manufacturer.id);
      } else {
        setSelectedTypes([]);
      }
    }
  }, [isOpen, manufacturer]);

  const fetchProductTypes = async () => {
    const { data } = await supabase.from('product_types').select('*').order('name');
    if (data) setProductTypes(data);
  };

  const fetchManufacturerProductTypes = async (id: string) => {
    const { data } = await supabase
      .from('manufacturer_product_types')
      .select('product_type_id')
      .eq('manufacturer_id', id);
    if (data) setSelectedTypes(data.map((item: any) => item.product_type_id));
  };

  const toggleType = (id: string) => {
    setSelectedTypes(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]));
  };

  if (!isOpen) return null;

  const formatUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/images/')) return url; // Keep local icons as is
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  const handleWebsiteChange = (val: string) => {
    const formattedWebsite = val.trim().toLowerCase();
    let newLogoUrl = formData.logo_url;

    // Auto-generate Logo URL or use local icons
    if (
      !formData.logo_url ||
      formData.logo_url.includes('logo.clearbit.com') ||
      formData.logo_url.startsWith('/images/')
    ) {
      if (formData.name.toLowerCase() === 'apple' || formattedWebsite.includes('apple.com')) {
        newLogoUrl = '/images/icon/apple.png';
      } else if (
        formData.name.toLowerCase() === 'samsung' ||
        formattedWebsite.includes('samsung.com')
      ) {
        newLogoUrl = '/images/icon/samsung.png';
      } else {
        const domain = formattedWebsite
          .replace('https://', '')
          .replace('http://', '')
          .replace('www.', '')
          .split('/')[0];

        if (domain && domain.includes('.')) {
          newLogoUrl = `https://logo.clearbit.com/${domain}`;
        }
      }
    }
    setFormData({ ...formData, website: val, logo_url: newLogoUrl });
  };

  const handleDelete = async () => {
    if (!manufacturer?.id) return;
    const confirmed = await confirm(
      'Excluir Fabricante',
      'Tem certeza que deseja excluir este fabricante? \n\nEle será movido para a Lixeira.',
      'danger'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('manufacturers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', manufacturer.id);

      if (error) throw error;
      onSuccess();
      onClose();
      await alert('Sucesso', 'Fabricante movido para a lixeira.', 'success');
    } catch (error: any) {
      await alert('Erro', 'Erro ao excluir: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = {
      ...formData,
      website: formatUrl(formData.website),
      logo_url: formatUrl(formData.logo_url),
    };

    try {
      let manufacturerId = manufacturer?.id;

      if (manufacturer) {
        const { error } = await supabase
          .from('manufacturers')
          .update(dataToSave)
          .eq('id', manufacturer.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('manufacturers').insert([dataToSave]).select();
        if (error) throw error;
        manufacturerId = data[0].id;
      }

      // Sync Relationships
      if (manufacturerId) {
        // Remove all current
        await supabase
          .from('manufacturer_product_types')
          .delete()
          .eq('manufacturer_id', manufacturerId);

        // Insert selected
        if (selectedTypes.length > 0) {
          const toInsert = selectedTypes.map(typeId => ({
            manufacturer_id: manufacturerId,
            product_type_id: typeId,
          }));
          const { error: relError } = await supabase
            .from('manufacturer_product_types')
            .insert(toInsert);
          if (relError) throw relError;
        }
      }

      onSuccess();
      onClose();
      await alert(
        'Sucesso',
        `Fabricante ${manufacturer ? 'atualizado' : 'cadastrado'} com sucesso!`,
        'success'
      );
    } catch (error: any) {
      await alert('Erro', 'Erro ao salvar: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: '14px',
    outline: 'none',
    marginTop: '8px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#94a3b8',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '480px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(32px) saturate(180%)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.15)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '32px',
            top: '32px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>
          {manufacturer ? 'Editar Fabricante' : 'Novo Fabricante'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px', marginTop: '32px' }}>
          <div>
            <label style={labelStyle}>Nome da Marca</label>
            <input
              type="text"
              placeholder="Ex: Apple, Samsung..."
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Website Oficial</label>
            <input
              type="text"
              placeholder="Ex: www.apple.com"
              value={formData.website}
              onChange={e => handleWebsiteChange(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>O que compramos desta marca?</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              {productTypes.map(type => (
                <div
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: selectedTypes.includes(type.id)
                      ? 'rgba(139, 92, 246, 0.1)'
                      : '#f8fafc',
                    border: `1px solid ${selectedTypes.includes(type.id) ? '#8B5CF6' : 'rgba(0,0,0,0.05)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    fontSize: '13px',
                  }}
                >
                  <span>{type.icon}</span>
                  <span style={{ fontWeight: selectedTypes.includes(type.id) ? '700' : '500' }}>
                    {type.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
            {manufacturer && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  flex: '1 1 100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}
              >
                🗑️ Mover para Lixeira
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: 'white',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                background: '#8B5CF6',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Sincronizando...' : 'Salvar Fabricante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
