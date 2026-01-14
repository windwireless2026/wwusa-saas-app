'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';

type EstimateStats = {
    total: number;
    draft: number;
    sent: number;
    approved: number;
    converted: number;
    totalValue: number;
    thisMonth: number;
    thisMonthValue: number;
    prospectingValue: number;
    closedValue: number;
};

export default function ComercialDashboard() {
    const supabase = useSupabase();
    const [stats, setStats] = useState<EstimateStats>({
        total: 0,
        draft: 0,
        sent: 0,
        approved: 0,
        converted: 0,
        totalValue: 0,
        thisMonth: 0,
        thisMonthValue: 0,
        prospectingValue: 0,
        closedValue: 0
    });
    const [recentEstimates, setRecentEstimates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch estimates stats
        const { data: estimates } = await supabase
            .from('estimates')
            .select('*, customer:customer_id(name)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (estimates) {
            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            setStats({
                total: estimates.length,
                draft: estimates.filter((e: any) => e.status === 'draft').length,
                sent: estimates.filter((e: any) => e.status === 'sent').length,
                approved: estimates.filter((e: any) => e.status === 'approved').length,
                converted: estimates.filter((e: any) => e.status === 'converted').length,
                totalValue: estimates.reduce((sum: number, e: any) => sum + (e.total || 0), 0),
                thisMonth: estimates.filter((e: any) => new Date(e.created_at) >= thisMonthStart).length,
                thisMonthValue: estimates.filter((e: any) => new Date(e.created_at) >= thisMonthStart)
                    .reduce((sum: number, e: any) => sum + (e.total || 0), 0),
                prospectingValue: estimates.filter((e: any) => ['draft', 'sent'].includes(e.status))
                    .reduce((sum: number, e: any) => sum + (e.total || 0), 0),
                closedValue: estimates.filter((e: any) => ['approved', 'converted'].includes(e.status))
                    .reduce((sum: number, e: any) => sum + (e.total || 0), 0)
            });

            setRecentEstimates(estimates.slice(0, 5));
        }

        setLoading(false);
    };

    const cardStyle = {
        background: 'white',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    };

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        draft: { bg: '#f1f5f9', text: '#64748b', label: 'Rascunho' },
        sent: { bg: '#dbeafe', text: '#2563eb', label: 'Enviado' },
        approved: { bg: '#dcfce7', text: '#16a34a', label: 'Aprovado' },
        rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejeitado' },
        expired: { bg: '#fef3c7', text: '#d97706', label: 'Expirado' },
        converted: { bg: '#dcfce7', text: '#16a34a', label: 'Convertido' },
    };

    return (
        <div style={{ padding: '0', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: '900',
                    color: '#7c3aed',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    letterSpacing: '0.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ padding: '4px 10px', background: '#f5f3ff', borderRadius: '6px' }}>COMERCIAL</span>
                    <span style={{ opacity: 0.3 }}>›</span>
                    <span>PAINEL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '42px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                        💼 Comercial
                    </h1>
                    <Link
                        href="/dashboard/comercial/estimates/new"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '16px 32px',
                            fontSize: '14px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        📋 Novo Estimate
                    </Link>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '600' }}>
                    Carregando dados...
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                        {/* Prospecting Value */}
                        <div style={{
                            ...cardStyle,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '80px', opacity: 0.1 }}>🔭</div>
                            <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.8, marginBottom: '8px', letterSpacing: '0.05em' }}>
                                EM PROSPECÇÃO (Rascunho + Enviado)
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '950', letterSpacing: '-0.03em' }}>
                                ${stats.prospectingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Closed Value */}
                        <div style={{
                            ...cardStyle,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '80px', opacity: 0.1 }}>💰</div>
                            <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.8, marginBottom: '8px', letterSpacing: '0.05em' }}>
                                FECHADOS (Aprovado + Convertido)
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '950', letterSpacing: '-0.03em' }}>
                                ${stats.closedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* This Month */}
                        <div style={cardStyle}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                ESTE MÊS
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.03em' }}>
                                {stats.thisMonth}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', marginTop: '8px' }}>
                                ${stats.thisMonthValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div style={cardStyle}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.05em' }}>
                                POR STATUS
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#64748b' }}>{stats.draft}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>Rascunho</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>{stats.sent}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>Enviados</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a' }}>{stats.approved}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>Aprovados</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#7c3aed' }}>{stats.converted}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>Convertidos</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                        <Link href="/dashboard/comercial/estimates" style={{
                            ...cardStyle,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}>
                            <div style={{ fontSize: '32px' }}>📋</div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Estimates</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Gerenciar cotações</div>
                            </div>
                        </Link>

                        <div style={{
                            ...cardStyle,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            opacity: 0.6
                        }}>
                            <div style={{ fontSize: '32px' }}>👥</div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Clientes</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Em breve...</div>
                            </div>
                        </div>

                        <div style={{
                            ...cardStyle,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            opacity: 0.6
                        }}>
                            <div style={{ fontSize: '32px' }}>🛒</div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Pedidos</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Em breve...</div>
                            </div>
                        </div>

                        <div style={{
                            ...cardStyle,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            opacity: 0.6
                        }}>
                            <div style={{ fontSize: '32px' }}>💵</div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Comissões</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Em breve...</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Estimates */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                                📋 Últimos Estimates
                            </h2>
                            <Link href="/dashboard/comercial/estimates" style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed', textDecoration: 'none' }}>
                                Ver todos →
                            </Link>
                        </div>

                        {recentEstimates.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                Nenhum estimate ainda. <Link href="/dashboard/comercial/estimates/new" style={{ color: '#7c3aed' }}>Criar o primeiro</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentEstimates.map((est) => (
                                    <Link
                                        key={est.id}
                                        href={`/dashboard/comercial/estimates/${est.id}`}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '16px 20px',
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                background: '#7c3aed15',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                fontWeight: '900',
                                                color: '#7c3aed'
                                            }}>
                                                #{est.estimate_number}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                                                    {est.customer?.name || 'Cliente não definido'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {new Date(est.estimate_date).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                background: statusColors[est.status]?.bg || '#f1f5f9',
                                                color: statusColors[est.status]?.text || '#64748b'
                                            }}>
                                                {statusColors[est.status]?.label || est.status}
                                            </span>
                                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                                                ${(est.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
