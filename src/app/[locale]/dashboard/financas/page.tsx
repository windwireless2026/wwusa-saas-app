'use client';

import { useRouter } from 'next/navigation';

export default function FinancasModulePage() {
    const router = useRouter();

    const modulos = [
        {
            title: 'Contas a Pagar',
            description: 'Gerenciar invoices e pagamentos',
            icon: '💰',
            href: '/dashboard/invoices',
            color: { bg: '#dbeafe', text: '#1e40af' },
        },
        {
            title: 'Lançamentos',
            description: 'Registrar receitas e despesas',
            icon: '💸',
            href: '/dashboard/financas/lancamentos',
            color: { bg: '#d1fae5', text: '#065f46' },
            status: 'Em breve'
        },
        {
            title: 'Relatório DRE',
            description: 'Demonstrativo de Resultados',
            icon: '📊',
            href: '/dashboard/financas/relatorio-dre',
            color: { bg: '#dbeafe', text: '#1e40af' },
            status: 'Em breve'
        },
        {
            title: 'Balanço Patrimonial',
            description: 'Balance Sheet - GAAP',
            icon: '⚖️',
            href: '/dashboard/financas/balanco',
            color: { bg: '#fef3c7', text: '#92400e' },
            status: 'Em breve'
        },
        {
            title: 'Fluxo de Caixa',
            description: 'Cash Flow Statement',
            icon: '💵',
            href: '/dashboard/financas/fluxo-caixa',
            color: { bg: '#fee2e2', text: '#991b1b' },
            status: 'Em breve'
        },
        {
            title: 'Dashboard Financeiro',
            description: 'Visão geral e métricas',
            icon: '📈',
            href: '/dashboard/financas/dashboard',
            color: { bg: '#f3e8ff', text: '#6b21a8' },
            status: 'Em breve'
        },
        {
            title: 'Conciliação Bancária',
            description: 'Reconciliação de contas',
            icon: '🏦',
            href: '/dashboard/financas/conciliacao',
            color: { bg: '#dbeafe', text: '#1e40af' },
            status: 'Em breve'
        },
    ];

    const cadastros = [
        {
            title: 'Cadastros Financeiros',
            description: 'Configurar Chart of Accounts, Grupos, Classes, DRE',
            icon: '⚙️',
            href: '/dashboard/registration',
            color: { bg: '#f1f5f9', text: '#475569' }
        },
    ];

    const handleClick = (href: string, status?: string) => {
        if (status === 'Em breve') {
            // Futuramente podemos mostrar um toast/modal
            return;
        }
        router.push(href);
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#1e293b' }}>
                    💰 Módulo Financeiro
                </h1>
                <p style={{ color: '#64748b', marginTop: '12px', fontSize: '16px' }}>
                    Gestão financeira GAAP-compliant - Wind Wireless LLC
                </p>
            </div>

            {/* Módulos Operacionais */}
            <div style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>📊</span>
                    Módulos Operacionais
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                }}>
                    {modulos.map((item) => (
                        <div
                            key={item.href}
                            onClick={() => handleClick(item.href, item.status)}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '32px',
                                cursor: item.status === 'Em breve' ? 'not-allowed' : 'pointer',
                                border: '2px solid #e2e8f0',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                opacity: item.status === 'Em breve' ? 0.6 : 1,
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                                if (item.status !== 'Em breve') {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.borderColor = item.color.text;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (item.status !== 'Em breve') {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }
                            }}
                        >
                            {item.status === 'Em breve' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}>
                                    Em breve
                                </div>
                            )}

                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px',
                                background: item.color.bg,
                                width: '80px',
                                height: '80px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                                {item.title}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Link para Cadastros */}
            <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>⚙️</span>
                    Configurações
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                }}>
                    {cadastros.map((item) => (
                        <div
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '32px',
                                cursor: 'pointer',
                                border: '2px solid #e2e8f0',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = item.color.text;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px',
                                background: item.color.bg,
                                width: '80px',
                                height: '80px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                                {item.title}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
