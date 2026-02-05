'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { getErrorMessage } from '@/lib/errors';

interface Bank {
    id: string;
    name: string;
    account_number: string | null;
    institution: string | null;
    currency: string;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    invoice: {
        id: string;
        ap_number: string;
        amount: number;
        currency: string;
    } | null;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, invoice }: PaymentModalProps) {
    const supabase = useSupabase();
    const { alert: uiAlert, toast } = useUI();
    const { logAction } = useAuditLog();
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState<Bank[]>([]);

    const [formData, setFormData] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        bank_id: '',
        payment_method: 'wire',
        notes: '',
        paid_amount: 0
    });

    useEffect(() => {
        if (isOpen && invoice) {
            setFormData(prev => ({
                ...prev,
                paid_amount: invoice.amount
            }));
        }
    }, [isOpen, invoice]);

    useEffect(() => {
        if (isOpen) {
            fetchBanks();
        }
    }, [isOpen]);

    const fetchBanks = async () => {
        const { data } = await supabase
            .from('bank_accounts')
            .select('id, name, account_number, institution, currency')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('name');

        if (data) setBanks(data as Bank[]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice) return;
        if (!formData.bank_id) {
            toast.warning('Selecione o banco de origem do recurso.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('invoices')
                .update({
                    status: 'paid',
                    amount: formData.paid_amount,
                    amount_usd: formData.paid_amount, // Update USD as well for now
                    payment_date: formData.payment_date,
                    bank_id: formData.bank_id,
                    payment_method: formData.payment_method,
                    notes: formData.notes ? `Baixa: ${formData.notes}` : undefined
                })
                .eq('id', invoice.id);

            if (error) throw error;

            await logAction({
                action: 'UPDATE',
                entity_type: 'invoice',
                entity_id: invoice.id,
                details: `Registrou pagamento (baixa) da AP ${invoice.ap_number}`
            });

            await uiAlert('Sucesso', `Pagamento da AP ${invoice.ap_number} registrado com sucesso!`, 'success');
            onSuccess();
            onClose();
        } catch (error: unknown) {
            console.error('Error recording payment:', error);
            toast.error('Não foi possível registrar o pagamento: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !invoice) return null;

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    };

    const modalStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.3s ease-out'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#64748b',
        marginBottom: '6px'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        background: '#f8fafc',
        transition: 'all 0.2s'
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            style={overlayStyle}
            onMouseDown={(e) => {
                // Store if the mousedown started on the overlay
                if (e.target === e.currentTarget) {
                    (e.currentTarget as any)._startedOnOverlay = true;
                } else {
                    (e.currentTarget as any)._startedOnOverlay = false;
                }
            }}
            onClick={(e) => {
                // Only close if it both started and ended on the overlay
                if (e.target === e.currentTarget && (e.currentTarget as any)._startedOnOverlay) {
                    onClose();
                }
            }}
        >
            <div style={modalStyle}>
                {/* Header */}
                <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>
                        Baixa de Pagamento
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>
                        {invoice.ap_number}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', opacity: 0.8 }}>Valor Esperado:</span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #dbeafe', paddingTop: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>Valor Pago:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: '800', color: '#1e40af' }}>$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.paid_amount}
                                    onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                                    style={{
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.5)',
                                        borderRadius: '8px',
                                        padding: '4px 8px',
                                        fontSize: '18px',
                                        fontWeight: '900',
                                        color: '#1e40af',
                                        width: '140px',
                                        textAlign: 'right',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Data do Pagamento</label>
                            <input
                                type="date"
                                required
                                value={formData.payment_date}
                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Banco / Origem do Recurso</label>
                            <select
                                required
                                value={formData.bank_id}
                                onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="">Selecione o banco...</option>
                                {banks.map(bank => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name} {bank.account_number ? `(${bank.account_number})` : ''} - {bank.currency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Método de Pagamento</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="wire">Wire Transfer / ACH</option>
                                <option value="zelle">Zelle</option>
                                <option value="check">Check (Cheque)</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="cash">Cash (Espécie)</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Observações da Baixa</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                style={{ ...inputStyle, height: '80px', resize: 'none' }}
                                placeholder="Ex: Número do comprovante, detalhes adicionais..."
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            {loading ? 'Processando...' : 'Confirmar Pagamento'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
