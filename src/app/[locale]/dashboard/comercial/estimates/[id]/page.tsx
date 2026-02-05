'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/errors';

type Agent = {
    id: string;
    name: string;
    legal_name?: string;
    address_line1?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    country?: string;
    phone?: string;
    roles: string[];
    default_commission_percent?: number;
};

type EstimateItem = {
    id?: string;
    model: string;
    capacity: string;
    grade: string;
    description: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
    margin_percent: number;
    tempId?: string;
};

const GRADES = ['As-Is', 'LEILAO', 'A', 'A-', 'AB', 'B', 'C', 'RMA', 'Open Box', 'LACRADO'];

export default function EditEstimatePage() {
    const supabase = useSupabase();
    const router = useRouter();
    const params = useParams();
    const { id, locale } = params;
    const { alert, confirm, toast } = useUI();

    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [salespersons, setSalespersons] = useState<any[]>([]);
    const [catalogModels, setCatalogModels] = useState<string[]>([]);
    const [availableStock, setAvailableStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [estimateNumber, setEstimateNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Agent | null>(null);
    const [forwarderId, setForwarderId] = useState('');
    const [selectedForwarder, setSelectedForwarder] = useState<Agent | null>(null);
    const [deliveryType, setDeliveryType] = useState<'customer' | 'forwarder' | 'pickup' | 'custom'>('custom');

    // Bill To
    const [billToName, setBillToName] = useState('');
    const [billToAddress, setBillToAddress] = useState('');
    const [billToCity, setBillToCity] = useState('');
    const [billToState, setBillToState] = useState('');
    const [billToZip, setBillToZip] = useState('');
    const [billToCountry, setBillToCountry] = useState('USA');

    const [estimateDate, setEstimateDate] = useState('');
    const [shipDate, setShipDate] = useState('');
    const [salespersonId, setSalespersonId] = useState('');
    const [commissionPercent, setCommissionPercent] = useState(0);
    const [status, setStatus] = useState('');
    const [payAtDestination, setPayAtDestination] = useState(false);

    // Ship To
    const [shipToName, setShipToName] = useState('');
    const [shipToAddress, setShipToAddress] = useState('');
    const [shipToCity, setShipToCity] = useState('');
    const [shipToState, setShipToState] = useState('');
    const [shipToZip, setShipToZip] = useState('');
    const [shipToCountry, setShipToCountry] = useState('');
    const [shipToPhone, setShipToPhone] = useState('');

    // Items
    const [items, setItems] = useState<EstimateItem[]>([]);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [deductDiscountFromCommission, setDeductDiscountFromCommission] = useState(true);

    // Notes
    const [notes, setNotes] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [terms, setTerms] = useState('');
    const [paymentMethods, setPaymentMethods] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([
                fetchAgents(),
                fetchSalespersons(),
                fetchInStockModels(),
                fetchEstimate()
            ]);
            setLoading(false);
        };
        loadInitialData();
    }, [id]);

    const fetchEstimate = async () => {
        const { data, error } = await supabase
            .from('estimates')
            .select('*, items:estimate_items(*)')
            .eq('id', id)
            .single();

        if (error) {
            await alert('Erro', 'Não foi possível carregar o estimate', 'danger');
            router.push('/dashboard/comercial/estimates');
            return;
        }

        if (data) {
            setEstimateNumber(data.estimate_number);
            setCustomerId(data.customer_id);
            setForwarderId(data.forwarder_id || '');
            setEstimateDate(data.estimate_date);
            setShipDate(data.ship_date || '');
            setSalespersonId(data.salesperson_id || '');
            setCommissionPercent(data.commission_percent || 0);
            setStatus(data.status);

            setBillToName(data.bill_to_name || '');
            setBillToAddress(data.bill_to_address || '');
            setBillToCity(data.bill_to_city || '');
            setBillToState(data.bill_to_state || '');
            setBillToZip(data.bill_to_zip || '');
            setBillToCountry(data.bill_to_country || 'USA');

            setShipToName(data.ship_to_name || '');
            setShipToAddress(data.ship_to_address || '');
            setShipToCity(data.ship_to_city || '');
            setShipToState(data.ship_to_state || '');
            setShipToZip(data.ship_to_zip || '');
            setShipToCountry(data.ship_to_country || '');
            setShipToPhone(data.ship_to_phone || '');

            setItems(data.items.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)));
            setDiscountAmount(data.discount_amount || 0);
            setDeductDiscountFromCommission(data.deduct_discount_from_commission ?? true);
            setPayAtDestination(data.pay_at_destination ?? false);
            setNotes(data.notes || '');
            setCustomerNotes(data.customer_notes || '');
            setTerms(data.terms || '');
            setPaymentMethods(data.payment_methods || '');
        }
    };

    const fetchAgents = async () => {
        const { data } = await supabase
            .from('agents')
            .select('id, name, legal_name, address_line1, address_city, address_state, address_zip, country, phone, roles, default_commission_percent')
            .is('deleted_at', null)
            .order('name');
        if (data) setAllAgents(data as Agent[]);
    };

    const fetchSalespersons = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .order('full_name');
        if (data) setSalespersons(data);
    };

    const fetchInStockModels = async () => {
        const { data } = await supabase
            .from('inventory')
            .select('model, capacity, grade, price')
            .eq('status', 'Available')
            .is('deleted_at', null);

        if (data) {
            setAvailableStock(data);
            const combined = data.map((item: any) => `${item.model} ${item.capacity}`);
            const uniqueModels = [...new Set(combined)].sort() as string[];
            setCatalogModels(uniqueModels);
        }
    };

    const customers = allAgents.filter(a => a.roles?.includes('cliente'));
    const forwarders = allAgents.filter(a => a.roles?.includes('frete'));
    const customerList = customers.length > 0 ? customers : allAgents;
    const forwarderList = forwarders.length > 0 ? forwarders : allAgents;

    useEffect(() => {
        if (allAgents.length > 0 && customerId) {
            setSelectedCustomer(allAgents.find(a => a.id === customerId) || null);
        }
    }, [allAgents, customerId]);

    useEffect(() => {
        if (allAgents.length > 0 && forwarderId) {
            setSelectedForwarder(allAgents.find(a => a.id === forwarderId) || null);
        } else {
            setSelectedForwarder(null);
        }
    }, [allAgents, forwarderId]);

    const handleCustomerChange = (id: string) => {
        setCustomerId(id);
        const customer = allAgents.find(c => c.id === id);
        setSelectedCustomer(customer || null);
        if (customer) {
            setCommissionPercent(customer.default_commission_percent || 0);
        }
        // Ao mudar manualmente, recalculamos o Bill To apenas se não for pickup
        if (customer && deliveryType !== 'pickup' && deliveryType !== 'custom') {
            setBillToName(customer.name);
            setBillToAddress(customer.address_line1 || '');
            setBillToCity(customer.address_city || '');
            setBillToState(customer.address_state || '');
            setBillToZip(customer.address_zip || '');
        }
    };

    const handleForwarderChange = (id: string) => {
        setForwarderId(id);
        const fw = allAgents.find(f => f.id === id);
        setSelectedForwarder(fw || null);
        if (fw && selectedCustomer) {
            setBillToName(`${selectedCustomer.name}\n${fw.name}`);
        }
    };

    const addItem = () => {
        setItems([...items, {
            tempId: crypto.randomUUID(),
            model: '',
            capacity: '128GB',
            grade: 'As-Is',
            description: 'AUCTION - NO TEST - NO WARRANTY',
            quantity: 1,
            unit_price: 0,
            cost_price: 0,
            margin_percent: 0
        }]);
    };

    const updateItem = (itemId: string, field: keyof EstimateItem, value: any) => {
        setItems(items.map(item => {
            if (item.id !== itemId && item.tempId !== itemId) return item;

            // Ensure numeric fields are numbers
            let val = value;
            if (['quantity', 'unit_price', 'margin_percent', 'cost_price'].includes(field)) {
                val = parseFloat(value) || 0;
            }

            let updatedItem = { ...item, [field]: val };

            // Logic for Model selection and Auto-Cost
            if (field === 'model') {
                const stockMatch = availableStock.find(s => `${s.model} ${s.capacity}` === value);
                if (stockMatch) {
                    const sameModels = availableStock.filter(s => s.model === stockMatch.model && s.capacity === stockMatch.capacity);
                    const avgCost = sameModels.reduce((acc, curr) => acc + (curr.price || 0), 0) / sameModels.length;

                    updatedItem = {
                        ...updatedItem,
                        model: stockMatch.model,
                        capacity: stockMatch.capacity,
                        cost_price: avgCost,
                        unit_price: Math.round(avgCost * (1 + (item.margin_percent / 100)) * 100) / 100
                    };
                }
            }

            // Logic for Margin calculation
            if (field === 'margin_percent') {
                const margin = parseFloat(value) || 0;
                updatedItem.unit_price = Math.round(item.cost_price * (1 + (margin / 100)) * 100) / 100;
            }

            // Logic for Unit Price calculation (updates margin)
            if (field === 'unit_price') {
                const price = parseFloat(value) || 0;
                if (item.cost_price > 0) {
                    updatedItem.margin_percent = ((price - item.cost_price) / item.cost_price) * 100;
                }
            }

            return updatedItem;
        }));
    };

    const removeItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId && item.tempId !== itemId));
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateProfit = () => {
        return items.reduce((sum, item) => sum + ((item.unit_price - (item.cost_price || 0)) * item.quantity), 0);
    };

    const calculateCommissionValue = () => {
        let baseProfit = calculateProfit();
        if (deductDiscountFromCommission) {
            baseProfit -= discountAmount;
        }
        const commission = (baseProfit * commissionPercent) / 100;
        return Math.max(0, commission);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const subtotal = calculateSubtotal();

            // Update estimate
            const { error: estError } = await supabase
                .from('estimates')
                .update({
                    customer_id: customerId,
                    forwarder_id: forwarderId || null,
                    estimate_date: estimateDate,
                    ship_date: shipDate || null,
                    salesperson_id: salespersonId,
                    commission_percent: commissionPercent,
                    deduct_discount_from_commission: deductDiscountFromCommission,
                    pay_at_destination: payAtDestination,
                    discount_amount: discountAmount,
                    status: status,
                    bill_to_name: billToName,
                    bill_to_address: billToAddress,
                    bill_to_city: billToCity,
                    bill_to_state: billToState,
                    bill_to_zip: billToZip,
                    bill_to_country: billToCountry,
                    ship_to_name: shipToName,
                    ship_to_address: shipToAddress,
                    ship_to_city: shipToCity,
                    ship_to_state: shipToState,
                    ship_to_zip: shipToZip,
                    ship_to_country: shipToCountry,
                    ship_to_phone: shipToPhone,
                    subtotal: subtotal,
                    total: subtotal - discountAmount,
                    notes: notes,
                    customer_notes: customerNotes,
                    terms: terms,
                    payment_methods: paymentMethods
                })
                .eq('id', id);

            if (estError) throw estError;

            // Simple item sync: delete and recreate (more robust for small lists)
            const { error: deleteError } = await supabase
                .from('estimate_items')
                .delete()
                .eq('estimate_id', id);

            if (deleteError) throw deleteError;

            const itemsToInsert = items.map((item, index) => ({
                estimate_id: id,
                model: item.model,
                capacity: item.capacity,
                grade: item.grade,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                cost_price: item.cost_price || 0,
                margin_percent: item.margin_percent || 0,
                sort_order: index
            })).map(({ id, tempId, ...rest }: any) => rest); // remove id/tempId

            const { error: itemsError } = await supabase
                .from('estimate_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            toast.success('Estimate atualizado!');
            router.refresh();

        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const approveAndConvert = async () => {
        const confirmed = await confirm(
            'Confirmar Aprovação',
            'Deseja aprovar este estimate e gerar uma Order (Invoice)? Esta ação criará um novo registro de venda.'
        );

        if (!confirmed) return;

        setSaving(true);
        try {
            // Chamada atômica via RPC (Database Function)
            const { data: newOrderId, error } = await supabase.rpc('convert_estimate_to_order', {
                target_estimate_id: id
            });

            if (error) throw error;

            await alert('Sucesso', 'Estimate aprovado e convertido em Order!', 'success');

            // Redireciona para a nova order (se existir rota de orders, se não volta para a lista)
            router.push('/dashboard/comercial/estimates');

        } catch (error: unknown) {
            toast.error('Erro ao converter: ' + getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    // Estilos reutilizados do NewPage (poderiam estar num componente, mas para prototipar rápido mantemos aqui)
    const cardStyle = { background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' };
    const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800' as const, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
    const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white' };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;

    return (
        <div style={{ padding: '40px', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                        <Link href="/dashboard/comercial" style={{ padding: '4px 10px', background: '#f5f3ff', borderRadius: '6px', textDecoration: 'none', color: '#7c3aed' }}>COMERCIAL</Link>
                        <span style={{ opacity: 0.3 }}>›</span>
                        <Link href="/dashboard/comercial/estimates" style={{ padding: '4px 10px', background: '#f5f3ff', borderRadius: '6px', textDecoration: 'none', color: '#7c3aed' }}>ESTIMATES</Link>
                        <span style={{ opacity: 0.3 }}>›</span>
                        <span>#{estimateNumber}</span>
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                        📋 Edit Estimate
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', fontWeight: '700', border: '2px solid #7c3aed' }}
                        disabled={status === 'converted'}
                    >
                        <option value="draft">DRAFT</option>
                        <option value="sent">SENT</option>
                        <option value="approved">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                        <option value="converted">CONVERTED</option>
                    </select>

                    <button
                        onClick={() => window.open(`/api/estimates/${id}/pdf`, '_blank')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🖨️ Imprimir PDF
                    </button>

                    {status !== 'converted' && (
                        <button
                            onClick={approveAndConvert}
                            disabled={saving}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '900',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {saving ? 'Processando...' : '✅ Aprovar pelo Cliente'}
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Mesma estrutura do formulário de NewPage... */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    <div>
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '24px' }}>🤝 Parceiros</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Cliente (Financial) *</label>
                                    <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)} style={inputStyle} required disabled={status === 'converted'}>
                                        <option value="">Selecione...</option>
                                        {customerList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Transportadora</label>
                                    <select value={forwarderId} onChange={(e) => handleForwarderChange(e.target.value)} style={inputStyle} disabled={status === 'converted'}>
                                        <option value="">Nenhuma</option>
                                        {forwarderList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>📄 Bill To</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <textarea value={billToName} onChange={e => setBillToName(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} placeholder="Nome no Bill To" disabled={status === 'converted'} />
                                <input type="text" value={billToAddress} onChange={e => setBillToAddress(e.target.value)} style={inputStyle} placeholder="Endereço" disabled={status === 'converted'} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <input type="text" value={billToCity} onChange={e => setBillToCity(e.target.value)} style={inputStyle} placeholder="Cidade" disabled={status === 'converted'} />
                                    <input type="text" value={billToState} onChange={e => setBillToState(e.target.value)} style={inputStyle} placeholder="Estado" disabled={status === 'converted'} />
                                    <input type="text" value={billToZip} onChange={e => setBillToZip(e.target.value)} style={inputStyle} placeholder="ZIP" disabled={status === 'converted'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>🚚 Ship To</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <input type="text" value={shipToName} onChange={e => setShipToName(e.target.value)} style={inputStyle} placeholder="Nome Entrega" disabled={status === 'converted'} />
                                <input type="text" value={shipToAddress} onChange={e => setShipToAddress(e.target.value)} style={inputStyle} placeholder="Endereço Entrega" disabled={status === 'converted'} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <input type="text" value={shipToCity} onChange={e => setShipToCity(e.target.value)} style={inputStyle} placeholder="Cidade" disabled={status === 'converted'} />
                                    <input type="text" value={shipToState} onChange={e => setShipToState(e.target.value)} style={inputStyle} placeholder="Estado" disabled={status === 'converted'} />
                                    <input type="text" value={shipToZip} onChange={e => setShipToZip(e.target.value)} style={inputStyle} placeholder="ZIP" disabled={status === 'converted'} />
                                </div>
                            </div>
                        </div>

                        <div style={{ ...cardStyle, background: '#0f172a', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ opacity: 0.7 }}>SUBTOTAL:</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ padding: '4px 10px', background: payAtDestination ? '#0ea5e9' : '#7c3aed', borderRadius: '100px', fontSize: '10px', fontWeight: '950' }}>
                                        {payAtDestination ? '📦 DESTINO' : '🇺🇸 ORIGEM'}
                                    </span>
                                    <span style={{ fontSize: '18px', fontWeight: '700' }}>${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#f87171' }}>
                                    <span style={{ opacity: 0.7 }}>DESCONTO:</span>
                                    <span style={{ fontSize: '18px', fontWeight: '700' }}>-${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                                <span style={{ opacity: 0.7 }}>TOTAL:</span>
                                <span style={{ fontSize: '24px', fontWeight: '900' }}>${(calculateSubtotal() - discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '16px' }}>💰 Comissão</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', color: '#64748b' }}>PERCENTUAL (%)</label>
                                    <input type="number" step="0.01" value={commissionPercent} onChange={e => setCommissionPercent(parseFloat(e.target.value) || 0)} style={inputStyle} disabled={status === 'converted'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', color: '#64748b' }}>VALOR CALCULADO</label>
                                    <div style={{ padding: '10px', background: '#f0fdf4', color: '#166534', fontWeight: '800', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                        ${calculateCommissionValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b' }}>🏷️ DESCONTO ($)</label>
                                <input type="number" step="0.01" value={discountAmount} onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} style={inputStyle} disabled={status === 'converted'} />
                            </div>

                            {discountAmount > 0 && (
                                <div style={{ padding: '12px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <input type="checkbox" id="deductEdit" checked={deductDiscountFromCommission} onChange={e => setDeductDiscountFromCommission(e.target.checked)} disabled={status === 'converted'} />
                                    <label htmlFor="deductEdit" style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b', cursor: 'pointer' }}>
                                        Abater desconto da comissão?
                                    </label>
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px' }}>🌍 LOCAL DE PAGAMENTO</label>
                                <button
                                    type="button"
                                    onClick={() => setPayAtDestination(!payAtDestination)}
                                    disabled={status === 'converted'}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: payAtDestination ? '2px solid #0ea5e9' : '1px solid #7c3aed',
                                        background: payAtDestination ? '#f0f9ff' : 'white',
                                        cursor: status === 'converted' ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s',
                                        fontWeight: '800',
                                        fontSize: '13px',
                                        color: payAtDestination ? '#0369a1' : '#7c3aed'
                                    }}
                                >
                                    {payAtDestination ? '📦 PAGAMENTO NO DESTINO' : '🇺🇸 PAGAMENTO NA ORIGEM'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>📱 Itens</h3>
                        <button type="button" onClick={addItem} style={{ padding: '8px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Add</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', fontSize: '11px', color: '#64748b' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>MODELO</th>
                                <th style={{ padding: '12px', textAlign: 'left', width: '110px' }}>CAPACIDADE</th>
                                <th style={{ padding: '12px', textAlign: 'left', width: '100px' }}>GRADE</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>DESCRIÇÃO</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '70px' }}>QTD</th>
                                <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>CUSTO</th>
                                <th style={{ padding: '12px', textAlign: 'right', width: '90px' }}>MARGEM %</th>
                                <th style={{ padding: '12px', textAlign: 'right', width: '110px' }}>PREÇO</th>
                                <th style={{ padding: '12px', textAlign: 'right', width: '120px' }}>TOTAL</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id || item.tempId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px' }}>
                                        <input
                                            type="text"
                                            list="models-list"
                                            value={item.model}
                                            onChange={e => updateItem((item.id || item.tempId)!, 'model', e.target.value)}
                                            style={{ ...inputStyle, padding: '8px' }}
                                            disabled={status === 'converted'}
                                            placeholder="Digite ou selecione..."
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="text" value={item.capacity} readOnly style={{ ...inputStyle, padding: '8px', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="text" list={`grade-list-${item.id || item.tempId}`} value={item.grade} onChange={e => updateItem((item.id || item.tempId)!, 'grade', e.target.value)} style={{ ...inputStyle, padding: '8px' }} disabled={status === 'converted'} />
                                        <datalist id={`grade-list-${item.id || item.tempId}`}>
                                            {GRADES.map(g => <option key={g} value={g} />)}
                                        </datalist>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="text" value={item.description} onChange={e => updateItem((item.id || item.tempId)!, 'description', e.target.value)} style={{ ...inputStyle, padding: '8px' }} disabled={status === 'converted'} />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem((item.id || item.tempId)!, 'quantity', parseInt(e.target.value))} style={{ ...inputStyle, textAlign: 'center', padding: '8px' }} disabled={status === 'converted'} />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" value={(item.cost_price || 0).toFixed(2)} readOnly style={{ ...inputStyle, textAlign: 'right', background: '#f1f5f9', color: '#64748b', fontSize: '13px', padding: '8px' }} />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" step="0.1" value={(item.margin_percent || 0).toFixed(1)} onChange={e => updateItem((item.id || item.tempId)!, 'margin_percent', e.target.value)} style={{ ...inputStyle, textAlign: 'right', fontWeight: '700', color: '#7c3aed', padding: '8px' }} disabled={status === 'converted'} />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" step="0.01" value={(item.unit_price || 0).toFixed(2)} onChange={e => updateItem((item.id || item.tempId)!, 'unit_price', e.target.value)} style={{ ...inputStyle, textAlign: 'right', fontWeight: '800', padding: '8px' }} disabled={status === 'converted'} />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>${(item.quantity * item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {status !== 'converted' && (
                                            <button type="button" onClick={() => removeItem((item.id || item.tempId)!)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingBottom: '60px' }}>
                    <button
                        type="submit"
                        disabled={saving || status === 'converted'}
                        style={{
                            padding: '16px 40px',
                            background: status === 'converted' ? '#94a3b8' : '#7c3aed',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '800',
                            cursor: status === 'converted' ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {saving ? 'Salvando...' : (status === 'converted' ? '✓ Estimate Concluído' : '✓ Salvar Alterações')}
                    </button>
                </div>
                <datalist id="models-list">
                    {catalogModels.map((model, idx) => (
                        <option key={idx} value={model} />
                    ))}
                </datalist>
            </form>
        </div>
    );
}
