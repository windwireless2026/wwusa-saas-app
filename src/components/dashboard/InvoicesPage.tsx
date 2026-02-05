'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';
import { useAuditLog } from '@/hooks/useAuditLog';
import Link from 'next/link';
import PaymentModal from './PaymentModal';
import PageHeader from '@/components/ui/PageHeader';
import { getFiscalWeeksForMonth, FiscalWeek } from '@/lib/fiscalWeek';
import { getErrorMessage } from '@/lib/errors';

interface Invoice {
    id: string;
    invoice_number: string;
    ap_number: string;
    invoice_date: string;
    due_date: string;
    payment_date: string | null;
    amount: number;
    currency: string;
    status: string;
    agent_id: string;
    installment_number?: number;
    total_installments?: number;
    agents?: {
        name: string;
    };
    cost_centers?: {
        name: string;
        code: string;
    };
    attachment_url?: string;
}

export default function InvoicesPage() {
    const supabase = useSupabase();
    const t = useTranslations('Dashboard.Invoices');
    const tCommon = useTranslations('Dashboard.Common');
    const { alert: uiAlert, confirm: uiConfirm, toast } = useUI();
    const router = useRouter();
    const { logAction } = useAuditLog();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [showDeleted, setShowDeleted] = useState(false);

    // Filter states
    const [filterAP, setFilterAP] = useState('');
    const [filterVendor, setFilterVendor] = useState('');
    const [filterCostCenter, setFilterCostCenter] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterWeek, setFilterWeek] = useState<string>('');
    const [filterWeekType, setFilterWeekType] = useState<'due' | 'payment'>('due'); // 'due' = vencimento, 'payment' = pagamento
    const [filterMonthType, setFilterMonthType] = useState<'due' | 'payment'>('due'); // qual mês filtrar
    const [filterMonth, setFilterMonth] = useState<string>(''); // YYYY-MM
    const [filterMinValue, setFilterMinValue] = useState<string>('');
    const [filterMaxValue, setFilterMaxValue] = useState<string>('');
    const [filterMinDueDate, setFilterMinDueDate] = useState<string>('');
    const [filterMaxDueDate, setFilterMaxDueDate] = useState<string>('');
    const [fiscalWeeks, setFiscalWeeks] = useState<FiscalWeek[]>([]);
    const [valuePreset, setValuePreset] = useState<string>('');

    // Option lists for quick selection + typing
    const apOptions = useMemo(() => Array.from(new Set(invoices.map(i => i.ap_number).filter(Boolean))), [invoices]);
    const vendorOptions = useMemo(() => Array.from(new Set(invoices.map(i => i.agents?.name).filter(Boolean))), [invoices]);
    const costCenterOptions = useMemo(() => Array.from(new Set(invoices.map(i => i.cost_centers?.code).filter(Boolean))), [invoices]);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);

    useEffect(() => {
        fetchInvoices();
    }, [filter, showDeleted]);

    // Load fiscal weeks for current month
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const weeks = getFiscalWeeksForMonth(year, month);
        setFiscalWeeks(weeks);
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        let query = supabase
            .from('invoices')
            .select(`
        *,
        agents!agent_id (name),
        cost_centers (name, code)
      `)
            .is('deleted_at', showDeleted ? null : null) // Placeholder to match structure
            .order('due_date', { ascending: false });

        if (showDeleted) {
            query = query.not('deleted_at', 'is', null);
        } else {
            query = query.is('deleted_at', null);
        }

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching invoices:', error);
            setInvoices([]);
        } else if (data) {
            setInvoices(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, apNumber: string) => {
        const isConfirmed = await uiConfirm(
            t('confirmDeleteTitle') || 'Confirmar Exclusão',
            t('confirmDeleteMessage', { apNumber: apNumber || 'selecionada' }) || `Deseja realmente excluir a AP ${apNumber || 'selecionada'}?`,
            'danger'
        );

        if (!isConfirmed) return;

        try {
            const { error } = await supabase
                .from('invoices')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            await logAction({
                action: 'DELETE',
                entity_type: 'invoice',
                entity_id: id,
                details: `Excluiu a AP ${apNumber}`
            });

            toast.success(t('deleteSuccess') || 'AP enviada para a lixeira.');

            fetchInvoices();
        } catch (error: unknown) {
            console.error('Error deleting invoice:', error);
            toast.error('Erro ao excluir AP: ' + getErrorMessage(error));
        }
    };

    const handleRestore = async (id: string, apNumber: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('invoices')
                .update({ deleted_at: null })
                .eq('id', id);

            if (error) throw error;

            await logAction({
                action: 'UPDATE',
                entity_type: 'invoice',
                entity_id: id,
                details: `Restaurou a AP ${apNumber}`
            });

            await uiAlert(tCommon('success'), t('restoreSuccess') || 'AP restaurada com sucesso!', 'success');
            fetchInvoices();
        } catch (error: unknown) {
            console.error('Error restoring invoice:', error);
            toast.error('Erro ao restaurar AP: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string; border: string }> = {
            pending: { bg: '#fffbeb', text: '#f59e0b', border: '#fef08a' },
            paid: { bg: '#f0fdf4', text: '#10b981', border: '#bbf7d0' },
            overdue: { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
            cancelled: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
        };
        return colors[status] || colors.pending;
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        // Parse YYYY-MM-DD string into local date to avoid timezone shift
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <PageHeader
                title="Contas a Pagar (AP)"
                description="Gerenciar faturas e autorizações de pagamento"
                icon="💰"
                breadcrumbs={[
                    { label: 'FINANCEIRO', href: '/finance', color: '#059669' },
                    { label: 'CONTAS A PAGAR', color: '#059669' },
                ]}
                moduleColor="#059669"
                actions={
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowDeleted(!showDeleted)}
                            style={{
                                padding: '12px 20px',
                                background: showDeleted ? '#64748b' : '#fff',
                                color: showDeleted ? '#fff' : '#64748b',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                            }}
                        >
                            {showDeleted ? '📄 Ver Ativos' : '🗑️ Ver Lixeira'}
                        </button>
                        <Link
                            href="/finance/accounts-payable/new"
                            style={{
                                padding: '12px 24px',
                                background: '#059669',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '14px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)',
                            }}
                        >
                            ➕ {t('addNew')}
                        </Link>
                    </div>
                }
            />

            {/* Filters */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                {[
                    { id: 'all', label: t('filters.all') || 'All', icon: '📊' },
                    { id: 'pending', label: t('filters.pending') || 'Pending', icon: '⏳' },
                    { id: 'paid', label: t('filters.paid') || 'Paid', icon: '✅' },
                    { id: 'overdue', label: t('filters.overdue') || 'Overdue', icon: '🔴' },
                ].map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => setFilter(id as any)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: filter === id ? '2px solid #3B82F6' : '1px solid #e2e8f0',
                            background: filter === id ? '#eff6ff' : '#fff',
                            color: filter === id ? '#1e40af' : '#64748b',
                            fontWeight: filter === id ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            {/* Vencimento range in header */}
            <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>Vencimento</div>
                <input
                    type="date"
                    value={filterMinDueDate}
                    onChange={(e) => setFilterMinDueDate(e.target.value)}
                    style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', minWidth: '160px' }}
                />
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>até</span>
                <input
                    type="date"
                    value={filterMaxDueDate}
                    onChange={(e) => setFilterMaxDueDate(e.target.value)}
                    style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', minWidth: '160px' }}
                />
            </div>

            {/* Table */}
            <div
                style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                <div style={{ marginBottom: '8px' }}>{t('table.apNumber')}</div>
                                <input
                                    type="text"
                                    placeholder="Selecionar ou digitar..."
                                    value={filterAP}
                                    onChange={(e) => setFilterAP(e.target.value)}
                                    list="ap-options"
                                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '25%' }}>
                                <div style={{ marginBottom: '8px' }}>{t('table.vendor')}</div>
                                <input
                                    type="text"
                                    placeholder="Selecionar ou digitar..."
                                    value={filterVendor}
                                    onChange={(e) => setFilterVendor(e.target.value)}
                                    list="vendor-options"
                                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '15%' }}>
                                <div style={{ marginBottom: '8px' }}>{t('table.costCenter')}</div>
                                <input
                                    type="text"
                                    placeholder="Selecionar ou digitar..."
                                    value={filterCostCenter}
                                    onChange={(e) => setFilterCostCenter(e.target.value)}
                                    list="cost-center-options"
                                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '11%' }}>
                                <div style={{ marginBottom: '8px' }}>VALOR</div>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                    <select
                                        value={valuePreset}
                                        onChange={(e) => {
                                            const preset = e.target.value;
                                            setValuePreset(preset);
                                            if (!preset) {
                                                setFilterMinValue('');
                                                setFilterMaxValue('');
                                                return;
                                            }
                                            const [min, max] = preset.split('-');
                                            setFilterMinValue(min || '');
                                            setFilterMaxValue(max || '');
                                        }}
                                        style={{ flex: 1, padding: '6px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px' }}
                                    >
                                        <option value="">Selecionar faixa</option>
                                        <option value="0-1000">0 a 1.000</option>
                                        <option value="1000-5000">1.000 a 5.000</option>
                                        <option value="5000-10000">5.000 a 10.000</option>
                                        <option value="10000-50000">10.000 a 50.000</option>
                                        <option value="50000-">50.000+</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filterMinValue}
                                        onChange={(e) => {
                                            setValuePreset('');
                                            setFilterMinValue(e.target.value);
                                        }}
                                        style={{ flex: 1, padding: '6px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filterMaxValue}
                                        onChange={(e) => {
                                            setValuePreset('');
                                            setFilterMaxValue(e.target.value);
                                        }}
                                        style={{ flex: 1, padding: '6px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px' }}
                                    />
                                </div>
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '12%' }}>
                                <div style={{ marginBottom: '8px' }}>VENCIMENTO</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Range no cabeçalho</div>
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '13%' }}>
                                <div style={{ marginBottom: '8px' }}>Semana Fiscal</div>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                    <button
                                        onClick={() => setFilterWeekType('due')}
                                        style={{
                                            flex: 1,
                                            padding: '4px 6px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            border: 'none',
                                            borderRadius: '4px',
                                            background: filterWeekType === 'due' ? '#059669' : '#e2e8f0',
                                            color: filterWeekType === 'due' ? 'white' : '#64748b',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Vencimento
                                    </button>
                                    <button
                                        onClick={() => setFilterWeekType('payment')}
                                        style={{
                                            flex: 1,
                                            padding: '4px 6px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            border: 'none',
                                            borderRadius: '4px',
                                            background: filterWeekType === 'payment' ? '#059669' : '#e2e8f0',
                                            color: filterWeekType === 'payment' ? 'white' : '#64748b',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Pagamento
                                    </button>
                                </div>
                                <select
                                    value={filterWeek}
                                    onChange={(e) => setFilterWeek(e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                                >
                                    <option value="">Todas</option>
                                    {fiscalWeeks.map((week) => (
                                        <option key={`${week.month}-${week.week}`} value={`${week.month}-${week.week}`}>
                                            Semana {week.week}
                                        </option>
                                    ))}
                                </select>
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '11%' }}>
                                <div style={{ marginBottom: '8px' }}>MÊS</div>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                    <button
                                        onClick={() => setFilterMonthType('due')}
                                        style={{
                                            flex: 1,
                                            padding: '4px 6px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            border: 'none',
                                            borderRadius: '4px',
                                            background: filterMonthType === 'due' ? '#059669' : '#e2e8f0',
                                            color: filterMonthType === 'due' ? 'white' : '#64748b',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Venc.
                                    </button>
                                    <button
                                        onClick={() => setFilterMonthType('payment')}
                                        style={{
                                            flex: 1,
                                            padding: '4px 6px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            border: 'none',
                                            borderRadius: '4px',
                                            background: filterMonthType === 'payment' ? '#059669' : '#e2e8f0',
                                            color: filterMonthType === 'payment' ? 'white' : '#64748b',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Pag.
                                    </button>
                                </div>
                                <input
                                    type="month"
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(e.target.value)}
                                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '13%' }}>
                                {t('table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            invoices
                                .filter(invoice => {
                                    // Apply client-side filters
                                    if (filterAP && !(invoice.ap_number || '').toLowerCase().includes(filterAP.toLowerCase())) return false;
                                    if (filterVendor && !(invoice.agents?.name || '').toLowerCase().includes(filterVendor.toLowerCase())) return false;
                                    if (filterCostCenter && !(invoice.cost_centers?.code || '').toLowerCase().includes(filterCostCenter.toLowerCase())) return false;
                                    if (filterStatus && invoice.status !== filterStatus) return false;
                                    
                                    // Filter by value range
                                    if (filterMinValue && invoice.amount < parseFloat(filterMinValue)) return false;
                                    if (filterMaxValue && invoice.amount > parseFloat(filterMaxValue)) return false;
                                    
                                    // Filter by due date range
                                    if (filterMinDueDate && invoice.due_date < filterMinDueDate) return false;
                                    if (filterMaxDueDate && invoice.due_date > filterMaxDueDate) return false;
                                    
                                    // Filter by month
                                    if (filterMonth) {
                                        const dateToCheck = filterMonthType === 'payment' ? invoice.payment_date : invoice.due_date;
                                        if (!dateToCheck) return false;
                                        const invoiceMonth = dateToCheck.substring(0, 7); // YYYY-MM
                                        if (invoiceMonth !== filterMonth) return false;
                                    }
                                    
                                    // Filter by fiscal week
                                    if (filterWeek) {
                                        const dateToCheck = filterWeekType === 'payment' ? invoice.payment_date : invoice.due_date;
                                        if (!dateToCheck) return false;
                                        
                                        const [monthStr, weekStr] = filterWeek.split('-');
                                        const targetWeek = parseInt(weekStr);
                                        
                                        // Get the week for this invoice's date
                                        const [invoiceYear, invoiceMonth] = dateToCheck.split('-').map(Number);
                                        const invoiceWeeks = getFiscalWeeksForMonth(invoiceYear, invoiceMonth);
                                        const invoiceWeekObj = invoiceWeeks.find(w => {
                                            const startDate = new Date(`${w.startDate}T00:00:00`);
                                            const endDate = new Date(`${w.endDate}T00:00:00`);
                                            const checkDate = new Date(`${dateToCheck}T00:00:00`);
                                            return checkDate >= startDate && checkDate <= endDate;
                                        });
                                        
                                        if (!invoiceWeekObj || invoiceWeekObj.week !== targetWeek) return false;
                                    }
                                    
                                    return true;
                                })
                                .map((invoice) => {
                                    // Get fiscal week for this invoice based on filter type
                                    const dateToUse = filterWeekType === 'payment' ? invoice.payment_date : invoice.due_date;
                                    let weekLabel = '-';
                                    
                                    if (dateToUse) {
                                        const [invoiceYear, invoiceMonth] = dateToUse.split('-').map(Number);
                                        const invoiceWeeks = getFiscalWeeksForMonth(invoiceYear, invoiceMonth);
                                        const invoiceWeekObj = invoiceWeeks.find(w => {
                                            const startDate = new Date(`${w.startDate}T00:00:00`);
                                            const endDate = new Date(`${w.endDate}T00:00:00`);
                                            const checkDate = new Date(`${dateToUse}T00:00:00`);
                                            return checkDate >= startDate && checkDate <= endDate;
                                        });
                                        weekLabel = invoiceWeekObj?.label || '-';
                                    }
                                    
                                    const statusColor = getStatusColor(invoice.status);
                                return (
                                    <tr key={invoice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '700', color: '#3B82F6', fontSize: '13px' }}>
                                                {invoice.ap_number || 'S/N'}
                                                {invoice.total_installments && invoice.total_installments > 1 && (
                                                    <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '6px' }}>
                                                        ({invoice.installment_number}/{invoice.total_installments})
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: '500', color: '#475569', fontSize: '12px' }}>
                                                Ref: {invoice.invoice_number}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                {formatDate(invoice.invoice_date)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#475569' }}>
                                            {invoice.agents?.name || '-'}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {invoice.cost_centers ? (
                                                <span
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        background: '#f1f5f9',
                                                        color: '#475569',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {invoice.cost_centers.code}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a', textAlign: 'right' }}>
                                            {formatCurrency(invoice.amount, invoice.currency)}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', textAlign: 'right' }}>
                                            {formatDate(invoice.due_date)}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#059669' }}>
                                            {weekLabel}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    background: statusColor.bg,
                                                    color: statusColor.text,
                                                    border: `1px solid ${statusColor.border}`,
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                {invoice.attachment_url && (
                                                    <a
                                                        href={invoice.attachment_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Ver Anexo"
                                                        style={{
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0',
                                                            background: '#f8fafc',
                                                            textDecoration: 'none',
                                                            fontSize: '14px',
                                                            lineHeight: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e: any) => e.currentTarget.style.background = '#eff6ff'}
                                                        onMouseOut={(e: any) => e.currentTarget.style.background = '#f8fafc'}
                                                    >
                                                        📎
                                                    </a>
                                                )}
                                                {!showDeleted ? (
                                                    <>
                                                        {invoice.status !== 'paid' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedInvoiceForPayment(invoice);
                                                                    setIsPaymentModalOpen(true);
                                                                }}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #bbf7d0',
                                                                    background: '#f0fdf4',
                                                                    color: '#10b981',
                                                                    fontSize: '12px',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                💸 Pagar
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/finance/accounts-payable/${invoice.id}/edit`}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #e2e8f0',
                                                                background: '#fff',
                                                                color: '#3b82f6',
                                                                textDecoration: 'none',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            {tCommon('edit')}
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRestore(invoice.id, invoice.ap_number)}
                                                        style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #bbf7d0',
                                                            background: '#f0fdf4',
                                                            color: '#10b981',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        Restaurar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Datalists for selection + typing */}
            <datalist id="ap-options">
                {apOptions.map((ap) => (
                    <option key={ap} value={ap} />
                ))}
            </datalist>
            <datalist id="vendor-options">
                {vendorOptions.map((vendor) => (
                    <option key={vendor} value={vendor} />
                ))}
            </datalist>
            <datalist id="cost-center-options">
                {costCenterOptions.map((cc) => (
                    <option key={cc} value={cc} />
                ))}
            </datalist>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedInvoiceForPayment(null);
                }}
                onSuccess={fetchInvoices}
                invoice={selectedInvoiceForPayment}
            />
        </div>
    );
}
