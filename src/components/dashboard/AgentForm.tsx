'use client';

import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import { lookupBankByRouting } from '@/lib/bankLookup';
import { useTranslations } from 'next-intl';

interface AgentFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

// All agent types
// Simplified and Grouped Agent Types
const AGENT_TYPES = [
  // COMERCIAL (Core Business)
  { id: 'cliente', label: 'Cliente', icon: '👤', color: '#10B981', category: 'Comercial', needsBank: false },
  { id: 'fornecedor_estoque', label: 'Fornecedor (Estoque)', icon: '📦', color: '#1E40AF', category: 'Comercial', needsBank: true },
  { id: 'frete', label: 'Frete / Logística', icon: '🚚', color: '#F97316', category: 'Comercial', needsBank: true },
  { id: 'transportadora_cliente', label: 'Transportadora (Exempt)', icon: '🚢', color: '#6366F1', category: 'Comercial', needsBank: false },

  // OPERACIONAL (Opex / Despesas)
  { id: 'prestador', label: 'Prestador de Serviço', icon: '👷', color: '#8B5CF6', category: 'Operacional', needsBank: true },
  { id: 'suprimentos', label: 'Suprimentos & Compras', icon: '🏪', color: '#84CC16', category: 'Operacional', needsBank: true },
  { id: 'utilidades', label: 'Utilidades (Aluguel/Fixo)', icon: '🏠', color: '#A855F7', category: 'Operacional', needsBank: true },
  { id: 'consultoria', label: 'Consultoria / Jurídico', icon: '💼', color: '#EAB308', category: 'Operacional', needsBank: true },

  // INTERNO & GESTÃO
  { id: 'colaborador', label: 'Colaborador / Staff', icon: '👨‍💼', color: '#F59E0B', category: 'Interno', needsBank: true },
  { id: 'socio', label: 'Sócio / Diretor', icon: '🤝', color: '#EC4899', category: 'Interno', needsBank: true },

  // ESTRUTURAL & FINANCEIRO
  { id: 'banco', label: 'Banco / Financeiro', icon: '🏦', color: '#0EA5E9', category: 'Financeiro', needsBank: false },
  { id: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳', color: '#4F46E5', category: 'Financeiro', needsBank: false },
  { id: 'seguradora', label: 'Seguradora', icon: '🛡️', category: 'Financeiro', color: '#14B8A6', needsBank: true },
];

export default function AgentForm({ onSuccess, initialData }: AgentFormProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const [financialClasses, setFinancialClasses] = useState<{ id: string; name: string }[]>([]);
  const t = useTranslations('Agents');
  const tCommon = useTranslations('Dashboard.Common');
  const { alert, confirm } = useUI();

  // Style definitions
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    legal_name: initialData?.legal_name || '',
    contact_person: initialData?.contact_person || '',
    country: initialData?.country || 'US',
    tax_id: initialData?.tax_id || '',
    state_registration: initialData?.state_registration || '',
    resale_certificate: initialData?.resale_certificate || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    address_line1: initialData?.address_line1 || '',
    address_city: initialData?.address_city || '',
    address_state: initialData?.address_state || '',
    address_zip: initialData?.address_zip || '',
    bank_name: initialData?.bank_name || '',
    bank_routing_number: initialData?.bank_routing_number || '',
    bank_account_number: initialData?.bank_account_number || '',
    bank_account_type: initialData?.bank_account_type || 'checking',
    bank_holder_name: initialData?.bank_holder_name || '',
    pix_key: initialData?.pix_key || '',
    zelle_email: initialData?.zelle_email || '',
    paypal_email: initialData?.paypal_email || '',
    // Crypto
    crypto_wallet: initialData?.crypto_wallet || '',
    crypto_network: initialData?.crypto_network || '',
    // International Wire (BR)
    iban: initialData?.iban || '',
    swift_code: initialData?.swift_code || '',
    intermediary_bank: initialData?.intermediary_bank || '',
    intermediary_routing: initialData?.intermediary_routing || '',
    person_type: initialData?.person_type || 'entity',
    regulatory_doc_status: initialData?.regulatory_doc_status || 'pending',
    resale_certificate_status: initialData?.resale_certificate_status || 'pending',
    regulatory_doc_url: initialData?.regulatory_doc_url || '',
    resale_certificate_url: initialData?.resale_certificate_url || '',
    default_commission_percent: initialData?.default_commission_percent || 0,
    credit_limit: initialData?.credit_limit || 0,
    payment_terms: initialData?.payment_terms || 'COD',
    default_financial_class_id: initialData?.default_financial_class_id || '',
    resale_certificate_expiry_year: initialData?.resale_certificate_expiry_year || new Date().getFullYear(),
    // Auto-clean orphaned roles that are no longer in the system
    roles: (initialData?.roles || []).filter((r: string) => AGENT_TYPES.some(at => at.id === r)),
  });

  const [historicalDocs, setHistoricalDocs] = useState<any[]>([]);
  const [fcSearch, setFcSearch] = useState('');
  const [showFcDropdown, setShowFcDropdown] = useState(false);

  useEffect(() => {
    fetchFinancialClasses();
    if (initialData?.id) fetchAgentDocuments();
  }, [initialData?.id]);

  const fetchAgentDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_documents')
        .select('*')
        .eq('agent_id', initialData.id)
        .order('reference_year', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHistoricalDocs(data || []);
    } catch (err) {
      console.error('Error fetching docs:', err);
    }
  };

  const fetchFinancialClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_classes')
        .select('id, name')
        .is('deleted_at', null)
        .order('name');
      if (error) throw error;
      if (data) setFinancialClasses(data);
    } catch (err) {
      console.error('Error fetching financial classes:', err);
    }
  };

  useEffect(() => {
    if (formData.default_financial_class_id && financialClasses.length > 0) {
      const found = financialClasses.find(c => c.id === formData.default_financial_class_id);
      if (found) setFcSearch(found.name);
    }
  }, [formData.default_financial_class_id, financialClasses]);

  const [duplicateWarning, setDuplicateWarning] = useState<{
    id: string;
    name: string;
    type: 'exact' | 'similar';
  } | null>(null);

  const isBR = formData.country === 'BR';
  const isUS = formData.country === 'US';

  // Role helper logic
  const isCustomer = formData.roles.includes('cliente');
  const isExemptForwarder = formData.roles.includes('transportadora_cliente');
  const isProvider = formData.roles.includes('prestador');
  const isConsultant = formData.roles.includes('consultoria');
  const isSupplier = formData.roles.includes('fornecedor_estoque');
  const isFreight = formData.roles.includes('frete');
  const isUtility = formData.roles.includes('utilidades');

  // Unified "Outflow" check (roles that we pay and need bank/tax info)
  const isOutflowAgent = formData.roles.some((r: string) =>
    ['consultoria', 'prestador', 'utilidades', 'suprimentos', 'frete', 'colaborador', 'socio', 'seguradora', 'fornecedor_estoque'].includes(r)
  );

  const handleDeleteHistoricalDoc = async (id: string, fileName: string) => {
    const confirmed = await confirm(
      'Excluir Documento',
      `Tem certeza que deseja excluir o documento "${fileName}" do histórico?`,
      'danger'
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('agent_documents').delete().eq('id', id);
      if (error) throw error;
      fetchAgentDocuments();
    } catch (err: any) {
      console.error('Error deleting doc:', err);
      alert('Erro', 'Não foi possível excluir o documento.', 'danger');
    }
  };

  const regulatoryDocName = (() => {
    // REGRA 1: EUA - W-9 para qualquer prestador de serviço ou custo fixo
    // (Fornecedores de mercadorias pura estão dispensados pelo IRS em muitos casos se B2B Wholesale)
    if (isUS) {
      if (isProvider || isConsultant || isFreight || isUtility) {
        return 'W-9';
      }
    }

    // REGRA 2: OUTROS PAÍSES (BR e demais) - W-8BEN ou W-8BEN-E
    // Qualquer pagamento para o exterior requer documentação para evitar retenção de 30% pelo IRS
    if (!isUS) {
      if (isProvider || isSupplier || isConsultant || isFreight) {
        // W-8BEN para Pessoa Física, W-8BEN-E para Pessoa Jurídica
        return formData.person_type === 'individual' ? 'W-8BEN' : 'W-8BEN-E';
      }
    }

    return null;
  })();

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'regulatory_doc_url' | 'resale_certificate_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      await alert(
        'Tipo de arquivo',
        'Tipo de arquivo não permitido. Por favor, envie um PDF, JPG ou PNG.',
        'info'
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      await alert('Arquivo muito grande', 'O tamanho máximo permitido é 5MB.', 'info');
      return;
    }

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}_${randomSuffix}.${fileExt}`;

      // Robust path handling
      const targetId =
        formData.tax_id || formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unnamed';
      const filePath = `agents/${targetId}/${fieldName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('agent-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('agent-documents').getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));

      // If existing agent, log to history immediately (with duplicate check)
      if (initialData?.id) {
        const docType = fieldName === 'resale_certificate_url'
          ? (isExemptForwarder ? 'Forwarding Agent (DR-14)' : 'Resale Certificate')
          : (regulatoryDocName || 'Regulatory Doc');
        const refYear = fieldName === 'resale_certificate_url' ? formData.resale_certificate_expiry_year : new Date().getFullYear();

        // Use upsert or manual check to avoid duplicates in handleFileUpload
        const { data: existing } = await supabase
          .from('agent_documents')
          .select('id')
          .eq('agent_id', initialData.id)
          .eq('file_url', publicUrl)
          .maybeSingle();

        if (!existing) {
          await supabase.from('agent_documents').insert([{
            agent_id: initialData.id,
            document_type: docType,
            file_url: publicUrl,
            file_name: file.name,
            reference_year: refYear
          }]);
          fetchAgentDocuments();
        }
      }

      await alert('Sucesso', 'Arquivo enviado com sucesso!', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      await alert(
        'Erro no envio',
        'Erro ao enviar arquivo. Verifique o console ou as políticas do sistema.',
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const needsBankInfo = formData.roles.some((roleId: string) => {
    const type = AGENT_TYPES.find(t => t.id === roleId);
    return type?.needsBank;
  });

  const toggleRole = (role: string) => {
    setFormData(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter((r: string) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles: newRoles };
    });
  };

  const handleZipLookup = async (zip: string) => {
    const cleanZip = zip.replace(/\D/g, '');
    if (!cleanZip) return;

    try {
      if (isBR && cleanZip.length === 8) {
        setLoading(true);
        const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address_city: data.localidade,
            address_state: data.uf,
          }));
        }
      } else if (isUS && cleanZip.length === 5) {
        setLoading(true);
        const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
        if (res.ok) {
          const data = await res.json();
          const place = data.places[0];
          setFormData(prev => ({
            ...prev,
            address_city: place['place name'],
            address_state: place['state abbreviation'],
          }));
        }
      }
    } catch (err) {
      console.error('ZIP lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove símbolos e espaços
      .trim();
  };

  const checkForDuplicates = async () => {
    if (!formData.name && !formData.tax_id) return;

    try {
      // 1. Check exact Tax ID (EIN / CNPJ)
      if (formData.tax_id) {
        const { data: exactTax } = await supabase
          .from('agents')
          .select('id, name')
          .eq('tax_id', formData.tax_id)
          .is('deleted_at', null) // Only check active agents
          .neq('id', initialData?.id || '00000000-0000-0000-0000-000000000000') // Ignore self
          .maybeSingle();

        if (exactTax) {
          setDuplicateWarning({ id: exactTax.id, name: exactTax.name, type: 'exact' });
          return;
        }
      }

      // 2. Check Name Similarity (Smart Check)
      if (formData.name.length > 3) {
        const normalizedCurrent = normalizeString(formData.name);

        // Fetch agents with similar start or end (broad search)
        const { data: potentialMatches } = await supabase
          .from('agents')
          .select('id, name')
          .neq('id', initialData?.id || '00000000-0000-0000-0000-000000000000')
          .limit(100);

        if (potentialMatches) {
          const match = potentialMatches.find((a: any) => normalizeString(a.name) === normalizedCurrent);
          if (match) {
            setDuplicateWarning({ id: match.id, name: match.name, type: 'similar' });
            return;
          }
        }
      }

      setDuplicateWarning(null);
    } catch (err) {
      console.error('Error checking duplicates:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);

    const syncHistoricalDocs = async (agentId: string, forcedYear?: number) => {
      if (!formData.resale_certificate_url && !formData.regulatory_doc_url) return;

      const upsertOne = async (url: string, type: string, year: number) => {
        if (!url) return;

        // Select all to handle existing duplicates
        const { data: existingDocs } = await supabase
          .from('agent_documents')
          .select('id')
          .eq('agent_id', agentId)
          .eq('file_url', url);

        if (!existingDocs || existingDocs.length === 0) {
          await supabase.from('agent_documents').insert([{
            agent_id: agentId,
            document_type: type,
            file_url: url,
            reference_year: year
          }]);
        } else {
          // Keep the first one, ensure it has the correct type/agent_id (though they should match),
          // and UPDATE the reference_year to whatever the form currently says.
          const [first, ...rest] = existingDocs;

          await supabase.from('agent_documents')
            .update({ reference_year: year })
            .eq('id', first.id);

          if (rest.length > 0) {
            const idsToDelete = rest.map((d: any) => d.id);
            await supabase.from('agent_documents')
              .delete()
              .in('id', idsToDelete);
          }
        }
      };

      if (formData.resale_certificate_url) {
        const type = isExemptForwarder ? 'Forwarding Agent (DR-14)' : 'Resale Certificate';
        await upsertOne(formData.resale_certificate_url, type, forcedYear || formData.resale_certificate_expiry_year);
      }
      if (formData.regulatory_doc_url) {
        await upsertOne(formData.regulatory_doc_url, regulatoryDocName || 'Regulatory Doc', new Date().getFullYear());
      }

      // Refresh local list after sync
      fetchAgentDocuments();
    };

    try {
      if (formData.roles.length === 0) {
        throw new Error('Selecione pelo menos um Tipo de Agente.');
      }

      // Final roadblock for duplicates
      if (duplicateWarning?.type === 'exact') {
        throw new Error(
          `Conflito de Documento: O agente "${duplicateWarning.name}" já está cadastrado com este mesmo Tax ID/EIN/CNPJ.`
        );
      }

      // 1. Build Payload
      const payload: any = {
        name: formData.name,
        legal_name: formData.legal_name,
        contact_person: formData.contact_person,
        country: formData.country,
        roles: formData.roles,
        tax_id: formData.tax_id,
        state_registration: formData.state_registration,
        resale_certificate: formData.resale_certificate,
        resale_certificate_expiry_year: formData.resale_certificate_expiry_year,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address_line1: formData.address_line1,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_zip: formData.address_zip,
        bank_name: formData.bank_name,
        bank_routing_number: formData.bank_routing_number,
        bank_account_number: formData.bank_account_number,
        bank_account_type: formData.bank_account_type,
        bank_holder_name: formData.bank_holder_name,
        pix_key: formData.pix_key,
        zelle_email: formData.zelle_email,
        paypal_email: formData.paypal_email,
        crypto_wallet: formData.crypto_wallet,
        crypto_network: formData.crypto_network,
        iban: formData.iban,
        swift_code: formData.swift_code,
        intermediary_bank: formData.intermediary_bank,
        intermediary_routing: formData.intermediary_routing,
        person_type: formData.person_type,
        regulatory_doc_status: formData.regulatory_doc_status,
        resale_certificate_status: formData.resale_certificate_status,
        regulatory_doc_url: formData.regulatory_doc_url,
        resale_certificate_url: formData.resale_certificate_url,
        default_commission_percent: formData.default_commission_percent,
        credit_limit: formData.credit_limit,
        payment_terms: formData.payment_terms,
        default_financial_class_id: formData.default_financial_class_id || null,
      };

      // 2. Clean Payload (Remove empty/optional fields that might not exist in older DB schema)
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      console.log('Final Payload:', payload);

      // 3. Database Operation
      let dbError;
      let finalAgentId = initialData?.id;

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('agents')
          .update(payload)
          .eq('id', initialData.id);
        dbError = updateError;
      } else {
        const { data: newAgent, error: insertError } = await supabase.from('agents').insert([payload]).select().single();
        dbError = insertError;
        if (newAgent) finalAgentId = newAgent.id;
      }

      if (dbError) {
        // Se o erro for de coluna inexistente ou cache de schema, tentamos o retry
        if (dbError.code === '42703' || dbError.code === 'PGRST204') {
          console.warn('Supabase Cache Mismatch. Retrying with cleaner payload...');

          const missingYear = payload.resale_certificate_expiry_year;
          delete payload.resale_certificate_expiry_year;

          let { data: retryData, error: retryError } = initialData?.id
            ? await supabase.from('agents').update(payload).eq('id', initialData.id).select().single()
            : await supabase.from('agents').insert([payload]).select().single();

          // Se ainda falhar, pode ser por causa da Classe Financeira que também é um campo novo
          if (retryError?.code === '42703' || retryError?.code === 'PGRST204') {
            console.warn('Second Cache Conflict. Removing financial class for retry...');
            delete payload.default_financial_class_id;
            const secondRetry = initialData?.id
              ? await supabase.from('agents').update(payload).eq('id', initialData.id).select().single()
              : await supabase.from('agents').insert([payload]).select().single();
            retryData = secondRetry.data;
            retryError = secondRetry.error;
          }

          if (retryError) throw retryError;

          finalAgentId = initialData?.id || retryData?.id;
          if (finalAgentId) await syncHistoricalDocs(finalAgentId, missingYear);

          await alert(tCommon('success'), t('form.messages.syncWarning'), 'success');
          if (onSuccess) onSuccess();
          else router.push('/dashboard/agents');
          return;
        }

        throw dbError;
      }

      if (finalAgentId) {
        await syncHistoricalDocs(finalAgentId);
      }

      await alert(tCommon('success'), t('form.messages.successSave'), 'success');
      if (onSuccess) onSuccess();
      else router.push('/dashboard/agents');

    } catch (error: any) {
      console.error('Save error detailed:', error);
      await alert(
        tCommon('error'),
        t('form.messages.errorSave') + ': ' + (error.message || 'Verifique se as colunas no banco de dados estão sincronizadas.'),
        'danger'
      );
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    const confirmed = await confirm(
      t('form.messages.confirmDeleteTitle'),
      t('form.messages.confirmDelete', { name: formData.name }),
      'danger'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('agents').delete().eq('id', initialData.id);
      if (error) throw error;

      await alert(tCommon('success'), t('form.messages.successDelete'), 'success');
      if (onSuccess) onSuccess();
      else router.push('/dashboard/agents');
    } catch (error: any) {
      console.error('Delete error:', error);
      await alert(tCommon('error'), t('form.messages.errorDelete') + ': ' + error.message, 'danger');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {/* Header - Glassmorphism Sticky */}
      <div
        style={{
          padding: '28px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#94a3b8',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link
            href="/dashboard/registration"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3B82F6')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            <span>📋 CADASTRO</span>
          </Link>
          <span style={{ color: '#cbd5e1', fontWeight: '400' }}>›</span>
          <Link
            href="/dashboard/agents"
            style={{
              textDecoration: 'none',
              color: '#3B82F6',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span>AGENTE</span>
          </Link>
        </div>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '900',
          color: '#1e293b',
          margin: 0,
          letterSpacing: '-0.03em'
        }}>
          {initialData ? t('editTitle') : t('addNew')}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
        {/* 1. SELEÇÃO DE TIPOS (TOP) */}
        <div style={{ marginBottom: '32px' }}>
          <label style={labelStyle}>
            {t('form.types')} <span style={{ color: '#ef4444' }}>*</span>
            <span
              style={{
                marginLeft: '8px',
                fontSize: '10px',
                color: '#94a3b8',
                fontWeight: '400',
                textTransform: 'none',
              }}
            >
              {t('form.typesNote')}
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {['Comercial', 'Operacional', 'Interno', 'Financeiro'].map(cat => (
              <div key={cat} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '10px',
                  letterSpacing: '0.05em'
                }}>
                  {cat === 'Financeiro' ? '💰 ' : cat === 'Interno' ? '👥 ' : cat === 'Operacional' ? '⚙️ ' : '🤝 '}
                  {t(`form.categories.${cat.toLowerCase()}`)}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                  }}
                >
                  {AGENT_TYPES.filter(t => t.category === cat).map(type => {
                    const isSelected = formData.roles.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleRole(type.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${type.color}` : '1px solid #e2e8f0',
                          background: isSelected ? `${type.color}10` : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s',
                          position: 'relative',
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{type.icon}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: isSelected ? '700' : '400',
                            color: isSelected ? type.color : '#64748b',
                            textAlign: 'left'
                          }}
                        >
                          {type.label}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: type.color,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. JURISDIÇÃO E IDENTIDADE (GRID OTILIZADO) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '32px' }}>
          {/* Jurisdição */}
          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ ...labelStyle, marginBottom: '12px' }}>🌎 País / Jurisdição</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, country: 'US' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: isUS ? '2px solid #3B82F6' : '1px solid #e2e8f0',
                  background: isUS ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '20px' }}>🇺🇸</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: isUS ? '#1e40af' : '#64748b' }}>USA</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, country: 'BR' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: isBR ? '2px solid #10B981' : '1px solid #e2e8f0',
                  background: isBR ? '#ecfdf5' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '20px' }}>🇧🇷</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: isBR ? '#047857' : '#64748b' }}>Brasil</span>
              </button>
            </div>
          </div>

          {/* Identidade */}
          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ ...labelStyle, marginBottom: '12px' }}>⚖️ Identificação Jurídica</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'individual', label: 'Pessoa Física', icon: '👤' },
                { id: 'entity', label: 'Pessoa Jurídica', icon: '🏢' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, person_type: item.id }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border:
                      formData.person_type === item.id
                        ? `2px solid ${isBR ? '#10B981' : '#3B82F6'}`
                        : '1px solid #e2e8f0',
                    background:
                      formData.person_type === item.id ? (isBR ? '#ecfdf5' : '#eff6ff') : '#fff',
                    color:
                      formData.person_type === item.id ? (isBR ? '#047857' : '#1e40af') : '#64748b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. DADOS PRINCIPAIS */}
        <div
          style={{
            padding: '32px',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>
                Nome Fantasia / Apelido <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
                placeholder="Ex: Apple"
              />
            </div>
            <div>
              <label style={labelStyle}>Razão Social / Legal Name</label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={e => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                style={inputStyle}
                placeholder="Ex: Apple Computer Inc."
              />
            </div>
            <div>
              <label style={labelStyle}>
                {isBR ? (formData.person_type === 'individual' ? 'CPF' : 'CNPJ') : 'EIN / Tax ID'}
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (isBR) {
                    if (formData.person_type === 'individual') {
                      // CPF Mask
                      val = val.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    } else {
                      // CNPJ Mask
                      val = val.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                    }
                  } else {
                    // EIN Mask (XX-XXXXXXX)
                    val = val.slice(0, 9).replace(/(\d{2})(\d{7})/, '$1-$2');
                  }
                  setFormData(prev => ({ ...prev, tax_id: val }));
                }}
                onBlur={checkForDuplicates}
                style={{ ...inputStyle, fontWeight: '700', color: '#1e40af' }}
                placeholder={isBR ? (formData.person_type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00') : '00-0000000'}
                // Hide or disable if US Individual to avoid SSN
                disabled={isUS && formData.person_type === 'individual'}
              />
              {isUS && formData.person_type === 'individual' && (
                <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>N/A para Pessoa Física (US)</p>
              )}
            </div>
          </div>

          {/* Adicional para Brasil: Inscrição Estadual */}
          {isBR && formData.person_type === 'entity' && (
            <div style={{ maxWidth: '33%', marginTop: '-4px' }}>
              <label style={labelStyle}>Inscrição Estadual</label>
              <input
                type="text"
                value={formData.state_registration}
                onChange={e => setFormData(prev => ({ ...prev, state_registration: e.target.value }))}
                style={inputStyle}
                placeholder="Ex: 123.456.789.123"
              />
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div
          style={{
            padding: '24px',
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📞 {t('form.contact')} & {t('form.address')}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label style={labelStyle}>Pessoa de Contato</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={e => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                style={inputStyle}
                placeholder="Nome do contato"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={inputStyle}
                placeholder="contato@empresa.com"
              />
            </div>
            <div>
              <label style={labelStyle}>Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                style={inputStyle}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label style={labelStyle}>Site / Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                style={inputStyle}
                placeholder="https://www.apple.com"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Endereço Completo</label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '4px' }}>{isBR ? 'CEP' : 'ZIP Code'}</label>
                  <input
                    type="text"
                    placeholder={isBR ? '00000-000' : '33130'}
                    value={formData.address_zip}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, address_zip: val }));
                      if (isBR && val.replace(/\D/g, '').length === 8) handleZipLookup(val);
                      if (isUS && val.replace(/\D/g, '').length === 5) handleZipLookup(val);
                    }}
                    onBlur={e => handleZipLookup(e.target.value)}
                    style={{ ...inputStyle, border: '1px solid #7c3aed', fontWeight: 'bold' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '4px' }}>Logradouro / Street</label>
                  <input
                    type="text"
                    placeholder="Rua / Street Address"
                    value={formData.address_line1}
                    onChange={e => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '4px' }}>Cidade</label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={formData.address_city}
                    readOnly
                    style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '4px' }}>{isBR ? 'UF' : 'State'}</label>
                  <input
                    type="text"
                    placeholder={isBR ? 'UF' : 'State'}
                    value={formData.address_state}
                    readOnly
                    style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Banking & Outflow Section - Conditional */}
        {needsBankInfo && (
          <div
            style={{
              padding: '24px',
              background: '#fefce8',
              borderRadius: '16px',
              border: '1px solid #fde047',
              marginBottom: '28px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#a16207',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🏦 Dados Bancários e Fiscais para Pagamentos
              <span style={{
                marginLeft: '12px',
                fontSize: '9px',
                background: '#fef3c7',
                color: '#92400e',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #fde047',
                fontWeight: '800'
              }}>
                Natureza: Saídas / Pagamentos
              </span>
            </div>

            {/* Regulatory Doc (W-9 / W-8) - Joined here with Outflow topics */}
            {regulatoryDocName && (
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #fde047' }}>
                <label style={{ ...labelStyle, marginBottom: '12px', color: '#a16207' }}>
                  📄 Documento Regulatório: <span style={{ fontWeight: '800' }}>{regulatoryDocName}</span>
                </label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { id: 'pending', label: t('form.status.pending'), icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
                    { id: 'received', label: t('form.status.received'), icon: '✅', color: '#10B981', bg: '#f0fdf4' },
                    { id: 'waived', label: t('form.status.waived'), icon: '⏭️', color: '#64748b', bg: '#f8fafc' },
                  ].map(status => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, regulatory_doc_status: status.id }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: formData.regulatory_doc_status === status.id ? `2px solid ${status.color}` : '1px solid #fde047',
                        background: formData.regulatory_doc_status === status.id ? status.bg : '#fff',
                        color: formData.regulatory_doc_status === status.id ? status.color : '#64748b',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {status.icon} {status.label}
                    </button>
                  ))}
                </div>

                {formData.regulatory_doc_status === 'received' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>{t('form.attach')} {regulatoryDocName}</label>
                      <input type="file" onChange={e => handleFileUpload(e, 'regulatory_doc_url')} style={{ fontSize: '11px' }} />
                      {formData.regulatory_doc_url && <div style={{ fontSize: '10px', color: '#10B981', marginTop: '4px' }}>✅ {t('form.alreadyAttached')}</div>}
                    </div>
                  </div>
                )}

                {/* Historico de Documentos Regulatorios (W-9, etc.) */}
                {historicalDocs.filter(d => d.document_type !== 'Resale Certificate' && d.document_type !== 'Forwarding Agent (DR-14)').length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px dashed #fde047', paddingTop: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#a16207', marginBottom: '8px', textTransform: 'uppercase' }}>
                      📋 Histórico {regulatoryDocName}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {historicalDocs.filter(d => d.document_type !== 'Resale Certificate' && d.document_type !== 'Forwarding Agent (DR-14)').map((doc, idx) => {
                        const isCurrent = doc.file_url === formData.regulatory_doc_url;
                        return (
                          <div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                background: '#fff',
                                border: isCurrent ? '2px solid #a16207' : '1px solid #fde047',
                                borderRadius: '6px 0 0 6px',
                                color: '#a16207',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginRight: '-1px'
                              }}
                            >
                              📄 {doc.document_type} {isCurrent && <span style={{ fontSize: '9px', background: '#a16207', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>Atual</span>}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoricalDoc(doc.id, `${doc.document_type}`)}
                              style={{
                                padding: '4px 8px',
                                background: '#fef2f2',
                                borderTop: isCurrent ? '2px solid #a16207' : '1px solid #fde047',
                                borderRight: isCurrent ? '2px solid #a16207' : '1px solid #fde047',
                                borderBottom: isCurrent ? '2px solid #a16207' : '1px solid #fde047',
                                borderLeft: 'none',
                                borderRadius: '0 6px 6px 0',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Excluir do histórico"
                            >
                              🗑️
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={labelStyle}>{isBR ? 'Agência' : 'Routing #'}</label>
                <input
                  type="text"
                  value={formData.bank_routing_number}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setFormData(prev => ({ ...prev, bank_routing_number: value }));
                    if (value.length === 9) {
                      setLoading(true);
                      supabase
                        .from('banks')
                        .select('name')
                        .eq('routing_number', value)
                        .is('deleted_at', null)
                        .maybeSingle()
                        .then(({ data }: { data: any }) => {
                          if (data) {
                            setFormData(prev => ({
                              ...prev,
                              bank_routing_number: value,
                              bank_name: data.name,
                            }));
                          } else if (!isBR) {
                            const bankName = lookupBankByRouting(value);
                            if (bankName) {
                              setFormData(prev => ({
                                ...prev,
                                bank_routing_number: value,
                                bank_name: bankName,
                              }));
                            }
                          }
                        })
                        .finally(() => setLoading(false));
                    }
                  }}
                  style={inputStyle}
                  placeholder="9 dígitos"
                  maxLength={9}
                />
              </div>
              <div>
                <label style={labelStyle}>{isBR ? 'Conta' : 'Account #'}</label>
                <input
                  type="text"
                  value={formData.bank_account_number}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, bank_account_number: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Conta</label>
                <select
                  value={formData.bank_account_type}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, bank_account_type: e.target.value }))
                  }
                  style={inputStyle}
                >
                  <option value="checking">{isBR ? 'Corrente' : 'Checking'}</option>
                  <option value="savings">{isBR ? 'Poupança' : 'Savings'}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Nome do Banco</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={e => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  readOnly={isUS && formData.bank_routing_number.length === 9}
                  style={{
                    ...inputStyle,
                    background: isUS && formData.bank_routing_number.length === 9 ? '#f1f5f9' : '#fff',
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>Titular da Conta</label>
                <input
                  type="text"
                  value={formData.bank_holder_name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, bank_holder_name: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* Financial Classification (Classe Financeira) - Added for Outflow agents */}
              <div
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#fff',
                  borderRadius: '10px',
                  border: '1px solid #fde047',
                }}
              >
                <label style={labelStyle}>📊 {t('form.financialClass')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={t('form.searchPlaceholder')}
                    value={fcSearch}
                    onFocus={() => setShowFcDropdown(true)}
                    onChange={(e) => {
                      setFcSearch(e.target.value);
                      setShowFcDropdown(true);
                      if (!e.target.value) setFormData(prev => ({ ...prev, default_financial_class_id: '' }));
                    }}
                    style={{ ...inputStyle, borderColor: '#fde047' }}
                  />
                  {showFcDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      background: '#fff',
                      border: '2px solid #fef08a',
                      borderRadius: '12px',
                      marginTop: '8px',
                      maxHeight: '250px',
                      overflowY: 'auto',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    }}>
                      <div
                        onClick={() => {
                          setFormData(prev => ({ ...prev, default_financial_class_id: '' }));
                          setFcSearch('');
                          setShowFcDropdown(false);
                        }}
                        style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold' }}
                      >
                        ❌ {t('form.clearSelection')}
                      </div>
                      {financialClasses
                        .filter(fc => fc.name.toLowerCase().includes(fcSearch.toLowerCase()))
                        .map(fc => (
                          <div
                            key={fc.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, default_financial_class_id: fc.id }));
                              setFcSearch(fc.name);
                              setShowFcDropdown(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              borderBottom: '1px solid #f8fafc',
                              transition: 'all 0.2s',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: formData.default_financial_class_id === fc.id ? '#fefce8' : '#fff'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fefce8')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = formData.default_financial_class_id === fc.id ? '#fefce8' : '#fff')}
                          >
                            <span style={{ fontWeight: formData.default_financial_class_id === fc.id ? '700' : '400', color: '#1e293b' }}>
                              {fc.name}
                            </span>
                            {formData.default_financial_class_id === fc.id && <span style={{ fontSize: '12px' }}>✅</span>}
                          </div>
                        ))}
                      {financialClasses.filter(fc => fc.name.toLowerCase().includes(fcSearch.toLowerCase())).length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                          {t('form.noResults')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: '#854d0e', marginTop: '6px' }}>
                  * Ao criar uma Conta a Pagar (AP), esta categoria será sugerida automaticamente.
                </p>
              </div>
            </div>

            {/* Alternative payment methods */}
            <div style={{ padding: '20px', background: 'rgba(254, 240, 138, 0.4)', borderRadius: '12px', border: '1px solid #fde047' }}>
              <div style={{ fontSize: '11px', color: '#854d0e', marginBottom: '16px', fontWeight: '800', textTransform: 'uppercase' }}>
                Métodos Alternativos
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {isBR && (
                  <div>
                    <label style={labelStyle}>Chave PIX</label>
                    <input
                      type="text"
                      value={formData.pix_key}
                      onChange={e => setFormData(prev => ({ ...prev, pix_key: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                )}
                {isUS && (
                  <div>
                    <label style={labelStyle}>Zelle Email/Phone</label>
                    <input
                      type="text"
                      value={formData.zelle_email}
                      onChange={e => setFormData(prev => ({ ...prev, zelle_email: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>PayPal Email</label>
                  <input
                    type="email"
                    value={formData.paypal_email}
                    onChange={e => setFormData(prev => ({ ...prev, paypal_email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {isBR && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #fde047' }}>
                  <div style={{ fontSize: '11px', color: '#854d0e', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                    🌐 Wire Internacional (SWIFT/IBAN)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>IBAN</label>
                      <input type="text" value={formData.iban} onChange={e => setFormData(prev => ({ ...prev, iban: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>SWIFT</label>
                      <input type="text" value={formData.swift_code} onChange={e => setFormData(prev => ({ ...prev, swift_code: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commercial Settings (Clients & Forwarders) */}
        {(isCustomer || isExemptForwarder) && (
          <div
            style={{
              padding: '24px',
              background: '#f0fdf4',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '16px',
                fontWeight: '700',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              💼 {t('form.commercialSettings')}
              <span style={{
                marginLeft: '12px',
                fontSize: '9px',
                background: isCustomer ? '#dcfce7' : '#e0f2fe',
                color: isCustomer ? '#15803d' : '#0369a1',
                padding: '4px 10px',
                borderRadius: '6px',
                border: isCustomer ? '1px solid #86efac' : '1px solid #7dd3fc',
                fontWeight: '800'
              }}>
                {t('form.profile')}: {isCustomer ? t('form.types_list.cliente') : t('form.types_list.transportadora_cliente')}
              </span>
            </div>

            {/* Resale Certificate Section - Only for Customers */}
            {isUS && isCustomer && (
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #bbf7d0' }}>
                <label style={{ ...labelStyle, color: '#059669', marginBottom: '12px' }}>
                  🏷️ Status do Resale Certificate (RC): <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { id: 'pending', label: t('form.status.pending'), icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
                    { id: 'received', label: t('form.status.received'), icon: '✅', color: '#10B981', bg: '#f0fdf4' },
                    { id: 'waived', label: t('form.status.waived'), icon: '⏭️', color: '#64748b', bg: '#f8fafc' },
                  ].map(status => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          resale_certificate_status: status.id,
                          resale_certificate: status.id !== 'received' ? '' : prev.resale_certificate,
                        }))
                      }
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: formData.resale_certificate_status === status.id ? `2px solid ${status.color}` : '1px solid #dbeafe',
                        background: formData.resale_certificate_status === status.id ? status.bg : '#fff',
                        color: formData.resale_certificate_status === status.id ? status.color : '#64748b',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {status.icon} {status.label}
                    </button>
                  ))}
                </div>

                {formData.resale_certificate_status === 'received' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Número do RC</label>
                      <input
                        type="text"
                        value={formData.resale_certificate}
                        onChange={e => setFormData(prev => ({ ...prev, resale_certificate: e.target.value }))}
                        style={{ ...inputStyle, borderColor: '#86efac' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Ano/Exercício</label>
                      <input
                        type="number"
                        value={formData.resale_certificate_expiry_year}
                        onChange={e => setFormData(prev => ({ ...prev, resale_certificate_expiry_year: parseInt(e.target.value) }))}
                        style={{ ...inputStyle, borderColor: '#86efac' }}
                        placeholder="Ex: 2026"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('form.attach')} {isExemptForwarder ? 'DR-14' : 'RC'}</label>
                      <input type="file" onChange={e => handleFileUpload(e, 'resale_certificate_url')} style={{ fontSize: '11px' }} />
                      {formData.resale_certificate_url && <div style={{ fontSize: '10px', color: '#10B981', marginTop: '4px' }}>✅ {t('form.alreadyAttached')}</div>}
                    </div>
                  </div>
                )}

                {/* Historico de Documentos (RC) */}
                {historicalDocs.filter(d => d.document_type === 'Resale Certificate').length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px dashed #bbf7d0', paddingTop: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#059669', marginBottom: '8px', textTransform: 'uppercase' }}>
                      📋 Histórico de Certificados (RC)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {historicalDocs.filter(d => d.document_type === 'Resale Certificate').map((doc, idx) => {
                        const isCurrent = doc.file_url === formData.resale_certificate_url;
                        return (
                          <div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                background: '#fff',
                                border: isCurrent ? '2px solid #10b981' : '1px solid #86efac',
                                borderRadius: '6px 0 0 6px',
                                color: '#059669',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginRight: '-1px'

                              }}
                            >
                              📅 {doc.reference_year} {isCurrent && <span style={{ fontSize: '9px', background: '#10b981', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>Atual</span>}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoricalDoc(doc.id, `RC ${doc.reference_year}`)}
                              style={{
                                padding: '4px 8px',
                                background: '#fef2f2',
                                borderTop: isCurrent ? '2px solid #10b981' : '1px solid #86efac',
                                borderRight: isCurrent ? '2px solid #10b981' : '1px solid #86efac',
                                borderBottom: isCurrent ? '2px solid #10b981' : '1px solid #86efac',
                                borderLeft: 'none',
                                borderRadius: '0 6px 6px 0',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Excluir do histórico"
                            >
                              🗑️
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Comissão Padrão (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.default_commission_percent}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      default_commission_percent: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  min="0"
                  style={inputStyle}
                  placeholder="0.00"
                />
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  Percentual de comissão sobre o lucro para este cliente.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Limite de Crédito ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      credit_limit: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  min="0"
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Condição de Pagamento</label>
                <select
                  value={formData.payment_terms}
                  onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="COD">À Vista (COD)</option>
                  <option value="NET7">NET 7</option>
                  <option value="NET15">NET 15</option>
                  <option value="NET30">NET 30</option>
                  <option value="NET60">NET 60</option>
                  <option value="DUE_AT_DESTINATION">Pagamento no Destino</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DR-14 Section (Only for Forwarding Agents) */}
        {isExemptForwarder && (
          <div
            style={{
              padding: '24px',
              background: '#e0f2fe',
              borderRadius: '16px',
              border: '1px solid #7dd3fc',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '16px',
                fontWeight: '700',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              💼 Configurações Comerciais
              <span style={{
                marginLeft: '12px',
                fontSize: '9px',
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                fontWeight: '800'
              }}>
                Perfil: Transportadora
              </span>
            </div>

            {/* DR-14 Section - Only for Exempt Forwarders */}
            {isUS && isExemptForwarder && (
              <div style={{ marginBottom: '24px', paddingBottom: '24px' }}>
                <label style={{ ...labelStyle, color: '#0369a1', marginBottom: '12px' }}>
                  🏷️ Status do Forwarding Agent (DR-14): <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { id: 'pending', label: t('form.status.pending'), icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
                    { id: 'received', label: t('form.status.received'), icon: '✅', color: '#10B981', bg: '#f0fdf4' },
                    { id: 'waived', label: t('form.status.waived'), icon: '⏭️', color: '#64748b', bg: '#f8fafc' },
                  ].map(status => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          resale_certificate_status: status.id,
                          resale_certificate: status.id !== 'received' ? '' : prev.resale_certificate,
                        }))
                      }
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: formData.resale_certificate_status === status.id ? `2px solid ${status.color}` : '1px solid #dbeafe',
                        background: formData.resale_certificate_status === status.id ? status.bg : '#fff',
                        color: formData.resale_certificate_status === status.id ? status.color : '#64748b',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {status.icon} {status.label}
                    </button>
                  ))}
                </div>

                {formData.resale_certificate_status === 'received' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Número do DR-14</label>
                      <input
                        type="text"
                        value={formData.resale_certificate}
                        onChange={e => setFormData(prev => ({ ...prev, resale_certificate: e.target.value }))}
                        style={{ ...inputStyle, borderColor: '#7dd3fc' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Ano/Exercício</label>
                      <input
                        type="number"
                        value={formData.resale_certificate_expiry_year}
                        onChange={e => setFormData(prev => ({ ...prev, resale_certificate_expiry_year: parseInt(e.target.value) }))}
                        style={{ ...inputStyle, borderColor: '#7dd3fc' }}
                        placeholder="Ex: 2026"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Anexar DR-14</label>
                      <input type="file" onChange={e => handleFileUpload(e, 'resale_certificate_url')} style={{ fontSize: '11px' }} />
                      {formData.resale_certificate_url && <div style={{ fontSize: '10px', color: '#10B981', marginTop: '4px' }}>✅ Já anexado</div>}
                    </div>
                  </div>
                )}

                {/* Historico de Documentos (DR-14) */}
                {historicalDocs.filter(d => d.document_type === 'Forwarding Agent (DR-14)').length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px dashed #7dd3fc', paddingTop: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#0369a1', marginBottom: '8px', textTransform: 'uppercase' }}>
                      📋 Histórico de Certificados (DR-14)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {historicalDocs.filter(d => d.document_type === 'Forwarding Agent (DR-14)').map((doc, idx) => {
                        const isCurrent = doc.file_url === formData.resale_certificate_url;
                        return (
                          <div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                background: '#fff',
                                border: isCurrent ? '2px solid #0ea5e9' : '1px solid #7dd3fc',
                                borderRadius: '6px 0 0 6px',
                                color: '#0369a1',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginRight: '-1px'

                              }}
                            >
                              📅 {doc.reference_year} {isCurrent && <span style={{ fontSize: '9px', background: '#0ea5e9', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>Atual</span>}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoricalDoc(doc.id, `DR-14 ${doc.reference_year}`)}
                              style={{
                                padding: '4px 8px',
                                background: '#fef2f2',
                                borderTop: isCurrent ? '2px solid #0ea5e9' : '1px solid #7dd3fc',
                                borderRight: isCurrent ? '2px solid #0ea5e9' : '1px solid #7dd3fc',
                                borderBottom: isCurrent ? '2px solid #0ea5e9' : '1px solid #7dd3fc',
                                borderLeft: 'none',
                                borderRadius: '0 6px 6px 0',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Excluir do histórico"
                            >
                              🗑️
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}
            >
              {loading ? 'Salvando...' : '✓ Salvar Agente'}
            </button>
          </div>

          {initialData?.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                background: '#fff',
                color: '#ef4444',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#fff';
              }}
            >
              🗑️ Excluir Agente
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
