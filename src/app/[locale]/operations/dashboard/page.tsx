'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import PageHeader from '@/components/ui/PageHeader';

type InventoryItem = {
    id: string;
    model: string;
    price: number;
    status: string;
    location_id: string | null;
    location?: {
        name: string;
        include_in_avg_cost: boolean;
        include_in_inventory_valuation: boolean;
        is_wind_stock: boolean;
    };
    created_at: string;
};

export default function OperationsDashboardPage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'pt';
    const supabase = useSupabase();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [reservedItems, setReservedItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const { data: reservedData, error: reservedError } = await supabase
                .from('estimate_items')
                .select('quantity, model, estimates!inner(status)')
                .eq('estimates.status', 'converted');

            if (reservedError) console.error('Error fetching reserved items:', reservedError);
            else setReservedItems(reservedData || []);

            const { data: locationData } = await supabase
                .from('stock_locations')
                .select('id, name, is_wind_stock')
                .is('deleted_at', null)
                .order('name');

            if (locationData) {
                setLocations(locationData);
                // Mostrar todos os locais por padrão para contagem correta do estoque total
            }

            const { data: inventoryDataPlus, error: invError } = await supabase
                .from('inventory')
                .select('id, model, price, status, created_at, location_id, location:stock_locations(name, include_in_avg_cost, include_in_inventory_valuation, is_wind_stock)')
                .is('deleted_at', null);

            if (invError) console.error('Inventory error:', invError);
            else setItems(inventoryDataPlus as any || []);

            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    const stats = useMemo(() => {
        const filteredPhysical = selectedLocation === 'all'
            ? items
            : items.filter(i => i.location_id === selectedLocation);

        const physicalAvailableForStats = filteredPhysical.filter(i =>
            i.status === 'Available' &&
            (selectedLocation !== 'all' || (i.location?.include_in_inventory_valuation ?? true))
        );

        const physicalAvailableAll = filteredPhysical.filter(i => i.status === 'Available');
        const physicalSold = filteredPhysical.filter(i => i.status === 'Sold').length;
        // Itens com status Reserved no inventário (ex.: B2B) devem entrar no card RESERVADO
        const physicalReservedCount = filteredPhysical.filter(i => i.status === 'Reserved').length;

        const totalValue = physicalAvailableForStats.reduce((sum, i) => sum + (i.price || 0), 0);
        const totalPhysicalUnits = physicalAvailableForStats.length;

        const reservedFromEstimates = reservedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const reservedUnits = physicalReservedCount + reservedFromEstimates;
        const netAvailable = Math.max(0, totalPhysicalUnits - reservedFromEstimates);

        const byModelData = physicalAvailableAll.reduce((acc, item) => {
            if (!acc[item.model]) {
                acc[item.model] = { qty: 0, totalPrice: 0, avgPriceQty: 0, avgPriceTotal: 0, statsQty: 0 };
            }
            acc[item.model].qty += 1;
            acc[item.model].totalPrice += item.price || 0;

            if (selectedLocation !== 'all' || (item.location?.include_in_inventory_valuation ?? true)) {
                acc[item.model].statsQty += 1;
            }

            if (selectedLocation !== 'all' || (item.location?.include_in_avg_cost ?? true)) {
                acc[item.model].avgPriceQty += 1;
                acc[item.model].avgPriceTotal += item.price || 0;
            }
            return acc;
        }, {} as Record<string, { qty: number; totalPrice: number; avgPriceQty: number; avgPriceTotal: number; statsQty: number }>);

        const reservedByModel = reservedItems.reduce((acc, item) => {
            acc[item.model] = (acc[item.model] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        const byModel = Object.entries(byModelData)
            .map(([model, data]) => ({
                model,
                qty: data.qty,
                statsQty: data.statsQty,
                reserved: reservedByModel[model] || 0,
                available: Math.max(0, data.statsQty - (reservedByModel[model] || 0)),
                totalPrice: data.totalPrice,
                avgPrice: data.avgPriceQty > 0 ? data.avgPriceTotal / data.avgPriceQty : (data.qty > 0 ? data.totalPrice / data.qty : 0)
            }))
            .sort((a, b) => b.statsQty - a.statsQty);

        return {
            totalValue,
            totalUnits: totalPhysicalUnits,
            netAvailable,
            reservedUnits,
            soldUnits: physicalSold,
            modelCount: Object.keys(byModelData).length,
            byModel
        };
    }, [items, reservedItems, selectedLocation]);

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
        <div style={{ padding: '40px', minHeight: '100vh' }}>
            <PageHeader
                title="Dashboard Operacional"
                description="Inteligência de estoque: quantidade, reservas e valor"
                icon="📊"
                breadcrumbs={[
                    { label: 'OPERAÇÕES', href: `/${locale}/operations`, color: '#7c3aed' },
                    { label: 'DASHBOARD OPERACIONAL', color: '#7c3aed' },
                ]}
                moduleColor="#7c3aed"
                actions={
                    <div style={{ position: 'relative' }}>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                color: '#0f172a',
                                fontWeight: '700',
                                fontSize: '13px',
                                appearance: 'none',
                                cursor: 'pointer',
                                minWidth: '220px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                outline: 'none'
                            }}
                        >
                            <option value="all">📍 Todos os Locais</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>📍 {loc.name}</option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.4, fontSize: '10px' }}>▼</div>
                    </div>
                }
            />

            {loading ? (
                <div style={{ color: '#94a3b8', fontWeight: '600', textAlign: 'center', padding: '100px' }}>Carregando dados operacionais...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>

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

                        <div style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '100px', opacity: 0.05, color: '#0f172a' }}>📱</div>
                            <div style={statLabelStyle}>VARIEDADE</div>
                            <div style={statValueStyle}>{stats.modelCount}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', fontWeight: '600' }}>Modelos únicos ativos no catálogo</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                        <div style={{ ...cardStyle, padding: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                                    <div style={{ width: '32px', height: '32px', background: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📱</div>
                                    Estoque por Modelo (Unidades / Peças)
                                </h2>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>ORDENADO POR QUANTIDADE</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
                                {stats.byModel.map((item) => {
                                    const percentage = stats.totalUnits > 0 ? (item.statsQty / stats.totalUnits) * 100 : 0;
                                    return (
                                        <div key={item.model} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{item.model}</span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '4px' }}>
                                                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{item.statsQty}</span>
                                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>UN</span>
                                                    </div>
                                                    {item.qty !== item.statsQty && (
                                                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>({item.qty} total)</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
                                                <div style={{ width: `${(item.available / Math.max(1, item.statsQty)) * 100}%`, background: '#10b981', height: '100%' }} />
                                                <div style={{ width: `${(Math.min(item.statsQty, item.reserved) / Math.max(1, item.statsQty)) * 100}%`, background: '#f59e0b', height: '100%' }} />
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
            )}
        </div>
    );
}
