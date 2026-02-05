'use client';

import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';
import { useState, useEffect } from 'react';

export default function PartnersDashboard() {
    const t = useTranslations('Dashboard');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div style={{
            padding: '40px',
            minHeight: '100vh',
            background: '#f8fafc',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <PageHeader
                title="Dashboard de Sócios"
                description="Acompanhamento patrimonial, distribuição de lucros e indicadores financeiros"
                icon="🤝"
                breadcrumbs={[
                    { label: 'SÓCIOS', color: '#7c3aed' },
                    { label: 'DASHBOARD', color: '#7c3aed' },
                ]}
                moduleColor="#7c3aed"
            />

            {/* Financial Summary Indicators */}
            <h2 style={{
                fontSize: '22px',
                fontWeight: '850',
                marginBottom: '28px',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <span style={{
                    width: '8px',
                    height: '24px',
                    background: '#7c3aed',
                    borderRadius: '4px'
                }} />
                Resumo Financeiro
            </h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '40px',
                }}
            >
                <MetricCard
                    title="Capital Esperado"
                    value="US$ 1,939,949"
                    trend="+2.4%"
                    subtitle="Acumulado da operação"
                    icon="🏦"
                    color="#7c3aed"
                    highlight
                />
                <MetricCard
                    title="Faturamento (Dez)"
                    value="US$ 1,473,617"
                    trend="-8%"
                    subtitle="Realizado em Dezembro"
                    icon="📈"
                    color="#3b82f6"
                />
                <MetricCard
                    title="Lucro Bruto"
                    value="US$ 154,292"
                    trend="10.47%"
                    subtitle="Margem sobre o faturamento"
                    icon="💰"
                    color="#10b981"
                />
                <MetricCard
                    title="Despesas Op."
                    value="US$ 69,764"
                    trend="4.43%"
                    subtitle="Representatividade"
                    icon="💸"
                    color="#f43f5e"
                />
            </div>


            {/* Bottom Section: Distribution & Patrimony */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                {/* Profit Distribution */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>💎</span> Distribuição de Lucros (Dez/25)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                        <DistributionRow label="Lupari Consulting" value="US$ 41,470.00" percentage="35.4%" color="#7c3aed" />
                        <DistributionRow label="Victorem Investments" value="US$ 75,786.06" percentage="64.6%" color="#3b82f6" />

                        <div style={{
                            marginTop: 'auto',
                            paddingTop: '20px',
                            borderTop: '2px dashed #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: '700', color: '#64748b' }}>Total Distribuído</span>
                            <span style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>US$ 117,256.06</span>
                        </div>
                    </div>
                </div>

                {/* Patrimony Status */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🏛️</span> Status do Patrimônio
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <PatrimonyItem label="Estoque Físico em Miami" value="US$ 751,992.78" icon="📦" color="#8b5cf6" />
                        <PatrimonyItem label="Vendas a Receber" value="US$ 931,153.10" icon="📝" color="#10b981" />
                        <PatrimonyItem label="Saldo em Bancos (Operacional)" value="US$ 209,678.32" icon="🏦" color="#3b82f6" />
                        <PatrimonyItem label="Empréstimos Ativos" value="US$ 70,000.00" icon="🤝" color="#f59e0b" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, trend, subtitle, icon, color, highlight }: any) {
    return (
        <div style={{
            background: highlight ? `linear-gradient(135deg, ${color} 0%, #4f46e5 100%)` : 'white',
            borderRadius: '24px',
            padding: '28px',
            border: highlight ? 'none' : '1px solid #e2e8f0',
            boxShadow: highlight ? `0 12px 30px ${color}30` : '0 4px 20px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = highlight ? `0 20px 40px ${color}40` : '0 12px 30px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = highlight ? `0 12px 30px ${color}30` : '0 4px 20px rgba(0,0,0,0.02)';
            }}
        >
            <div style={{
                position: 'absolute',
                right: highlight ? '-10px' : '-20px',
                top: highlight ? '-10px' : '-20px',
                fontSize: '100px',
                opacity: highlight ? 0.2 : 0.05,
                transform: 'rotate(-10deg)',
                pointerEvents: 'none'
            }}>
                {icon}
            </div>

            <p style={{
                color: highlight ? 'rgba(255,255,255,0.85)' : '#64748b',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
            }}>
                {title}
            </p>

            <h3 style={{
                fontSize: '34px',
                fontWeight: '950',
                marginBottom: '10px',
                color: highlight ? 'white' : '#0f172a',
                letterSpacing: '-0.03em',
            }}>
                {value}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                    background: highlight ? 'rgba(255,255,255,0.2)' : `${color}20`,
                    color: highlight ? 'white' : color,
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {trend}
                </span>
                <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                }}>
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

function ChartContainer({ title, icon, children, color }: any) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
            position: 'relative'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: `${color}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                    }}>
                        {icon}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '850', margin: 0, color: '#1e293b' }}>
                        {title}
                    </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }} />
                </div>
            </div>

            <div style={{ height: '240px', position: 'relative' }}>
                {children}
            </div>
        </div>
    );
}

function PremiumLineChart() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '4%' }}>
            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {/* Fictitious Line Point */}
                    <div style={{
                        width: '100%',
                        height: `${h}%`,
                        background: 'linear-gradient(to top, #3b82f620 0%, #3b82f6 100%)',
                        borderRadius: '8px 8px 0 0',
                        position: 'relative',
                        transition: 'all 1s ease-out',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '8px',
                            height: '8px',
                            background: 'white',
                            border: '3px solid #3b82f6',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px #3b82f680'
                        }} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'][i]}</span>
                </div>
            ))}
        </div>
    );
}

function PremiumBarChart() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8%' }}>
            {[20, 35, 15, 25, 40, 30].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '100%',
                        height: `${h}%`,
                        background: 'linear-gradient(to top, #f43f5e10 0%, #f43f5e 100%)',
                        borderRadius: '6px',
                        opacity: 0.8,
                        transition: 'all 1s ease-out',
                    }} />
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{['30d', '60d', '90d', '120d', '150d', '180d+'][i]}</span>
                </div>
            ))}
        </div>
    );
}

function DistributionRow({ label, value, percentage, color, highlight }: any) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '4px', height: '32px', background: color || '#e2e8f0', borderRadius: '4px' }} />
                <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', margin: 0 }}>{percentage}</p>
                </div>
            </div>
            <span style={{
                fontSize: highlight ? '18px' : '15px',
                fontWeight: highlight ? '900' : '700',
                color: highlight ? '#0f172a' : '#475569'
            }}>
                {value}
            </span>
        </div>
    );
}

function PatrimonyItem({ label, value, icon, color }: any) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderRadius: '16px',
            background: '#f8fafc',
            border: '1px solid #f1f5f9',
            transition: 'all 0.2s'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = 'translateX(8px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#f1f5f9';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </p>
                <p style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                    {value}
                </p>
            </div>
        </div>
    );
}
