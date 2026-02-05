'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import ColumnFilter from '@/components/ui/ColumnFilter';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

type Estimate = {
    id: string;
    estimate_number: number;
    customer_id: string;
    customer?: { name: string };
    estimate_date: string;
    ship_date: string | null;
    total: number;
    status: string;
    created_at: string;
};

export default function EstimatesPage() {
    const t = useTranslations('Dashboard.Common');
    const params = useParams();
    const locale = (params?.locale as string) || 'pt';
    const supabase = useSupabase();
    const { alert, confirm, toast } = useUI();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters State
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [selectedStatusLabels, setSelectedStatusLabels] = useState<string[]>([]);
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [selectedShipDates, setSelectedShipDates] = useState<string[]>([]);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    useEffect(() => {
        fetchEstimates();
    }, []);

    const fetchEstimates = async () => {
        setLoading(true);
        // Tenta primeiro com nome do cliente (join em agents). Se falhar (ex: RLS em agents), busca só estimates.
        const { data: dataWithCustomer, error: errorWithCustomer } = await supabase
            .from('estimates')
            .select('*, customer:agents!customer_id(name)')
            .is('deleted_at', null)
            .order('estimate_number', { ascending: false });

        if (!errorWithCustomer && dataWithCustomer?.length !== undefined) {
            setEstimates(dataWithCustomer);
            setLoading(false);
            return;
        }

        console.error('Error fetching estimates with customer:', errorWithCustomer?.message || errorWithCustomer);
        const { data: dataOnly, error: errorOnly } = await supabase
            .from('estimates')
            .select('*')
            .is('deleted_at', null)
            .order('estimate_number', { ascending: false });

        if (errorOnly) {
            console.error('Error fetching estimates:', errorOnly?.message || errorOnly);
            toast.error('Erro ao carregar estimates: ' + (errorOnly?.message || String(errorOnly)));
        }
        setEstimates(dataOnly || []);
        setLoading(false);
    };

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        draft: { bg: '#f1f5f9', text: '#64748b', label: 'Rascunho' },
        sent: { bg: '#dbeafe', text: '#2563eb', label: 'Enviado' },
        approved: { bg: '#dcfce7', text: '#16a34a', label: 'Aprovado' },
        rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejeitado' },
        expired: { bg: '#fef3c7', text: '#d97706', label: 'Expirado' },
        converted: { bg: '#dcfce7', text: '#16a34a', label: 'Convertido' },
    };

    // Derived Options
    const uniqueCustomers = useMemo(() => {
        const names = estimates.map(e => e.customer?.name || '—');
        return [...new Set(names)].sort();
    }, [estimates]);

    const uniqueStatusLabels = useMemo(() => {
        const labels = estimates.map(e => statusColors[e.status]?.label || e.status);
        return [...new Set(labels)].sort();
    }, [estimates]);

    const uniqueNumbers = useMemo(() => {
        return [...new Set(estimates.map(e => e.estimate_number.toString()))].sort((a, b) => Number(b) - Number(a));
    }, [estimates]);

    const uniqueDates = useMemo(() => {
        const dates = estimates.map(e => new Date(e.estimate_date).toLocaleDateString('pt-BR'));
        return [...new Set(dates)].sort();
    }, [estimates]);

    const uniqueShipDates = useMemo(() => {
        const dates = estimates.map(e => e.ship_date ? new Date(e.ship_date).toLocaleDateString('pt-BR') : '—');
        return [...new Set(dates)].sort();
    }, [estimates]);

    const uniqueValues = useMemo(() => {
        const values = estimates.map(e => `$${(e.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        return [...new Set(values)].sort();
    }, [estimates]);

    // Initialize Filters
    useEffect(() => {
        if (estimates.length > 0 && !filtersInitialized) {
            setSelectedCustomers(uniqueCustomers);
            setSelectedStatusLabels(uniqueStatusLabels);
            setSelectedNumbers(uniqueNumbers);
            setSelectedDates(uniqueDates);
            setSelectedShipDates(uniqueShipDates);
            setSelectedValues(uniqueValues);
            setFiltersInitialized(true);
        }
    }, [estimates, filtersInitialized, uniqueCustomers, uniqueStatusLabels, uniqueNumbers, uniqueDates, uniqueShipDates, uniqueValues]);

    const handleApprove = async (id: string) => {
        const confirmed = await confirm(
            'Confirmar Aprovação',
            'Deseja aprovar este estimate e gerar uma Order? Isso mudará o status e criará o registro financeiro.'
        );

        if (!confirmed) return;

        try {
            // Chamada atômica via RPC (Database Function)
            const { data: newOrderId, error } = await supabase.rpc('convert_estimate_to_order', {
                target_estimate_id: id
            });

            if (error) throw error;

            toast.success('Estimate aprovado e gerado Order!');
            fetchEstimates();

        } catch (error: unknown) {
            console.error(error);
            toast.error('Falha ao aprovar estimate: ' + getErrorMessage(error));
        }
    };

    const filteredEstimates = useMemo(() => {
        return estimates.filter(est => {
            const matchesSearch = searchTerm === '' ||
                est.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                est.estimate_number.toString().includes(searchTerm);

            // Column Filters
            const number = est.estimate_number.toString();
            const matchesNumber = selectedNumbers.includes(number);

            const customerName = est.customer?.name || '—';
            const matchesCustomer = selectedCustomers.includes(customerName);

            const statusLabel = statusColors[est.status]?.label || est.status;
            const matchesStatus = selectedStatusLabels.includes(statusLabel);

            const date = new Date(est.estimate_date).toLocaleDateString('pt-BR');
            const matchesDate = selectedDates.includes(date);

            const shipDate = est.ship_date ? new Date(est.ship_date).toLocaleDateString('pt-BR') : '—';
            const matchesShipDate = selectedShipDates.includes(shipDate);

            const value = `$${(est.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            const matchesValue = selectedValues.includes(value);

            return matchesSearch && matchesCustomer && matchesStatus && matchesNumber && matchesDate && matchesShipDate && matchesValue;
        });
    }, [estimates, searchTerm, selectedCustomers, selectedStatusLabels, selectedNumbers, selectedDates, selectedShipDates, selectedValues]);

    const stats = useMemo(() => ({
        total: estimates.length,
        draft: estimates.filter(e => e.status === 'draft').length,
        sent: estimates.filter(e => e.status === 'sent').length,
        approved: estimates.filter(e => e.status === 'approved' || e.status === 'converted').length,
        prospectingValue: estimates.filter(e => ['draft', 'sent'].includes(e.status)).reduce((sum, e) => sum + (e.total || 0), 0),
        closedValue: estimates.filter(e => ['approved', 'converted'].includes(e.status)).reduce((sum, e) => sum + (e.total || 0), 0),
    }), [estimates]);

    const clearFilters = () => {
        setSelectedCustomers(uniqueCustomers);
        setSelectedStatusLabels(uniqueStatusLabels);
        setSelectedNumbers(uniqueNumbers);
        setSelectedDates(uniqueDates);
        setSelectedShipDates(uniqueShipDates);
        setSelectedValues(uniqueValues);
        setSearchTerm('');
    };

    const hasActiveFilters =
        selectedCustomers.length !== uniqueCustomers.length ||
        selectedStatusLabels.length !== uniqueStatusLabels.length ||
        selectedNumbers.length !== uniqueNumbers.length ||
        selectedDates.length !== uniqueDates.length ||
        selectedShipDates.length !== uniqueShipDates.length ||
        selectedValues.length !== uniqueValues.length ||
        searchTerm !== '';

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Estimates"
                description="Gestão de cotações e propostas comerciais"
                icon="📋"
                breadcrumbs={[
                    { label: 'COMERCIAL', href: `/${locale}/commercial`, color: '#0891b2' },
                    { label: 'ESTIMATES', color: '#0891b2' },
                ]}
                moduleColor="#0891b2"
                actions={
                    <Link
                        href={`/${locale}/commercial/estimates/new`}
                        style={{
                            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '16px 32px',
                            fontSize: '14px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(8, 145, 178, 0.35)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        + Novo Estimate
                    </Link>
                }
            />

            {/* Stats Mini Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ background: 'white', padding: '16px 24px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>TOTAL</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{stats.total}</div>
                </div>
                <div style={{ background: 'white', padding: '16px 24px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>RASCUNHOS</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#64748b' }}>{stats.draft}</div>
                </div>
                <div style={{ background: 'white', padding: '16px 24px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>ENVIADOS</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563eb' }}>{stats.sent}</div>
                </div>
                <div style={{ background: 'white', padding: '16px 24px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>APROVADOS</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a' }}>{stats.approved}</div>
                </div>

                {/* Value Cards */}
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '16px 24px', borderRadius: '14px', color: 'white' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8, marginBottom: '4px' }}>EM PROSPECÇÃO</div>
                    <div style={{ fontSize: '24px', fontWeight: '900' }}>${stats.prospectingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px 24px', borderRadius: '14px', color: 'white' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8, marginBottom: '4px' }}>FECHADOS</div>
                    <div style={{ fontSize: '24px', fontWeight: '900' }}>${stats.closedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Buscar por cliente ou número..."
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

            {/* Estimates Table */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #f1f5f9',
                overflow: 'visible', // Changed to visible for Popover
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Carregando...</div>
                ) : filteredEstimates.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>Nenhum estimate encontrado</div>
                        <Link href={`/${locale}/commercial/estimates/new`} style={{ color: '#7c3aed', fontWeight: '700', textDecoration: 'none' }}>
                            Criar o primeiro →
                        </Link>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 50 }}>
                            <tr>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                    <ColumnFilter
                                        label="Nº"
                                        options={uniqueNumbers}
                                        selected={selectedNumbers}
                                        onChange={setSelectedNumbers}
                                    />
                                </th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                    <ColumnFilter
                                        label="CLIENTE"
                                        options={uniqueCustomers}
                                        selected={selectedCustomers}
                                        onChange={setSelectedCustomers}
                                    />
                                </th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                    <ColumnFilter
                                        label="DATA"
                                        options={uniqueDates}
                                        selected={selectedDates}
                                        onChange={setSelectedDates}
                                    />
                                </th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                    <ColumnFilter
                                        label="ENVIO"
                                        options={uniqueShipDates}
                                        selected={selectedShipDates}
                                        onChange={setSelectedShipDates}
                                    />
                                </th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                    <ColumnFilter
                                        label="STATUS"
                                        options={uniqueStatusLabels}
                                        selected={selectedStatusLabels}
                                        onChange={setSelectedStatusLabels}
                                    />
                                </th>
                                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                    <ColumnFilter
                                        label="VALOR"
                                        options={uniqueValues}
                                        selected={selectedValues}
                                        onChange={setSelectedValues}
                                    />
                                </th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEstimates.map((est) => (
                                <tr key={est.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            background: '#7c3aed15',
                                            color: '#7c3aed',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '800'
                                        }}>
                                            #{est.estimate_number}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>
                                            {est.customer?.name || '—'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                                        {new Date(est.estimate_date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                                        {est.ship_date ? new Date(est.ship_date).toLocaleDateString('pt-BR') : '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            background: statusColors[est.status]?.bg || '#f1f5f9',
                                            color: statusColors[est.status]?.text || '#64748b'
                                        }}>
                                            {statusColors[est.status]?.label || est.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                                        ${(est.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <Link
                                                href={`/${locale}/commercial/estimates/${est.id}`}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    color: '#3b82f6',
                                                    fontSize: '12px',
                                                    textDecoration: 'none',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                ✏️ Editar
                                            </Link>
                                            {est.status !== 'converted' && est.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleApprove(est.id)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        background: 'white',
                                                        color: '#16a34a',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600'
                                                    }}
                                                    title="Aprovar pelo Cliente"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                onClick={() => window.open(`/api/estimates/${est.id}/pdf`, '_blank')}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    color: '#7c3aed',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                📄 PDF
                                            </button>
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
