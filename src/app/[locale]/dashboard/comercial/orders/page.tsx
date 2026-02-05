'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function OrdersListPage() {
    const supabase = useSupabase();
    const params = useParams();
    const { locale } = params;

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_orders')
            .select('*, customer:agents(name)')
            .is('deleted_at', null)
            .order('order_number', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    };

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: '#fffbeb', text: '#d97706', label: 'Pendente' },
        approved: { bg: '#dcfce7', text: '#16a34a', label: 'Aprovado' },
        processing: { bg: '#dbeafe', text: '#2563eb', label: 'Processando' },
        shipped: { bg: '#f3e8ff', text: '#7c3aed', label: 'Enviado' },
        delivered: { bg: '#f0fdf4', text: '#15803d', label: 'Entregue' },
        cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelado' },
    };

    const cardStyle = { background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Pedidos de Venda"
                description="Gestão de todos os pedidos confirmados"
                icon="🛒"
                breadcrumbs={[
                    { label: 'COMERCIAL', href: '/dashboard/comercial', color: '#0891b2' },
                    { label: 'PEDIDOS', color: '#0891b2' },
                ]}
                moduleColor="#0891b2"
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Carregando pedidos...</div>
            ) : (
                <div style={cardStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>PEDIDO</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>CLIENTE</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>DATA</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>VALOR</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>STATUS</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum pedido encontrado.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px', fontWeight: '800', color: '#3B82F6' }}>#{order.order_number}</td>
                                        <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>{order.customer?.name}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px', fontWeight: '700', color: '#0f172a' }}>${(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                background: statusColors[order.status]?.bg || '#f1f5f9',
                                                color: statusColors[order.status]?.text || '#64748b'
                                            }}>
                                                {statusColors[order.status]?.label || order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <Link
                                                href={`/dashboard/comercial/orders/${order.id}`}
                                                style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: '8px', color: '#475569', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}
                                            >
                                                Detalhes
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
