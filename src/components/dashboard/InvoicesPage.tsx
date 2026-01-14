'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';
import { useAuditLog } from '@/hooks/useAuditLog';
import Link from 'next/link';
import PaymentModal from './PaymentModal';

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
    const { alert: uiAlert, confirm: uiConfirm } = useUI();
    const router = useRouter();
    const { logAction } = useAuditLog();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [showDeleted, setShowDeleted] = useState(false);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);

    useEffect(() => {
        fetchInvoices();
    }, [filter, showDeleted]);

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

            await uiAlert(tCommon('success'), t('deleteSuccess') || 'AP enviada para a lixeira.', 'success');

            fetchInvoices();
        } catch (error: any) {
            console.error('Error deleting invoice:', error);
            await uiAlert(tCommon('error'), 'Erro ao excluir AP: ' + error.message, 'danger');
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
        } catch (error: any) {
            console.error('Error restoring invoice:', error);
            await uiAlert(tCommon('error'), 'Erro ao restaurar AP: ' + error.message, 'danger');
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
        <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div
                style={{
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
                        💰 Finanças › {t('breadcrumb')}
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        💰 {t('title')}
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
                        {t('subtitle')}
                    </p>
                </div>
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {showDeleted ? '📄 Ver Ativos' : '🗑️ Ver Lixeira'}
                    </button>
                    <Link
                        href="/dashboard/invoices/new"
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1e40af 100%)',
                            color: 'white',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '14px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        ➕ {t('addNew')}
                    </Link>
                </div>
            </div>

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
                                {t('table.apNumber')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '25%' }}>
                                {t('table.vendor')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '15%' }}>
                                {t('table.costCenter')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '12%' }}>
                                {t('table.amount')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '12%' }}>
                                {t('table.dueDate')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '10%' }}>
                                {t('table.status')}
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
                            invoices.map((invoice) => {
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
                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a' }}>
                                            {formatCurrency(invoice.amount, invoice.currency)}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>
                                            {formatDate(invoice.due_date)}
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
                                                            href={`/dashboard/invoices/${invoice.id}/edit`}
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
