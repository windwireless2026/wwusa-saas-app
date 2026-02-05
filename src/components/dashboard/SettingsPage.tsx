'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

interface CompanySettings {
  id: string;
  legal_name: string;
  trade_name: string | null;
  ein: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  corporate_structure: string | null;
  state_of_incorporation: string | null;
  incorporation_date: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_routing_number: string | null;
  logo_url: string | null;
  primary_color: string;
  invoice_prefix: string;
  invoice_footer_text: string | null;
  contract_terms: string | null;
  estimate_notes_template: string | null;
  estimate_terms_template: string | null;
  estimate_payment_methods_template: string | null;
  sales_order_notes_template: string | null;
  sales_order_terms_template: string | null;
  sales_order_payment_methods_template: string | null;
}

export default function SettingsPage() {
  const t = useTranslations('Dashboard.Settings');
  const supabase = useSupabase();
  const { alert, toast } = useUI();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('Fetched settings:', data);
      console.log('Fetch error:', error);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch settings:', error);
      toast.error('Erro ao carregar configurações: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const updates = {
        legal_name: formData.get('legal_name') as string,
        trade_name: (formData.get('trade_name') as string) || null,
        ein: (formData.get('ein') as string) || null,
        website: (formData.get('website') as string) || null,
        email: (formData.get('email') as string) || null,
        phone: (formData.get('phone') as string) || null,
        address_line1: (formData.get('address_line1') as string) || null,
        address_line2: (formData.get('address_line2') as string) || null,
        city: (formData.get('city') as string) || null,
        state: (formData.get('state') as string) || null,
        zip_code: (formData.get('zip_code') as string) || null,
        country: (formData.get('country') as string) || 'US',
        corporate_structure: (formData.get('corporate_structure') as string) || null,
        state_of_incorporation: (formData.get('state_of_incorporation') as string) || null,
        incorporation_date: (formData.get('incorporation_date') as string) || null,
        estimate_notes_template: (formData.get('estimate_notes_template') as string) || null,
        estimate_terms_template: (formData.get('estimate_terms_template') as string) || null,
        estimate_payment_methods_template: (formData.get('estimate_payment_methods_template') as string) || null,
        sales_order_notes_template: (formData.get('sales_order_notes_template') as string) || null,
        sales_order_terms_template: (formData.get('sales_order_terms_template') as string) || null,
        sales_order_payment_methods_template: (formData.get('sales_order_payment_methods_template') as string) || null,
      };

      // Use RPC function to bypass RLS for initial insert
      const { error } = await supabase.rpc('upsert_company_settings', {
        settings_data: updates,
      });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
      await fetchSettings();
    } catch (error: unknown) {
      toast.error('Erro ao salvar configurações: ' + getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        Carregando configurações...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader
        title="Configurações da Empresa"
        description="Informações legais e comerciais para documentos"
        icon="⚙️"
        breadcrumbs={[
          { label: 'CONFIGURAÇÕES', href: '/settings', color: '#64748b' },
          { label: 'EMPRESA', color: '#64748b' },
        ]}
        moduleColor="#64748b"
      />

      <form key={settings?.id || 'new'} onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Legal Information */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
              📋 Informações Legais
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Razão Social *</label>
                <input
                  type="text"
                  name="legal_name"
                  defaultValue={settings?.legal_name || ''}
                  required
                  style={inputStyle}
                  placeholder="Your Company LLC"
                />
              </div>
              <div>
                <label style={labelStyle}>Nome Fantasia (DBA)</label>
                <input
                  type="text"
                  name="trade_name"
                  defaultValue={settings?.trade_name || ''}
                  style={inputStyle}
                  placeholder="WindSystem"
                />
              </div>
              <div>
                <label style={labelStyle}>EIN / Tax ID</label>
                <input
                  type="text"
                  name="ein"
                  defaultValue={settings?.ein || ''}
                  style={inputStyle}
                  placeholder="12-3456789"
                />
              </div>
              <div>
                <label style={labelStyle}>Estrutura Corporativa</label>
                <select
                  name="corporate_structure"
                  defaultValue={settings?.corporate_structure || ''}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="S-Corp">S-Corporation</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estado de Incorporação</label>
                <input
                  type="text"
                  name="state_of_incorporation"
                  defaultValue={settings?.state_of_incorporation || ''}
                  style={inputStyle}
                  placeholder="Delaware"
                />
              </div>
              <div>
                <label style={labelStyle}>Data de Incorporação</label>
                <input
                  type="date"
                  name="incorporation_date"
                  defaultValue={settings?.incorporation_date || ''}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
              📞 Contato
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={settings?.email || ''}
                  style={inputStyle}
                  placeholder="contact@yourcompany.com"
                />
              </div>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={settings?.phone || ''}
                  style={inputStyle}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Website</label>
                <input
                  type="text"
                  name="website"
                  defaultValue={settings?.website || ''}
                  style={inputStyle}
                  placeholder="www.yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
              🏢 Endereço
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Endereço (Linha 1)</label>
                <input
                  type="text"
                  name="address_line1"
                  defaultValue={settings?.address_line1 || ''}
                  style={inputStyle}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label style={labelStyle}>Endereço (Linha 2)</label>
                <input
                  type="text"
                  name="address_line2"
                  defaultValue={settings?.address_line2 || ''}
                  style={inputStyle}
                  placeholder="Suite 100"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Cidade</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={settings?.city || ''}
                    style={inputStyle}
                    placeholder="Miami"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={settings?.state || ''}
                    style={inputStyle}
                    placeholder="FL"
                  />
                </div>
                <div>
                  <label style={labelStyle}>ZIP Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    defaultValue={settings?.zip_code || ''}
                    style={inputStyle}
                    placeholder="33101"
                  />
                </div>
              </div>
              <div style={{ width: '200px' }}>
                <label style={labelStyle}>País</label>
                <select name="country" defaultValue={settings?.country || 'US'} style={inputStyle}>
                  <option value="US">🇺🇸 United States</option>
                  <option value="BR">🇧🇷 Brasil</option>
                </select>
              </div>
            </div>
          </div>

          {/* Commercial Document Templates */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
              📄 Modelos de Documentos Comerciais
            </h3>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#7c3aed', marginBottom: '16px', textTransform: 'uppercase' }}>
                Estoque & Estimates
              </h4>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Notas Padrão (Estimates)</label>
                  <textarea
                    name="estimate_notes_template"
                    defaultValue={settings?.estimate_notes_template || ''}
                    style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
                    placeholder="Ex: AUCTION - NO TEST - NO WARRANTY"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Termos e Condições (Estimates)</label>
                  <textarea
                    name="estimate_terms_template"
                    defaultValue={settings?.estimate_terms_template || ''}
                    style={{ ...inputStyle, minHeight: '150px', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Métodos de Pagamento (Estimates)</label>
                  <textarea
                    name="estimate_payment_methods_template"
                    defaultValue={settings?.estimate_payment_methods_template || ''}
                    style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0ea5e9', marginBottom: '16px', textTransform: 'uppercase' }}>
                Sales Orders
              </h4>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Termos e Condições (Sales Orders)</label>
                  <textarea
                    name="sales_order_terms_template"
                    defaultValue={settings?.sales_order_terms_template || ''}
                    style={{ ...inputStyle, minHeight: '150px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Configurações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
