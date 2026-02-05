'use client';

import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';
import { useState, useEffect } from 'react';

export default function PartnersHistoryPage() {
    const t = useTranslations('Dashboard');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const historicalData = [
        { year: '2022', profit: 208470.68, lupari: 104235.34, victorem: 73569.30 },
        { year: '2023', profit: 1168661.52, lupari: 584330.76, victorem: 412420.65 },
        { year: '2024', profit: 1107415.98, lupari: 553707.99, victorem: 553707.99 },
        { year: '2025', profit: 1664785.62, lupari: 832392.81, victorem: 832392.81 },
    ];

    const summaryRows = [
        { label: 'Capital Investido', total: 'US$ 850,000.00', lupari: '-', victorem: 'US$ 600,000.00', type: 'info' },
        { label: 'Lucro DOS', total: 'US$ 266,375.00', lupari: 'US$ 183.77', victorem: 'US$ 187,904.39', type: 'info' },
        { label: 'Lucro Líquido Wind Total', total: 'US$ 4,149,333.80', lupari: 'US$ 2,074,666.90', victorem: 'US$ 1,872,090.75', type: 'highlight' },
        { label: 'Outras Receitas Wind Total', total: 'US$ 210,149.14', lupari: 'US$ 105,074.57', victorem: 'US$ 105,074.57', type: 'info' },
        { label: 'Distribuição de Perdas Wind Total', total: '-US$ 399,978.26', lupari: '-US$ 302,590.63', victorem: '-US$ 82,620.26', type: 'negative' },
        { label: 'LUCRO LÍQUIDO FINAL (AJUSTADO)', total: 'US$ 5,075,879.68', lupari: 'US$ 1,877,334.61', victorem: 'US$ 2,682,449.45', type: 'final' },
        { label: 'Lucros Distribuídos Total', total: '-US$ 3,136,149.17', lupari: '-US$ 1,875,208.70', victorem: '-US$ 744,844.85', type: 'negative' },
        { label: 'Compra de Participação Saga', total: '-US$ 516,095.62', lupari: '-', victorem: '-US$ 516,095.62', type: 'negative' },
    ];

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
                title="Evolução Histórica"
                description="Consolidado de lucros, perdas e retiradas desde 2022"
                icon="📜"
                breadcrumbs={[
                    { label: 'SÓCIOS', color: '#7c3aed' },
                    { label: 'EVOLUÇÃO HISTÓRICA', color: '#7c3aed' },
                ]}
                moduleColor="#7c3aed"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>

                {/* Top Indicators Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '32px',
                    padding: '40px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>Retirada Disponível</h2>
                            <p style={{ color: '#64748b', fontWeight: '600', margin: 0 }}>Total acumulado após ajustes e distribuições</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '42px', fontWeight: '950', color: '#7c3aed', letterSpacing: '-1px' }}>US$ 1,939,730.51</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <PartnerBalanceCard
                            name="Lupari Consulting"
                            balance="US$ 2,125.91"
                            color="#7c3aed"
                            detail="Saldo a ser retirado"
                            icon="🏦"
                        />
                        <PartnerBalanceCard
                            name="Victorem Investments"
                            balance="US$ 1,937,604.60"
                            color="#3b82f6"
                            detail="Saldo a ser retirado"
                            icon="📉"
                        />
                    </div>
                </div>

                {/* Historical Evolution Chart-style Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>📊</span> Lucro Líquido por Ano
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {historicalData.map((data) => (
                                <div key={data.year} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '800', color: '#1e293b' }}>{data.year}</span>
                                        <span style={{ fontWeight: '900', color: '#7c3aed' }}>US$ {data.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(data.profit / 1664785.62) * 100}%`, height: '100%', background: 'linear-gradient(to right, #7c3aed, #a78bfa)', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>🛡️</span> Outras Perdas / Ajustes
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <LossItem label="CNX TRADING AND SERVICE LLC" value="US$ 100,390.00" color="#f43f5e" />
                            <LossItem label="GAV TRADE INC (Lucas)" value="US$ 205,203.00" color="#f43f5e" />
                            <LossItem label="Inadimplência Acumulada" value="US$ 94,385.26" color="#f43f5e" />
                        </div>
                    </div>
                </div>

                {/* Detailed Consolidate Table */}
                <div style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Consolidado Detalhado</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={tableHeaderStyle}>INDICADOR</th>
                                    <th style={tableHeaderStyle}>TOTAL</th>
                                    <th style={tableHeaderStyle}>LUPARI CONSULTING</th>
                                    <th style={tableHeaderStyle}>VICTOREM INVESTMENTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryRows.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: row.type === 'final' ? '#f5f3ff' : 'transparent' }}>
                                        <td style={{ ...tableCellStyle, fontWeight: row.type === 'final' ? '900' : '700', color: row.type === 'negative' ? '#f43f5e' : '#1e293b' }}>
                                            {row.label}
                                        </td>
                                        <td style={{ ...tableCellStyle, fontWeight: '900', color: row.type === 'negative' ? '#f43f5e' : '#0f172a' }}>
                                            {row.total}
                                        </td>
                                        <td style={{ ...tableCellStyle, color: row.type === 'negative' && row.lupari !== '-' ? '#f43f5e' : '#64748b' }}>
                                            {row.lupari}
                                        </td>
                                        <td style={{ ...tableCellStyle, color: row.type === 'negative' && row.victorem !== '-' ? '#f43f5e' : '#64748b' }}>
                                            {row.victorem}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

const tableHeaderStyle = {
    padding: '20px 32px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
};

const tableCellStyle = {
    padding: '20px 32px',
    fontSize: '14px',
};

function PartnerBalanceCard({ name, balance, color, detail, icon }: any) {
    return (
        <div style={{
            background: '#f8fafc',
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid #e2e8f0`,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            transition: 'all 0.2s'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{name}</p>
                <p style={{ fontSize: '24px', fontWeight: '950', color: '#0f172a', margin: '0 0 2px 0' }}>{balance}</p>
                <p style={{ fontSize: '11px', fontWeight: '600', color: color, margin: 0 }}>{detail}</p>
            </div>
        </div>
    );
}

function LossItem({ label, value, color }: any) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>{label}</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '900', color: color }}>({value})</span>
        </div>
    );
}
