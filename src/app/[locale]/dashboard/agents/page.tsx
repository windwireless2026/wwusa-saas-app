'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import ColumnFilter from '@/components/ui/ColumnFilter';

// Simplified and Grouped Agent Types (should match AgentForm or be derived from it)
const AGENT_TYPES: Record<string, { icon: string; color: string }> = {
  cliente: { icon: '👤', color: '#10B981' },
  fornecedor_estoque: { icon: '📦', color: '#1E40AF' },
  frete: { icon: '🚚', color: '#F97316' },
  transportadora_cliente: { icon: '🚢', color: '#6366F1' },
  prestador: { icon: '👷', color: '#8B5CF6' },
  suprimentos: { icon: '🏪', color: '#84CC16' },
  utilidades: { icon: '🏠', color: '#A855F7' },
  consultoria: { icon: '💼', color: '#EAB308' },
  colaborador: { icon: '👨‍💼', color: '#F59E0B' },
  socio: { icon: '🤝', color: '#EC4899' },
  banco: { icon: '🏦', color: '#0EA5E9' },
  cartao_credito: { icon: '💳', color: '#4F46E5' },
  seguradora: { icon: '🛡️', color: '#14B8A6' },
};

export default function AgentsPage() {
  const supabase = useSupabase(); // Hook com instância única
  const t = useTranslations('Dashboard.Agents');
  const tReg = useTranslations('Dashboard.Registration');
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const { alert, confirm } = useUI();
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Filtros de coluna tipo Excel
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const fetchAgents = async () => {
    setLoading(true);
    let query = supabase.from('agents').select('*').order('name');

    if (showDeleted) {
      query = query.not('deleted_at', 'is', null);
    } else {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (data) setAgents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, [showDeleted]);

  // Extrair opções únicas para filtros
  const uniqueNames = useMemo(
    () => [...new Set(agents.map(a => a.name))].sort(),
    [agents]
  );
  const uniqueCountries = useMemo(
    () => [...new Set(agents.map(a => a.country))].sort(),
    [agents]
  );
  const uniqueTypes = useMemo(() => {
    const allTypes = agents.flatMap(a => a.roles || []);
    return [...new Set(allTypes)].sort();
  }, [agents]);

  // Inicializar filtros com todos selecionados
  useEffect(() => {
    if (agents.length > 0 && !filtersInitialized) {
      setSelectedNames(uniqueNames);
      setSelectedCountries(uniqueCountries);
      setSelectedTypes(uniqueTypes);
      setFiltersInitialized(true);
    }
  }, [agents.length, filtersInitialized, uniqueNames, uniqueCountries, uniqueTypes]);

  const clearFilters = () => {
    setSelectedNames(uniqueNames);
    setSelectedCountries(uniqueCountries);
    setSelectedTypes(uniqueTypes);
    setSearchTerm('');
  };

  const hasActiveFilters =
    selectedNames.length !== uniqueNames.length ||
    selectedCountries.length !== uniqueCountries.length ||
    selectedTypes.length !== uniqueTypes.length ||
    searchTerm !== '';

  const filteredAgents = agents.filter(agent => {
    // Filtro por busca global
    const matchesSearch =
      searchTerm === '' ||
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.tax_id?.includes(searchTerm);

    // Filtros de coluna
    const matchesName = selectedNames.includes(agent.name);
    const matchesCountry = selectedCountries.includes(agent.country);
    const matchesType = selectedTypes.length === 0 || agent.roles?.some((role: string) => selectedTypes.includes(role));

    return matchesSearch && matchesName && matchesCountry && matchesType;
  });

  const [allActiveStats, setAllActiveStats] = useState({
    total: 0,
    fornecedores: 0,
    fornecedores_estoque: 0,
    clientes: 0,
    prestadores: 0,
  });

  const handleRestore = async (id: string, name: string) => {
    const confirmed = await confirm(
      'Restaurar Agente',
      `Deseja restaurar o agente "${name}"?`,
      'info'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('agents').update({ deleted_at: null }).eq('id', id);

      if (error) throw error;
      await fetchAgents();
      await alert('Sucesso', 'Agente restaurado com sucesso!', 'success');
    } catch (error: any) {
      await alert('Erro', 'Erro ao restaurar: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch stats separately to keep them accurate while filtering or searching
    const fetchStats = async () => {
      const { data } = await supabase.from('agents').select('roles').is('deleted_at', null);
      if (data) {
        setAllActiveStats({
          total: data.length,
          fornecedores: data.filter((a: any) => a.roles?.some((r: string) => r === 'fornecedor_estoque' || r === 'suprimentos')).length,
          fornecedores_estoque: data.filter((a: any) => a.roles?.includes('fornecedor_estoque'))
            .length,
          clientes: data.filter((a: any) => a.roles?.includes('cliente')).length,
          prestadores: data.filter((a: any) => a.roles?.includes('prestador')).length,
        });
      }
    };
    fetchStats();
  }, []);

  const containerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    position: 'relative',
    overflow: 'visible', // To allow sticky header
  };

  return (
    <div style={{ padding: '0px', minHeight: '100vh', background: 'transparent' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
        📋 <a href="/dashboard/registration" style={{ fontWeight: '600', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}>Cadastro</a> › {t('title') || 'Agentes'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            🤝 {t('title')}
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Gerencie seus parceiros de negócio, fornecedores e clientes
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

          <Link
            href="/dashboard/agents/new"
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            + {t('newButton')}
          </Link>
        </div>
      </div>

      {/* Search and Clear Filters */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nome, razão social ou documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Carregando agentes...</div>
        ) : filteredAgents.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Nenhum agente encontrado</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 100 }}>
              <tr>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', position: 'relative', overflow: 'visible', width: '30%' }}>
                  <ColumnFilter
                    label={t('table.name')}
                    options={uniqueNames}
                    selected={selectedNames}
                    onChange={setSelectedNames}
                  />
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', position: 'relative', overflow: 'visible', width: '10%' }}>
                  <ColumnFilter
                    label={t('table.country')}
                    options={uniqueCountries}
                    selected={selectedCountries}
                    onChange={setSelectedCountries}
                  />
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', position: 'relative', overflow: 'visible', width: '25%' }}>
                  <ColumnFilter
                    label={t('table.types')}
                    options={uniqueTypes}
                    selected={selectedTypes}
                    onChange={setSelectedTypes}
                  />
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', width: '15%' }}>{t('table.document')}</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', width: '10%' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {agent.name}
                      <span style={{ fontSize: '10px', padding: '2px 6px', background: agent.person_type === 'individual' ? '#eff6ff' : '#f5f3ff', color: agent.person_type === 'individual' ? '#3b82f6' : '#8b5cf6', borderRadius: '6px', fontWeight: '800' }}>
                        {agent.person_type === 'individual' ? 'PF' : 'PJ'}
                      </span>
                      {/* Preserving Indicators Logic */}
                      {(() => {
                        const isBR = agent.country === 'BR';
                        const isUS = agent.country === 'US';
                        const isProvider = agent.roles.includes('prestador');
                        const isSupplier = agent.roles.some((r: string) => r.startsWith('fornecedor'));
                        const isCustomer = agent.roles.includes('cliente');
                        const indicators = [];
                        const needsRegDoc = isBR ? isProvider || isSupplier : isUS && isProvider;
                        if (needsRegDoc && agent.regulatory_doc_status !== 'waived') {
                          const url = agent.regulatory_doc_url;
                          indicators.push(
                            <span key="reg-doc">
                              {url ? <a href={url} target="_blank" rel="noreferrer" title="Ver Documento Regulatório" style={{ textDecoration: 'none', fontSize: '12px' }}>📜✅</a> : <span title="Documento Pendente" style={{ fontSize: '12px' }}>📜⚠️</span>}
                            </span>
                          );
                        }
                        if (isUS && isCustomer && agent.resale_certificate_status !== 'waived' && agent.resale_certificate_status !== 'na') {
                          const url = agent.resale_certificate_url;
                          indicators.push(
                            <span key="resale-cert">
                              {url ? <a href={url} target="_blank" rel="noreferrer" title="Ver Resale Certificate" style={{ textDecoration: 'none', fontSize: '12px' }}>📄✅</a> : <span title="Certificado Pendente" style={{ fontSize: '12px' }}>📄⚠️</span>}
                            </span>
                          );
                        }
                        return indicators.length > 0 ? <div style={{ display: 'flex', gap: '4px' }}>{indicators}</div> : null;
                      })()}
                    </div>
                    {agent.legal_name && <div style={{ fontSize: '11px', color: '#64748b' }}>{agent.legal_name}</div>}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '20px' }}>{agent.country === 'BR' ? '🇧🇷' : '🇺🇸'}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {agent.roles?.slice(0, 3).map((roleId: string) => {
                        const type = AGENT_TYPES[roleId];
                        return type ? (
                          <span key={roleId} style={{ padding: '2px 8px', borderRadius: '6px', background: `${type.color}15`, color: type.color, fontSize: '10px', fontWeight: '700' }}>
                            {type.icon} {t(`form.types_list.${roleId}`)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                    {agent.tax_id || '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!showDeleted ? (
                        <Link
                          href={`/dashboard/agents/${agent.id}`}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}
                        >
                          ✏️
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleRestore(agent.id, agent.name)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Restaurar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '16px 20px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#64748b',
  background: '#f8fafc',
  borderBottom: '2px solid rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  position: 'sticky',
  top: 0,
  zIndex: 50,
};

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  verticalAlign: 'middle',
  color: '#1e293b',
  borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
};
