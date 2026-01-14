'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';

interface AddProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productType?: {
    id: string;
    name: string;
    tracking_method: string;
    icon: string | null;
  };
}

export default function AddProductTypeModal({
  isOpen,
  onClose,
  onSuccess,
  productType,
}: AddProductTypeModalProps) {
  const t = useTranslations('Dashboard.Common');
  const [loading, setLoading] = useState(false);
  const { alert, confirm } = useUI();
  const [formData, setFormData] = useState({
    name: '',
    tracking_method: 'Serial Number',
    icon: '📦',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: productType?.name || '',
        tracking_method: productType?.tracking_method || 'Serial Number',
        icon: productType?.icon || '📦',
      });
    }
  }, [isOpen, productType]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!productType?.id) return;
    const confirmed = await confirm(
      'Excluir Categoria',
      'Tem certeza que deseja excluir esta categoria? \n\nEla será movida para a Lixeira.',
      'danger'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_types')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', productType.id);

      if (error) throw error;
      onSuccess();
      onClose();
      await alert('Sucesso', 'Categoria movida para a lixeira.', 'success');
    } catch (error: any) {
      await alert('Erro', 'Erro ao excluir: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (productType) {
        const { error } = await supabase
          .from('product_types')
          .update(formData)
          .eq('id', productType.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('product_types').insert([formData]);
        if (error) throw error;
      }
      onSuccess();
      onClose();
      await alert(
        'Sucesso',
        `Categoria ${productType ? 'atualizada' : 'cadastrada'} com sucesso!`,
        'success'
      );
    } catch (error: any) {
      await alert('Erro', 'Erro: ' + error.message, 'danger');
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
    fontSize: '14px',
    marginTop: '8px',
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
          width: '440px',
          padding: '40px',
          background: 'white',
          borderRadius: '32px',
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
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          ✕
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>
          {productType ? 'Editar Tipo' : 'Novo Tipo de Produto'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#94a3b8',
              }}
            >
              Nome da Categoria
            </label>
            <input
              type="text"
              placeholder="Ex: Celular, Tablet..."
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#94a3b8',
              }}
            >
              Ícone (Emoji)
            </label>
            <input
              type="text"
              placeholder="Ex: 📱"
              value={formData.icon}
              onChange={e => setFormData({ ...formData, icon: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#94a3b8',
              }}
            >
              {t('trackingMethod')}
            </label>
            <select
              value={formData.tracking_method}
              onChange={e => setFormData({ ...formData, tracking_method: e.target.value })}
              style={inputStyle}
            >
              <option value="IMEI">IMEI</option>
              <option value="Serial Number">Serial Number</option>
              <option value="IMEI/Serial">Ambos (IMEI + Serial)</option>
              <option value="None">Nenhum</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
            {productType && (
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
                background: '#F59E0B',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
