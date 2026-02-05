'use client';

import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

export default function FinancialSettingsPage() {
    const modules = [
        {
            title: 'Centros de Custo',
            description: 'Divisões financeiras e departamentos',
            icon: '💼',
            href: '/dashboard/cost-centers',
            color: '#059669',
        },
        {
            title: 'Plano de Contas',
            description: 'Estrutura contábil GAAP-compliant',
            icon: '📋',
            href: '/dashboard/financas/chart-of-accounts',
            color: '#059669',
        },
        {
            title: 'Classes Financeiras',
            description: 'Classificações e categorizações',
            icon: '📂',
            href: '/dashboard/financas/classes',
            color: '#059669',
        },
        {
            title: 'Grupos Financeiros',
            description: 'Grupos e categorias de classificação',
            icon: '📁',
            href: '/dashboard/financas/grupos',
            color: '#059669',
        },
        {
            title: 'Contas Bancárias',
            description: 'Bancos, crypto e contas gerenciais',
            icon: '🏦',
            href: '/dashboard/financas/contas-bancarias',
            color: '#059669',
        },
    ];

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Configurações Financeiras"
                description="Parametrizações e cadastros auxiliares do módulo financeiro"
                icon="⚙️"
                breadcrumbs={[
                    { label: 'FINANCEIRO', href: '/dashboard/financas', color: '#059669' },
                    { label: 'CONFIGURAÇÕES', color: '#059669' },
                ]}
                moduleColor="#059669"
            />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
                marginTop: '40px',
            }}>
                {modules.map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        style={{
                            textDecoration: 'none',
                            background: 'white',
                            borderRadius: '20px',
                            padding: '32px',
                            border: '1px solid #f1f5f9',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            display: 'block',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(5, 150, 105, 0.15)';
                            e.currentTarget.style.borderColor = module.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
                            e.currentTarget.style.borderColor = '#f1f5f9';
                        }}
                    >
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '80px',
                        }}>
                            {module.icon}
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#0f172a',
                            marginBottom: '8px',
                            textAlign: 'center',
                        }}>
                            {module.title}
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            textAlign: 'center',
                            lineHeight: '1.6',
                        }}>
                            {module.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Info Box */}
            <div style={{
                marginTop: '40px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>ℹ️</span>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                        Configurações Financeiras
                    </h4>
                </div>
                <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', margin: 0 }}>
                    Configure os parâmetros essenciais para a gestão financeira da empresa.
                    Mantenha os cadastros atualizados para garantir a precisão dos controles e relatórios.
                </p>
            </div>
        </div>
    );
}
