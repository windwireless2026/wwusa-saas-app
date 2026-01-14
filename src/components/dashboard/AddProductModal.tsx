'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any; // For editing
}

interface Manufacturer {
  id: string;
  name: string;
}

interface ProductType {
  id: string;
  name: string;
  icon: string | null;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: AddProductModalProps) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || 'Cell phone',
    manufacturer: product?.manufacturer || 'Apple',
    release_year: product?.release_year || new Date().getFullYear(),
  });

  // Sync form with product prop when it changes or modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      setFormData({
        name: product?.name || '',
        type: product?.type || '',
        manufacturer: product?.manufacturer || '',
        release_year: product?.release_year || new Date().getFullYear(),
      });
    }
  }, [isOpen, product]);

  const { alert, confirm } = useUI();

  const fetchInitialData = async () => {
    // Fetch Manufacturers
    const { data: mans } = await supabase
      .from('manufacturers')
      .select('id, name')
      .is('deleted_at', null)
      .order('name');
    if (mans) setManufacturers(mans);

    // Fetch Product Types
    const { data: types } = await supabase
      .from('product_types')
      .select('id, name, icon')
      .is('deleted_at', null)
      .order('name');
    if (types) setProductTypes(types);
  };

  const handleDelete = async () => {
    if (!product?.id) return;

    const confirmed = await confirm(
      'Excluir Modelo',
      'Tem certeza que deseja excluir este modelo? \n\nEle será movido para a Lixeira.',
      'danger'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_catalog')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;
      onSuccess();
      onClose();
      await alert('Sucesso', 'Modelo movido para a lixeira.', 'success');
    } catch (error: any) {
      await alert('Erro', 'Erro ao excluir: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Duplicate Check (only when creating new OR changing name of existing)
      if (!product || (product && product.name !== formData.name)) {
        const { data: existing } = await supabase
          .from('product_catalog')
          .select('id')
          .eq('name', formData.name)
          .maybeSingle();

        if (existing) {
          await alert('Atenção', 'Este modelo já existe no catálogo.', 'info');
          setLoading(false);
          return;
        }
      }

      if (product) {
        // Update
        const { error } = await supabase
          .from('product_catalog')
          .update(formData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('product_catalog').insert([formData]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
      await alert(
        'Sucesso',
        `Modelo ${product ? 'atualizado' : 'adicionado'} com sucesso!`,
        'success'
      );
      setFormData({
        name: '',
        type: 'Cell phone',
        manufacturer: 'Apple',
        release_year: new Date().getFullYear(),
      });
    } catch (error: any) {
      await alert('Erro', 'Erro ao salvar produto: ' + error.message, 'danger');
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
    transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#94a3b8',
    display: 'block',
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
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
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

        <h2
          style={{
            fontSize: '28px',
            fontWeight: '900',
            marginBottom: '8px',
            color: '#1e293b',
            letterSpacing: '-0.02em',
          }}
        >
          {product ? 'Editar Modelo' : 'Novo Modelo'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', fontWeight: '500' }}>
          {product
            ? 'Atualize as informações do dispositivo no catálogo.'
            : 'Adicione um novo dispositivo ao catálogo.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={labelStyle}>Nome do Modelo</label>
            <input
              type="text"
              placeholder="Ex: iPhone 17 Pro Max"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Produto</label>
              <select
                required
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                {productTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ano lançamento</label>
              <input
                type="number"
                required
                min="1990"
                max="2030"
                value={formData.release_year}
                onChange={e => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Fabricante</label>
            <select
              required
              value={formData.manufacturer}
              onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              style={inputStyle}
            >
              <option value="">Selecione...</option>
              {manufacturers.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
            {product && (
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
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'white',
                color: '#64748b',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
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
                background: '#3B82F6',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Sincronizando...' : product ? 'Salvar Edição' : 'Adicionar ao Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
