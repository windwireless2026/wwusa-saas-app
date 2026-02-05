'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'EUA/Canadá', flag: '🇺🇸', format: '(XXX) XXX-XXXX', mask: '(###) ###-####' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷', format: '(XX) XXXXX-XXXX', mask: '(##) #####-####' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸', format: 'XXX XXX XXX', mask: '### ### ###' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', format: 'XXX XXX XXX', mask: '### ### ###' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧', format: 'XXXX XXXXXX', mask: '#### ######' },
  { code: '+33', country: 'França', flag: '🇫🇷', format: 'X XX XX XX XX', mask: '# ## ## ## ##' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪', format: 'XXX XXXXXXXX', mask: '### ########' },
  { code: '+39', country: 'Itália', flag: '🇮🇹', format: 'XXX XXX XXXX', mask: '### ### ####' },
  { code: '+52', country: 'México', flag: '🇲🇽', format: 'XX XXXX XXXX', mask: '## #### ####' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', format: 'XX XXXX-XXXX', mask: '## ####-####' },
];

const COUNTRIES = [
  'United States',
  'Brazil',
  'Canada',
  'Mexico',
  'Argentina',
  'Spain',
  'Portugal',
  'United Kingdom',
  'France',
  'Germany',
  'Italy',
];

export default function AddUserModal({ isOpen, onClose, onSuccess, user }: AddUserModalProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';
  const t = useTranslations('Dashboard.Users.modal');
  const { alert, toast } = useUI();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [accessProfiles, setAccessProfiles] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    access_profile_id: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    postal_code: '',
    job_title: '',
    phone_country_code: '+1',
    phone_number: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadAccessProfiles();
      if (user) {
        const names = user.full_name?.split(' ') || [];
        setFormData({
          first_name: user.first_name || names[0] || '',
          last_name: user.last_name || names.slice(1).join(' ') || '',
          email: user.email || '',
          access_profile_id: user.access_profile_id || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          country: user.country || 'United States',
          postal_code: user.postal_code || '',
          job_title: user.job_title || '',
          phone_country_code: user.phone_country_code || '+1',
          phone_number: user.phone_number || '',
        });
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          access_profile_id: '',
          address: '',
          city: '',
          state: '',
          country: 'United States',
          postal_code: '',
          job_title: '',
          phone_country_code: '+1',
          phone_number: '',
        });
      }
    }
  }, [isOpen, user]);

  const loadAccessProfiles = async () => {
    try {
      console.log('🔵 Carregando perfis de acesso...');
      
      // Get current user's company_id
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        console.error('❌ Erro ao buscar usuário:', authError);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar company_id:', userError);
        return;
      }

      if (!userData?.company_id) {
        console.error('❌ Usuário sem company_id');
        return;
      }

      setCompanyId(userData.company_id);
      console.log('✅ Company ID:', userData.company_id);

      const { data, error } = await supabase
        .from('access_profiles')
        .select('id, name, description, is_system_profile')
        .eq('company_id', userData.company_id)
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar perfis:', error);
        throw error;
      }
      
      console.log('✅ Perfis carregados:', data);
      setAccessProfiles(data || []);
    } catch (error) {
      console.error('❌ Error loading access profiles:', error);
    }
  };

  const formatPhoneNumber = (value: string, countryCode: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    const countryData = COUNTRY_CODES.find(c => c.code === countryCode);
    if (!countryData) return numbers;

    const mask = countryData.mask;
    let formatted = '';
    let numberIndex = 0;

    for (let i = 0; i < mask.length && numberIndex < numbers.length; i++) {
      if (mask[i] === '#') {
        formatted += numbers[numberIndex];
        numberIndex++;
      } else {
        formatted += mask[i];
      }
    }

    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, formData.phone_country_code);
    setFormData({ ...formData, phone_number: formatted });
  };

  const handleCountryCodeChange = (code: string) => {
    // Reformata o número quando trocar o país
    const numbers = formData.phone_number.replace(/\D/g, '');
    const formatted = formatPhoneNumber(numbers, code);
    setFormData({ ...formData, phone_country_code: code, phone_number: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        access_profile_id: formData.access_profile_id || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        job_title: formData.job_title,
        phone_country_code: formData.phone_country_code,
        phone_number: formData.phone_number,
        updated_at: new Date().toISOString(),
      };

      if (user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Call API to invite user (company_id necessário para o perfil do convidado)
        if (!companyId) {
          toast.error('Não foi possível obter a empresa. Recarregue a página e tente novamente.');
          return;
        }
        const response = await fetch('/api/invite-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            access_profile_id: formData.access_profile_id,
            company_id: companyId,
            locale,
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postal_code,
            job_title: formData.job_title,
            phone_country_code: formData.phone_country_code,
            phone_number: formData.phone_number,
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erro ao convidar usuário');
      }

      await onSuccess();
      onClose();
      await alert(
        'Sucesso',
        user?.id ? 'Usuário atualizado com sucesso!' : 'Convite enviado com sucesso!',
        'success'
      );
    } catch (error: unknown) {
      toast.error('Erro ao salvar usuário: ' + getErrorMessage(error));
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
          width: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
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

          <div>
            <label style={labelStyle}>Cargo</label>
            <input
              value={formData.job_title || ''}
              onChange={e => setFormData({ ...formData, job_title: e.target.value })}
              style={inputStyle}
              placeholder="Gerente de Vendas"
            />
          </div>

          <div>
            <label style={labelStyle}>Telefone *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
              <select
                value={formData.phone_country_code}
                onChange={e => handleCountryCodeChange(e.target.value)}
                style={{
                  ...inputStyle,
                  fontSize: '13px',
                  padding: '12px 8px',
                }}
              >
                {COUNTRY_CODES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                required
                type="tel"
                value={formData.phone_number}
                onChange={e => handlePhoneChange(e.target.value)}
                style={inputStyle}
                placeholder={COUNTRY_CODES.find(c => c.code === formData.phone_country_code)?.format || ''}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Endereço</label>
            <input
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              style={inputStyle}
              placeholder="Av. Paulista, 1000"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input
                value={formData.city || ''}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                style={inputStyle}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <input
                value={formData.state || ''}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                style={inputStyle}
                placeholder="SP"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>País</label>
              <select
                value={formData.country || 'United States'}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                style={inputStyle}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                {formData.country === 'Brazil' ? 'CEP' : 'Zip Code'}
              </label>
              <input
                value={formData.postal_code || ''}
                onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                style={inputStyle}
                placeholder={formData.country === 'Brazil' ? '00000-000' : '00000'}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Perfil de Acesso *</label>
            <select
              required
              value={formData.access_profile_id}
              onChange={e => setFormData({ ...formData, access_profile_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">Selecione um perfil...</option>
              {accessProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                  {profile.is_system_profile && ' (Sistema)'}
                </option>
              ))}
            </select>
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
