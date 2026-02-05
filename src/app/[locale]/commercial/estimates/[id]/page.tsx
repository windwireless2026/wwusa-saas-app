'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useGrades } from '@/hooks/useGrades';
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


const FIXED_ITEM_DESCRIPTION = 'UNLOCKED (AUCTION - NO TEST - NO WARRANTY)';

/** Para itens com cost_price zerado, busca custo médio no inventário (modelo + capacidade + grade). */
async function fillZeroCostFromInventory(
    supabase: ReturnType<typeof useSupabase>,
    rawItems: any[]
): Promise<any[]> {
    const zeroKeys = new Map<string, { model: string; capacity: string; grade: string }>();
    rawItems.forEach((it: any) => {
        const cost = Number(it.cost_price);
        if (cost > 0) return;
        const m = (it.model || '').trim();
        const c = (it.capacity || '').trim();
        const g = (it.grade || '').trim();
        const key = `${m}-${c}-${g}`;
        if (!zeroKeys.has(key)) zeroKeys.set(key, { model: m, capacity: c, grade: g });
    });
    if (zeroKeys.size === 0) return rawItems;

    const { data: inv } = await supabase
        .from('inventory')
        .select('model, capacity, grade, price')
        .not('price', 'is', null)
        .is('deleted_at', null);

    const avgByKey: Record<string, number> = {};
    zeroKeys.forEach((triple, key) => {
        const rows = (inv || []).filter(
            (r: any) =>
                (r.model || '').trim() === triple.model &&
                (r.capacity || '').trim() === triple.capacity &&
                (r.grade || '').trim() === triple.grade
        );
        if (rows.length === 0) return;
        const sum = rows.reduce((s: number, r: any) => s + (Number(r.price) || 0), 0);
        avgByKey[key] = sum / rows.length;
    });

    return rawItems.map((it: any) => {
        const c = Number(it.cost_price);
        if (c > 0) return it;
        const key = `${(it.model || '').trim()}-${(it.capacity || '').trim()}-${(it.grade || '').trim()}`;
        const filled = avgByKey[key];
        if (filled == null) return it;
        return { ...it, cost_price: filled };
    });
}

function aggregateEstimateItems(rawItems: any[]): EstimateItem[] {
    if (!rawItems?.length) return [];
    const byKey: Record<string, { items: any[] }> = {};
    rawItems.forEach((it: any) => {
        const key = `${(it.model || '').trim()}-${(it.capacity || '').trim()}-${(it.grade || '').trim()}`;
        if (!byKey[key]) byKey[key] = { items: [] };
        byKey[key].items.push(it);
    });
    const sortedKeys = Object.keys(byKey).sort((a, b) => {
        const orderA = byKey[a].items[0]?.sort_order ?? 0;
        const orderB = byKey[b].items[0]?.sort_order ?? 0;
        return orderA - orderB;
    });
    return sortedKeys.map(key => {
        const { items: group } = byKey[key];
        const first = group[0];
        const quantity = group.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);
        const costPrice = Number(first.cost_price) ?? 0;
        const unitPrice = Number(first.unit_price) ?? 0;
        const marginPercent = Number(first.margin_percent) ?? (costPrice > 0 ? ((unitPrice - costPrice) / costPrice) * 100 : 0);
        return {
            id: first.id,
            model: first.model ?? '',
            capacity: first.capacity ?? '',
            grade: first.grade ?? '',
            description: FIXED_ITEM_DESCRIPTION,
            quantity,
            unit_price: unitPrice,
            cost_price: costPrice,
            margin_percent: marginPercent,
        };
    });
}

