'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'stock_manager', label: 'Stock Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'partner', label: 'Partner' },
  { value: 'client', label: 'Client' },
];

export default function AddUserModal({ isOpen, onClose, onSuccess, user }: AddUserModalProps) {
  const t = useTranslations('Dashboard.Users.modal');
  const { alert } = useUI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'client',
    address: '',
    job_title: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        const names = user.full_name?.split(' ') || [];
        setFormData({
          first_name: user.first_name || names[0] || '',
          last_name: user.last_name || names.slice(1).join(' ') || '',
          email: user.email || '',
          role: user.role || 'client',
          address: user.address || '',
          job_title: user.job_title || '',
        });
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          role: 'client',
          address: '',
          job_title: '',
        });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        role: formData.role,
        address: formData.address,
        job_title: formData.job_title,
        updated_at: new Date().toISOString(),
      };

      if (user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Call API to invite user
        const response = await fetch('/api/invite-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role,
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address,
            job_title: formData.job_title,
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erro ao convidar usuário');
      }

      onSuccess();
      onClose();
      await alert(
        'Sucesso',
        user?.id ? 'Usuário atualizado com sucesso!' : 'Convite enviado com sucesso!',
        'success'
      );
    } catch (error: any) {
      await alert('Erro', 'Erro ao salvar usuário: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        className="glass-panel"
        style={{
          width: '500px',
          padding: '32px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <h2
          style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}
        >
          {user ? t('titleEdit') : t('titleNew')}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t('firstName')} *</label>
              <input
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                style={inputStyle}
                placeholder="João"
              />
            </div>
            <div>
              <label style={labelStyle}>{t('lastName')} *</label>
              <input
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                style={inputStyle}
                placeholder="Silva"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('email')} *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={inputStyle}
              placeholder="joao@exemplo.com"
              disabled={!!user} // Email usually shouldn't be changed if linked to Auth
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Perfil de Acesso *</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              style={inputStyle}
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>{t('address')}</label>
            <input
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              style={inputStyle}
              placeholder="Av. Paulista, 1000"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                background: '#f8fafc',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: '#3B82F6',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              {loading ? 'Salvando...' : user ? t('saveEdit') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid rgba(0,0,0,0.1)',
  background: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  color: '#1e293b',
};
