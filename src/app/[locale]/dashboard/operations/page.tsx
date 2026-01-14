'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';

type InventoryItem = {
    id: string;
    model: string;
    price: number;
    status: string;
    created_at: string;
};

export default function OperationsDashboard() {
    const supabase = useSupabase();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [reservedItems, setReservedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch Inventory (Physical Stock)
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('id, model, price, status, created_at')
                .is('deleted_at', null);

            if (inventoryError) console.error('Error fetching inventory:', inventoryError);
            else setItems(inventoryData || []);

            // 2. Fetch "Reserved" items (From Converted Estimates)
            const { data: reservedData, error: reservedError } = await supabase
                .from('estimate_items')
                .select('quantity, model, estimates!inner(status)')
                .eq('estimates.status', 'converted');

            if (reservedError) console.error('Error fetching reserved items:', reservedError);
            else setReservedItems(reservedData || []);

            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    const stats = useMemo(() => {
        // Physical Inventory
        const physicalAvailable = items.filter(i => i.status === 'Available');
        const physicalSold = items.filter(i => i.status === 'Sold').length;

        const totalValue = physicalAvailable.reduce((sum, i) => sum + (i.price || 0), 0);
        const totalPhysicalUnits = physicalAvailable.length;

        // Demand (Reserved)
        const reservedUnits = reservedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

        // Net Available (Physical - Reserved)
        const netAvailable = Math.max(0, totalPhysicalUnits - reservedUnits);

        // Group by model for the breakdown
        const byModelData = physicalAvailable.reduce((acc, item) => {
            if (!acc[item.model]) {
                acc[item.model] = { qty: 0, totalPrice: 0 };
            }
            acc[item.model].qty += 1;
            acc[item.model].totalPrice += item.price || 0;
            return acc;
        }, {} as Record<string, { qty: number; totalPrice: number }>);

        // Reserved per Model map
        const reservedByModel = reservedItems.reduce((acc, item) => {
            acc[item.model] = (acc[item.model] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        const byModel = Object.entries(byModelData)
            .map(([model, data]) => ({
                model,
                qty: data.qty,
                reserved: reservedByModel[model] || 0,
                available: Math.max(0, data.qty - (reservedByModel[model] || 0)),
                totalPrice: data.totalPrice,
                avgPrice: data.qty > 0 ? data.totalPrice / data.qty : 0
            }))
            .sort((a, b) => b.qty - a.qty);

        return {
            totalValue,
            totalUnits: totalPhysicalUnits, // This is PHYSICAL available
            netAvailable, // This is Adjusted Available
            reservedUnits,
            soldUnits: physicalSold,
            modelCount: Object.keys(byModelData).length,
            byModel
        };
    }, [items, reservedItems]);

    const cardStyle = {
        background: 'white',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    };

    const statLabelStyle = {
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: '800',
        marginBottom: '8px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
    };

    const statValueStyle = {
        fontSize: '36px',
        fontWeight: '950',
        color: '#0f172a',
        letterSpacing: '-0.05em',
    };

    return (
        <div style={{ padding: '32px', minHeight: '100vh' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
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
                        <span style={{ padding: '4px 10px', background: '#f5f3ff', borderRadius: '6px' }}>OPERAÇÕES</span>
                        <span style={{ opacity: 0.3 }}>›</span>
                        <span>INTELIGÊNCIA DE ESTOQUE</span>
                    </div>
                    <h1 style={{ fontSize: '42px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                        Painel Operacional
                    </h1>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', background: '#f8fafc', padding: '8px 16px', borderRadius: '10px' }}>
                    {/* Hydration safe update time */}
                    Atualizado hoje
                </div>
            </div>

            {loading ? (
                <div style={{ color: '#94a3b8', fontWeight: '600', textAlign: 'center', padding: '100px' }}>Carregando dados operacionais...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>

                        {/* Total Value Card */}
                        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '120px', opacity: 0.1 }}>📦</div>
                            <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.8, marginBottom: '8px', letterSpacing: '0.05em' }}>VALOR TOTAL EM ESTOQUE</div>
                            <div style={{ fontSize: '42px', fontWeight: '950', letterSpacing: '-0.04em' }}>
                                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px' }}>{stats.totalUnits} Peças Disponíveis</span>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div style={cardStyle}>
                            <div style={statLabelStyle}>STATUS DO ESTOQUE</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981', marginBottom: '4px' }}>{stats.netAvailable}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>DISPONÍVEL</div>
                                </div>
                                <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b', marginBottom: '4px' }}>{stats.reservedUnits}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', background: '#fffbeb', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>RESERVADO</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#64748b', marginBottom: '4px' }}>{stats.soldUnits}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>VENDIDO</div>
                                </div>
                            </div>
                        </div>

                        {/* Variety */}
                        <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '100px', opacity: 0.05, color: '#0f172a' }}>📱</div>
                            <div style={statLabelStyle}>VARIEDADE</div>
                            <div style={statValueStyle}>{stats.modelCount}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', fontWeight: '600' }}>Modelos únicos ativos no catálogo</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                        <div style={{ ...cardStyle, padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                                    <div style={{ width: '32px', height: '32px', background: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📱</div>
                                    Estoque por Modelo (Unidades / Peças)
                                </h2>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>ORDENADO POR QUANTIDADE</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
                                {stats.byModel.map((item) => {
                                    const percentage = (item.qty / stats.totalUnits) * 100;
                                    return (
                                        <div key={item.model} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{item.model}</span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '4px' }}>
                                                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{item.qty}</span>
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>UN</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Availability Split Bar */}
                                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
                                                <div style={{ width: `${(item.available / item.qty) * 100}%`, background: '#10b981', height: '100%' }} />
                                                <div style={{ width: `${(item.reserved / item.qty) * 100}%`, background: '#f59e0b', height: '100%' }} />
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>
                                                    ● {item.available} Disp.
                                                </span>
                                                {item.reserved > 0 && (
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#d97706', background: '#fffbeb', padding: '4px 8px', borderRadius: '6px' }}>
                                                        ● {item.reserved} Res.
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '11px', background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                                                <div>
                                                    <div style={{ color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Preço Médio</div>
                                                    <div style={{ color: '#10b981', fontWeight: '800' }}>${item.avgPrice.toFixed(2)}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Valor Total</div>
                                                    <div style={{ color: '#0f172a', fontWeight: '800' }}>${item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                </div>
                                            </div>

                                            {/* Share of Total Stock Bar */}
                                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        width: `${percentage}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
                                                        borderRadius: '10px',
                                                        transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textAlign: 'right' }}>
                                                {percentage.toFixed(1)}% do estoque total
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </div >
    );
}
