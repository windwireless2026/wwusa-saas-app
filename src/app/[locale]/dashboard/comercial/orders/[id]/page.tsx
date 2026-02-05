'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import { getErrorMessage } from '@/lib/errors';

export default function OrderDetailsPage() {
    const supabase = useSupabase();
    const router = useRouter();
    const params = useParams();
    const { id, locale } = params;
    const { alert, confirm, toast } = useUI();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_orders')
            .select('*, items:sales_order_items(*), customer:agents(*)')
            .eq('id', id)
            .single();

        if (error) {
            toast.error('Não foi possível carregar o pedido');
            router.push('/dashboard/comercial/orders');
            return;
        }

        if (data) setOrder(data);
        setLoading(false);
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        const { error } = await supabase
            .from('sales_orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            await alert('Sucesso', `Status atualizado para ${newStatus}`, 'success');
            fetchOrder();
        } else {
            toast.error(getErrorMessage(error));
        }
        setUpdating(false);
    };

    const cardStyle = { background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' };
    const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800' as const, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: '#fffbeb', text: '#d97706', label: 'PENDENTE' },
        approved: { bg: '#dcfce7', text: '#16a34a', label: 'APROVADO' },
        processing: { bg: '#dbeafe', text: '#2563eb', label: 'PROCESSANDO' },
        shipped: { bg: '#f3e8ff', text: '#7c3aed', label: 'ENVIADO' },
        delivered: { bg: '#f0fdf4', text: '#15803d', label: 'ENTREGUE' },
        cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'CANCELADO' },
    };

    const currentStatus = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b', label: order.status.toUpperCase() };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>
                        <Link href="/dashboard/comercial/orders" style={{ textDecoration: 'none', color: '#7c3aed' }}>PEDIDOS</Link>
                        <span style={{ opacity: 0.3 }}> › </span>
                        <span>#{order.order_number}</span>
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                        🛒 Pedido de Venda
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        background: currentStatus.bg,
                        color: currentStatus.text,
                        fontWeight: '900',
                        fontSize: '14px',
                        border: `1px solid ${currentStatus.text}20`
                    }}>
                        {currentStatus.label}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '28px' }}>
                <div>
                    {/* General Info */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '24px' }}>📋 Informações Gerais</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Cliente</label>
                                <div style={{ fontWeight: '700' }}>{order.customer?.name}</div>
                            </div>
                            <div>
                                <label style={labelStyle}>Data do Pedido</label>
                                <div style={{ fontWeight: '600' }}>{new Date(order.order_date).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <label style={labelStyle}>Vendedor</label>
                                <div style={{ fontWeight: '600' }}>{order.salesperson_id || 'Não definido'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Ship To */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '24px' }}>🚚 Endereço de Entrega</h3>
                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                            <div style={{ fontWeight: '700' }}>{order.ship_to_name}</div>
                            <div>{order.ship_to_address}</div>
                            <div>{order.ship_to_city}, {order.ship_to_state} {order.ship_to_zip}</div>
                            <div>{order.ship_to_country}</div>
                            {order.ship_to_phone && <div style={{ marginTop: '8px' }}>📞 {order.ship_to_phone}</div>}
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ ...cardStyle, padding: '40px', overflow: 'hidden' }}>
                        <div style={{ padding: '28px 28px 0 28px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '24px' }}>📦 Itens do Pedido</h3>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '16px 28px', fontSize: '12px', color: '#64748b' }}>PRODUTO</th>
                                    <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>GRADE</th>
                                    <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>QTD</th>
                                    <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>PREÇO UN.</th>
                                    <th style={{ padding: '16px 28px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item: any) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 28px' }}>
                                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.model} {item.capacity}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{item.description}</div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{item.grade}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</td>
                                        <td style={{ padding: '16px', textAlign: 'right', color: '#64748b' }}>${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '16px 28px', textAlign: 'right', fontWeight: '800' }}>${(item.quantity * item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    {/* Totals Card */}
                    <div style={{ ...cardStyle, background: '#0f172a', color: 'white' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginTop: 0, marginBottom: '24px', opacity: 0.9 }}>💰 Resumo Financeiro</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ opacity: 0.6 }}>Subtotal:</span>
                                <span>${(order.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#f87171' }}>
                                    <span style={{ opacity: 0.8 }}>Desconto:</span>
                                    <span>-${(order.discount_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '700', opacity: 0.9 }}>TOTAL:</span>
                                <span style={{ fontSize: '28px', fontWeight: '950' }}>${(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Commission Card */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>💵 Comissão do Vendedor</h3>
                        <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Valor Previsto ({order.commission_percent}%)</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803d' }}>
                                ${((order.total * order.commission_percent) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <p style={{ fontSize: '11px', color: '#166534', marginTop: '8px', opacity: 0.8 }}>
                                Calculada sobre o total do pedido.
                            </p>
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '16px' }}>⚙️ Ações do Pedido</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['approved', 'processing', 'shipped', 'delivered'].includes(order.status) === false && (
                                <button onClick={() => updateStatus('approved')} disabled={updating} style={{ padding: '12px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', border: 'none', fontWeight: '700', cursor: 'pointer' }}>✓ Aprovar Pedido</button>
                            )}
                            {order.status === 'approved' && (
                                <button onClick={() => updateStatus('processing')} disabled={updating} style={{ padding: '12px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', border: 'none', fontWeight: '700', cursor: 'pointer' }}>⚙️ Iniciar Processamento</button>
                            )}
                            {order.status === 'processing' && (
                                <button onClick={() => updateStatus('shipped')} disabled={updating} style={{ padding: '12px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', border: 'none', fontWeight: '700', cursor: 'pointer' }}>🚢 Marcar como Enviado</button>
                            )}
                            <button onClick={() => window.print()} style={{ padding: '12px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '700', cursor: 'pointer' }}>🖨️ Imprimir Order</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