export default function EditEstimatePage() {
    const supabase = useSupabase();
    const { grades } = useGrades();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const locale = (params?.locale as string) || 'pt';
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
    const [freteiroId, setFreteiroId] = useState('');
    const [selectedFreteiro, setSelectedFreteiro] = useState<Agent | null>(null);
    const [deliveryType, setDeliveryType] = useState<'customer' | 'forwarder' | 'pickup' | 'custom'>('custom');

    // Bill To
    const [billToName, setBillToName] = useState('');
    const [billToAddress, setBillToAddress] = useState('');
    const [billToCity, setBillToCity] = useState('');
    const [billToState, setBillToState] = useState('');
    const [billToZip, setBillToZip] = useState('');
    const [billToCountry, setBillToCountry] = useState('USA');

    const [estimateDate, setEstimateDate] = useState('');
    const [dueDate, setDueDate] = useState('');
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
            router.push(`/${locale}/commercial/estimates`);
            return;
        }

        if (data) {
            setEstimateNumber(data.estimate_number);
            setCustomerId(data.customer_id);
            setForwarderId(data.forwarder_id || '');
            setFreteiroId(data.freteiro_id || '');
            setDeliveryType(data.forwarder_id ? 'forwarder' : 'customer');
            setEstimateDate(data.estimate_date || '');
            setDueDate(data.due_date || '');
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

            const rawItems = data.items || [];
            const enriched = await fillZeroCostFromInventory(supabase, rawItems);
            setItems(aggregateEstimateItems(enriched));
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
    const forwarders = allAgents.filter(a => a.roles?.includes('transportadora_cliente'));
    const freteiroList = allAgents.filter(a => a.roles?.includes('freteiro'));
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

    useEffect(() => {
        if (allAgents.length > 0 && freteiroId) {
            setSelectedFreteiro(allAgents.find(a => a.id === freteiroId) || null);
        } else {
            setSelectedFreteiro(null);
        }
    }, [allAgents, freteiroId]);

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

    const handleFreteiroChange = (id: string) => {
        setFreteiroId(id);
        const fr = allAgents.find(f => f.id === id);
        setSelectedFreteiro(fr || null);
    };

    const handleDeliveryTypeChange = (type: 'customer' | 'forwarder' | 'pickup' | 'custom') => {
        setDeliveryType(type);
        if (type !== 'forwarder') {
            setForwarderId('');
            setSelectedForwarder(null);
            setFreteiroId('');
            setSelectedFreteiro(null);
        }
        if (type === 'custom') {
            setShipToName('');
            setShipToAddress('');
            setShipToCity('');
            setShipToState('');
            setShipToZip('');
            setShipToCountry('');
            setShipToPhone('');
        }
    };

    const selectDeliveryBtn = (type: 'customer' | 'forwarder' | 'pickup' | 'custom', label: string, icon: string) => (
        <button
            type="button"
            onClick={() => handleDeliveryTypeChange(type)}
            disabled={status === 'converted'}
            style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: deliveryType === type ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                background: deliveryType === type ? '#f5f3ff' : 'white',
                color: deliveryType === type ? '#7c3aed' : '#64748b',
                fontSize: '12px',
                fontWeight: '700',
                cursor: status === 'converted' ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
            }}
        >
            <span style={{ fontSize: '20px' }}>{icon}</span>
            {label}
        </button>
    );

    const addItem = () => {
        setItems([...items, {
            tempId: crypto.randomUUID(),
            model: '',
            capacity: '128GB',
            grade: 'As-Is',
            description: FIXED_ITEM_DESCRIPTION,
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
                    freteiro_id: freteiroId || null,
                    estimate_date: estimateDate,
                    due_date: dueDate || null,
                    ship_date: shipDate || null,
                    salesperson_id: salespersonId || null,
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
            router.push(`/${locale}/commercial/estimates`);

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
                        <Link href={`/${locale}/commercial`} style={{ padding: '4px 10px', background: '#f5f3ff', borderRadius: '6px', textDecoration: 'none', color: '#7c3aed' }}>COMERCIAL</Link>
                        <span style={{ opacity: 0.3 }}>›</span>
                        <Link href={`/${locale}/commercial/estimates`} style={{ padding: '4px 10px', background: '#f5f3ff', borderRadius: '6px', textDecoration: 'none', color: '#7c3aed' }}>ESTIMATES</Link>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                    {/* Left Column: same as /estimates/new */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                <span style={{ fontSize: '24px' }}>🤝</span>
                                <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Seleção de Parceiros</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>👤 Cliente (Financeiro) *</label>
                                    <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)} style={{ ...inputStyle, height: '48px', cursor: 'pointer', borderColor: customerId ? '#7c3aed' : '#e2e8f0', borderWidth: customerId ? '2px' : '1px' }} required disabled={status === 'converted'}>
                                        <option value="">Selecione o cliente pagador...</option>
                                        {customerList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: deliveryType === 'forwarder' ? '#7c3aed' : '#94a3b8' }}>🚚 Transportadora (Freteiro) {deliveryType === 'forwarder' && '*'}</label>
                                    <select value={forwarderId} onChange={(e) => handleForwarderChange(e.target.value)} disabled={deliveryType !== 'forwarder' || status === 'converted'} style={{ ...inputStyle, height: '48px', cursor: deliveryType === 'forwarder' ? 'pointer' : 'not-allowed', background: deliveryType === 'forwarder' ? 'white' : '#f8fafc', borderColor: deliveryType === 'forwarder' && !forwarderId ? '#ef4444' : (deliveryType === 'forwarder' ? '#7c3aed' : '#e2e8f0'), borderWidth: deliveryType === 'forwarder' ? '2px' : '1px' }} required={deliveryType === 'forwarder'}>
                                        <option value="">{deliveryType === 'forwarder' ? 'Selecione a transportadora...' : 'Selecione "Transportadora" abaixo'}</option>
                                        {forwarderList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {deliveryType === 'forwarder' && (
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ ...labelStyle, color: '#0EA5E9' }}>🚛 Freteiro</label>
                                    <select value={freteiroId} onChange={(e) => handleFreteiroChange(e.target.value)} style={{ ...inputStyle, height: '48px', cursor: 'pointer', borderColor: freteiroId ? '#0EA5E9' : '#e2e8f0', borderWidth: freteiroId ? '2px' : '1px' }} disabled={status === 'converted'}>
                                        <option value="">Selecione o freteiro (opcional)...</option>
                                        {freteiroList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <label style={labelStyle}>📦 Modalidade de Entrega</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {selectDeliveryBtn('customer', 'Endereço Cliente', '👤')}
                                {selectDeliveryBtn('forwarder', 'Transportadora', '🚚')}
                                {selectDeliveryBtn('pickup', 'Retirada (Wind)', '🏬')}
                                {selectDeliveryBtn('custom', 'Personalizado', '✏️')}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ ...cardStyle, marginBottom: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📄 Faturamento (Bill To)</h3>
                                    <span style={{ fontSize: '10px', padding: '4px 8px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', fontWeight: '900' }}>AUTOMÁTICO</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Razão Social / Nome</label>
                                        <textarea value={billToName} onChange={e => setBillToName(e.target.value)} style={{ ...inputStyle, minHeight: '80px', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }} disabled={status === 'converted'} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={labelStyle}>Endereço</label>
                                            <input type="text" value={billToAddress} onChange={e => setBillToAddress(e.target.value)} style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} disabled={status === 'converted'} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Cidade</label>
                                            <input type="text" value={billToCity} onChange={e => setBillToCity(e.target.value)} style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} disabled={status === 'converted'} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>País</label>
                                            <input type="text" value={billToCountry} onChange={e => setBillToCountry(e.target.value)} style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} disabled={status === 'converted'} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ ...cardStyle, marginBottom: 0, border: deliveryType === 'custom' ? '2px solid #7c3aed' : '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📫 Destino (Ship To)</h3>
                                    {deliveryType === 'custom' ? <span style={{ fontSize: '10px', padding: '4px 8px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontWeight: '900' }}>MANUAL</span> : <span style={{ fontSize: '10px', padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '6px', fontWeight: '900' }}>DINÂMICO</span>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Recebedor</label>
                                        <input type="text" value={shipToName} onChange={e => setShipToName(e.target.value)} style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc', fontWeight: '600' }} readOnly={deliveryType !== 'custom'} disabled={status === 'converted'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Endereço Completo</label>
                                        <input type="text" value={shipToAddress} onChange={e => setShipToAddress(e.target.value)} style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }} readOnly={deliveryType !== 'custom'} disabled={status === 'converted'} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div><label style={labelStyle}>Cidade</label><input type="text" value={shipToCity} onChange={e => setShipToCity(e.target.value)} style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }} readOnly={deliveryType !== 'custom'} disabled={status === 'converted'} /></div>
                                        <div><label style={labelStyle}>Estado / UF</label><input type="text" value={shipToState} onChange={e => setShipToState(e.target.value)} style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }} readOnly={deliveryType !== 'custom'} disabled={status === 'converted'} /></div>
                                        <div><label style={labelStyle}>Zip Code</label><input type="text" value={shipToZip} onChange={e => setShipToZip(e.target.value)} style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }} readOnly={deliveryType !== 'custom'} disabled={status === 'converted'} /></div>
                                        <div><label style={labelStyle}>País</label><input type="text" value={shipToCountry} onChange={e => setShipToCountry(e.target.value)} style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }} readOnly={deliveryType !== 'custom'} disabled={status === 'converted'} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: VALOR TOTAL + Detalhes do Documento (same as new) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '40px', borderRadius: '24px', color: 'white', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '100px', opacity: 0.05, pointerEvents: 'none' }}>💵</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', opacity: 0.6, letterSpacing: '0.1em' }}>VALOR TOTAL</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '11px', fontWeight: '900' }}>📦 {items.reduce((sum, i) => sum + i.quantity, 0)} ITENS</span>
                                    <span style={{ padding: '6px 14px', background: payAtDestination ? '#0ea5e9' : '#7c3aed', borderRadius: '100px', fontSize: '11px', fontWeight: '900' }}>{payAtDestination ? '📦 DESTINO' : '🇺🇸 ORIGEM'}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: '950', letterSpacing: '-0.03em', marginBottom: '4px' }}>${(calculateSubtotal() - discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            {discountAmount > 0 && <div style={{ fontSize: '14px', opacity: 0.7, textDecoration: 'line-through' }}>Subtotal: ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>}
                            <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.5 }}>Preços baseados em estoque disponível</div>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '24px' }}>⚙️ Detalhes do Documento</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>📅 Data Documento</label>
                                    <input type="date" value={estimateDate} onChange={e => setEstimateDate(e.target.value)} style={inputStyle} required disabled={status === 'converted'} />
                                </div>
                                <div>
                                    <label style={labelStyle}>⌛ Vencimento</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputStyle, borderColor: '#7c3aed', borderWidth: '1px' }} disabled={status === 'converted'} />
                                </div>
                                <div>
                                    <label style={labelStyle}>🚢 Envio Previsto</label>
                                    <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)} style={inputStyle} disabled={status === 'converted'} />
                                </div>
                                <div>
                                    <label style={labelStyle}>🤵 Vendedor</label>
                                    <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} disabled={status === 'converted'}>
                                        <option value="">Selecione...</option>
                                        {salespersons.map(s => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>💰 Comissão (%)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="number" min="0" step="0.01" value={commissionPercent} onChange={e => setCommissionPercent(Math.max(0, parseFloat(e.target.value) || 0))} style={{ ...inputStyle, width: '90px' }} disabled={status === 'converted'} />
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>= ${calculateCommissionValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={labelStyle}>🌍 Pagamento</label>
                                    <button type="button" onClick={() => setPayAtDestination(!payAtDestination)} disabled={status === 'converted'} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: payAtDestination ? '2px solid #0ea5e9' : '1px solid #7c3aed', background: payAtDestination ? '#f0f9ff' : 'white', cursor: status === 'converted' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '800', fontSize: '13px', color: payAtDestination ? '#0369a1' : '#7c3aed' }}>
                                        {payAtDestination ? '📦 PAGAMENTO NO DESTINO' : '🇺🇸 PAGAMENTO NA ORIGEM'}
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                <div>
                                    <label style={labelStyle}>🏷️ Desconto (Valor Total)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontWeight: '700', color: '#64748b' }}>$</span>
                                        <input type="number" step="0.01" min="0" value={discountAmount} onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} style={inputStyle} disabled={status === 'converted'} />
                                    </div>
                                </div>
                                {discountAmount > 0 && (
                                    <>
                                        <div style={{ padding: '10px 14px', background: '#fff1f2', borderRadius: '10px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <input type="checkbox" id="deductEdit" checked={deductDiscountFromCommission} onChange={e => setDeductDiscountFromCommission(e.target.checked)} disabled={status === 'converted'} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                            <label htmlFor="deductEdit" style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b', cursor: 'pointer' }}>Deseja que os $ {discountAmount.toFixed(2)} de desconto sejam abatidos da comissão?</label>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>▲ Justificativa do Desconto (Interno)</label>
                                            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Motivo do desconto..." style={inputStyle} disabled={status === 'converted'} />
                                        </div>
                                    </>
                                )}
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
                                <th style={{ padding: '12px', textAlign: 'left', minWidth: '280px' }}>DESCRIÇÃO</th>
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
                                        <input type="text" value={item.capacity} onChange={e => updateItem((item.id || item.tempId)!, 'capacity', e.target.value)} style={{ ...inputStyle, padding: '8px' }} disabled={status === 'converted'} placeholder="ex: 64GB" />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="text" list={`grade-list-${item.id || item.tempId}`} value={item.grade} onChange={e => updateItem((item.id || item.tempId)!, 'grade', e.target.value)} style={{ ...inputStyle, padding: '8px' }} disabled={status === 'converted'} />
                                        <datalist id={`grade-list-${item.id || item.tempId}`}>
                                            {grades.map(g => <option key={g.id} value={g.code} />)}
                                        </datalist>
                                    </td>
                                    <td style={{ padding: '8px', minWidth: '280px' }}>
                                        <input type="text" value={item.description} onChange={e => updateItem((item.id || item.tempId)!, 'description', e.target.value)} style={{ ...inputStyle, padding: '8px', minWidth: '260px' }} disabled={status === 'converted'} title={item.description} />
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
