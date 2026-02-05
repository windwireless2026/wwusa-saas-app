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
    id: string;
    model: string;
    capacity: string;
    grade: string;
    description: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
    margin_percent: number;
};

export default function NewEstimatePage() {
    const supabase = useSupabase();
    const { grades } = useGrades();
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'pt';
    const { alert, toast } = useUI();

    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [salespersons, setSalespersons] = useState<any[]>([]);
    const [catalogModels, setCatalogModels] = useState<string[]>([]);
    const [availableStock, setAvailableStock] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [customerId, setCustomerId] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Agent | null>(null);
    const [forwarderId, setForwarderId] = useState('');
    const [selectedForwarder, setSelectedForwarder] = useState<Agent | null>(null);
    const [freteiroId, setFreteiroId] = useState('');
    const [selectedFreteiro, setSelectedFreteiro] = useState<Agent | null>(null);
    const [deliveryType, setDeliveryType] = useState<'customer' | 'forwarder' | 'pickup' | 'custom'>('customer');

    // Bill To (Nome e Endereço que sai na NF)
    const [billToName, setBillToName] = useState('');
    const [billToAddress, setBillToAddress] = useState('');
    const [billToCity, setBillToCity] = useState('');
    const [billToState, setBillToState] = useState('');
    const [billToZip, setBillToZip] = useState('');
    const [billToCountry, setBillToCountry] = useState('USA');

    const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [shipDate, setShipDate] = useState('');
    const [salespersonId, setSalespersonId] = useState('');
    const [commissionPercent, setCommissionPercent] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountJustification, setDiscountJustification] = useState('');

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
    const [deductDiscountFromCommission, setDeductDiscountFromCommission] = useState(true);

    // Notes
    const [notes, setNotes] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [terms, setTerms] = useState('');
    const [paymentMethods, setPaymentMethods] = useState('');

    // Modality
    const [payAtDestination, setPayAtDestination] = useState(false);

    useEffect(() => {
        fetchAgents();
        fetchSalespersons();
        fetchInStockModels();
        fetchBankAccounts();
        fetchCommercialSettings();
    }, []);

    const fetchCommercialSettings = async () => {
        const { data } = await supabase
            .from('company_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            setCompanyInfo(data);
            if (data.estimate_notes_template) setNotes(data.estimate_notes_template);
            if (data.estimate_terms_template) setTerms(data.estimate_terms_template);
            if (data.estimate_payment_methods_template) setPaymentMethods(data.estimate_payment_methods_template);
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
        // Buscamos apenas o que tem em estoque disponível
        const { data } = await supabase
            .from('inventory')
            .select('model, capacity, grade, price')
            .eq('status', 'Available')
            .is('deleted_at', null);

        if (data) {
            setAvailableStock(data);
            // Combinar Modelo + Capacidade para facilitar a seleção
            const combined = data.map((item: any) => `${item.model} ${item.capacity}`);
            const uniqueModels = [...new Set(combined)].sort() as string[];
            setCatalogModels(uniqueModels);
        }
    };

    const fetchBankAccounts = async () => {
        const { data } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('is_active', true)
            .eq('is_receiving_account', true)
            .is('deleted_at', null)
            .order('name');
        if (data) setBankAccounts(data);
    };

    // Filtered lists for the dropdowns
    const customers = allAgents.filter(a => a.roles?.includes('cliente'));
    const forwarderList = allAgents.filter(a => a.roles?.includes('transportadora_cliente'));
    const freteiroList = allAgents.filter(a => a.roles?.includes('freteiro'));

    // Fallback if no specific role is found (helps debugging if user forgot to check correct roles)
    const customerList = customers.length > 0 ? customers : allAgents;

    // Auto-update Bill To and Ship To logic
    useEffect(() => {
        if (!selectedCustomer) return;

        // --- Bill To Selection Logic (Automatic) ---
        let finalBillName = selectedCustomer.name;
        const isForwarderMode = deliveryType === 'forwarder' && selectedForwarder;

        if (isForwarderMode) {
            finalBillName = `${selectedCustomer.name}\nC/O ${selectedForwarder.name}`;
        }
        setBillToName(finalBillName);

        // Address for Bill To: follow the delivery type rule
        let sourceForBill = selectedCustomer;
        if (isForwarderMode) {
            sourceForBill = selectedForwarder;
        } else if (deliveryType === 'pickup' && companyInfo) {
            sourceForBill = {
                ...selectedCustomer,
                address_line1: companyInfo.address_line1,
                address_city: companyInfo.city,
                address_state: companyInfo.state,
                address_zip: companyInfo.zip_code,
                country: companyInfo.country
            };
        }

        setBillToAddress(sourceForBill.address_line1 || '');
        setBillToCity(sourceForBill.address_city || '');
        setBillToState(sourceForBill.address_state || '');
        setBillToZip(sourceForBill.address_zip || '');
        setBillToCountry(sourceForBill.country || 'USA');

        // --- Ship To Selection Logic ---
        if (deliveryType === 'customer' && selectedCustomer) {
            setShipToName(selectedCustomer.name);
            setShipToAddress(selectedCustomer.address_line1 || '');
            setShipToCity(selectedCustomer.address_city || '');
            setShipToState(selectedCustomer.address_state || '');
            setShipToZip(selectedCustomer.address_zip || '');
            setShipToCountry(selectedCustomer.country || '');
            setShipToPhone(selectedCustomer.phone || '');
        } else if (deliveryType === 'forwarder' && (selectedFreteiro || selectedForwarder)) {
            const shipSource = (selectedFreteiro || selectedForwarder) as Agent;
            setShipToName(shipSource.name);
            setShipToAddress(shipSource.address_line1 || '');
            setShipToCity(shipSource.address_city || '');
            setShipToState(shipSource.address_state || '');
            setShipToZip(shipSource.address_zip || '');
            setShipToCountry(shipSource.country || '');
            setShipToPhone(shipSource.phone || '');
        } else if (deliveryType === 'pickup') {
            setShipToName(`PICKUP AT ${companyInfo?.trade_name || companyInfo?.legal_name || 'MIAMI OFFICE'}`);
            setShipToAddress(companyInfo?.address_line1 || '175 SW 7th St Ste 1602');
            setShipToCity(companyInfo?.city || 'Miami');
            setShipToState(companyInfo?.state || 'FL');
            setShipToZip(companyInfo?.zip_code || '33130');
            setShipToCountry(companyInfo?.country || 'USA');
            setShipToPhone(companyInfo?.phone || '');
        }
    }, [selectedCustomer, selectedForwarder, selectedFreteiro, deliveryType, companyInfo]);

    const handleCustomerChange = (id: string) => {
        setCustomerId(id);
        const customer = allAgents.find(c => c.id === id);
        setSelectedCustomer(customer || null);
        if (customer) {
            setCommissionPercent(customer.default_commission_percent || 0);
        }
    };

    const handleForwarderChange = (id: string) => {
        setForwarderId(id);
        const fw = allAgents.find(f => f.id === id);
        setSelectedForwarder(fw || null);
    };

    const handleFreteiroChange = (id: string) => {
        setFreteiroId(id);
        const fr = allAgents.find(f => f.id === id);
        setSelectedFreteiro(fr || null);
    };

    const handleDeliveryTypeChange = (type: typeof deliveryType) => {
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

    const addItem = () => {
        setItems([...items, {
            id: crypto.randomUUID(),
            model: '',
            capacity: '',
            grade: 'As-Is',
            description: 'AUCTION - NO TEST - NO WARRANTY',
            quantity: 1,
            unit_price: 0,
            cost_price: 0,
            margin_percent: 0
        }]);
    };

    const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
        setItems(items.map(item => {
            if (item.id !== id) return item;

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

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - discountAmount;
    };

    const calculateProfit = () => {
        return items.reduce((sum, item) => sum + ((item.unit_price - item.cost_price) * item.quantity), 0);
    };

    const calculateCommissionValue = () => {
        let baseProfit = calculateProfit();
        if (deductDiscountFromCommission) {
            baseProfit -= discountAmount;
        }
        const commission = (baseProfit * commissionPercent) / 100;
        return Math.max(0, commission); // Nunca negativa
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) {
            await alert('Erro', 'Selecione um cliente', 'danger');
            return;
        }
        if (deliveryType === 'forwarder' && !forwarderId) {
            toast.error('Selecione a transportadora');
            return;
        }
        if (!shipToAddress || !shipToCity) {
            await alert('Erro', 'Preencha os dados de entrega (Ship To)', 'danger');
            return;
        }
        if (items.length === 0) {
            toast.error('Adicione pelo menos um item');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const subtotal = calculateSubtotal();

            // Create estimate
            const { data: estimate, error: estError } = await supabase
                .from('estimates')
                .insert({
                    customer_id: customerId,
                    forwarder_id: forwarderId || null,
                    freteiro_id: freteiroId || null,
                    estimate_date: estimateDate,
                    due_date: dueDate || null,
                    ship_date: shipDate || null,
                    salesperson_id: salespersonId || user?.id,
                    commission_percent: commissionPercent,
                    deduct_discount_from_commission: deductDiscountFromCommission,
                    pay_at_destination: payAtDestination,
                    discount_amount: discountAmount,
                    notes: discountJustification, // Using internal notes for justification

                    // Bill To
                    bill_to_name: billToName,
                    bill_to_address: billToAddress,
                    bill_to_city: billToCity,
                    bill_to_state: billToState,
                    bill_to_zip: billToZip,
                    bill_to_country: billToCountry,

                    // Ship To
                    ship_to_name: shipToName,
                    ship_to_address: shipToAddress,
                    ship_to_city: shipToCity,
                    ship_to_state: shipToState,
                    ship_to_zip: shipToZip,
                    ship_to_country: shipToCountry,
                    ship_to_phone: shipToPhone,

                    subtotal: subtotal,
                    total: subtotal - discountAmount,
                    customer_notes: customerNotes,
                    payment_methods: bankAccounts
                        .filter(b => selectedBankIds.includes(b.id))
                        .map(b => `${b.name}: ${b.full_account_number || b.account_number || b.wallet_address || ''} (${b.currency})`)
                        .join('\n'),
                    status: 'draft',
                    created_by: user?.id
                })
                .select()
                .single();

            if (estError) throw estError;

            // Create items
            const itemsToInsert = items.map((item, index) => ({
                estimate_id: estimate.id,
                model: item.model,
                capacity: item.capacity,
                grade: item.grade,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                cost_price: item.cost_price,
                margin_percent: item.margin_percent,
                sort_order: index
            }));

            const { error: itemsError } = await supabase
                .from('estimate_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            await alert('Sucesso', `Estimate #${estimate.estimate_number} criado com sucesso!`, 'success');
            router.push(`/${locale}/commercial/estimates/${estimate.id}`);

        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: 'white',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        marginBottom: '24px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '800' as const,
        color: '#94a3b8',
        marginBottom: '8px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em'
    };

    const tableHeaderStyle = {
        fontSize: '11px',
        fontWeight: '800' as const,
        color: '#94a3b8',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '12px',
        borderBottom: '2px solid #f1f5f9'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        background: 'white',
        transition: 'all 0.2s'
    };

    const selectDeliveryBtn = (type: typeof deliveryType, label: string, icon: string) => (
        <button
            type="button"
            onClick={() => handleDeliveryTypeChange(type)}
            style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: deliveryType === type ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                background: deliveryType === type ? '#f5f3ff' : 'white',
                color: deliveryType === type ? '#7c3aed' : '#64748b',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
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

    return (
        <div style={{ padding: '40px', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
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
                    <Link href={`/${locale}/commercial/estimates`} style={{ textDecoration: 'none', color: '#7c3aed' }}>ESTIMATES</Link>
                    <span style={{ opacity: 0.3 }}>›</span>
                    <span>NOVO</span>
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.04em', margin: 0 }}>
                    ✨ Novo Estimate
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>

                    {/* Left Column: Logistics & Billing */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Partners and Delivery Type */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                <span style={{ fontSize: '24px' }}>🤝</span>
                                <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                                    Seleção de Parceiros
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>👤 Cliente (Financeiro) *</label>
                                    <select
                                        value={customerId}
                                        onChange={(e) => handleCustomerChange(e.target.value)}
                                        style={{ ...inputStyle, height: '48px', cursor: 'pointer', borderColor: customerId ? '#7c3aed' : '#e2e8f0', borderWidth: customerId ? '2px' : '1px' }}
                                        required
                                    >
                                        <option value="">Selecione o cliente pagador...</option>
                                        {customerList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: deliveryType === 'forwarder' ? '#7c3aed' : '#94a3b8' }}>🚚 Transportadora (Freteiro) {deliveryType === 'forwarder' && '*'}</label>
                                    <select
                                        value={forwarderId}
                                        onChange={(e) => handleForwarderChange(e.target.value)}
                                        disabled={deliveryType !== 'forwarder'}
                                        style={{
                                            ...inputStyle,
                                            height: '48px',
                                            cursor: deliveryType === 'forwarder' ? 'pointer' : 'not-allowed',
                                            background: deliveryType === 'forwarder' ? 'white' : '#f8fafc',
                                            borderColor: deliveryType === 'forwarder' && !forwarderId ? '#ef4444' : (deliveryType === 'forwarder' ? '#7c3aed' : '#e2e8f0'),
                                            borderWidth: deliveryType === 'forwarder' ? '2px' : '1px'
                                        }}
                                        required={deliveryType === 'forwarder'}
                                    >
                                        <option value="">{deliveryType === 'forwarder' ? 'Selecione a transportadora...' : 'Selecione "Transportadora" abaixo'}</option>
                                        {forwarderList.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {deliveryType === 'forwarder' && (
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ ...labelStyle, color: '#0EA5E9' }}>🚛 Freteiro</label>
                                    <select
                                        value={freteiroId}
                                        onChange={(e) => handleFreteiroChange(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            height: '48px',
                                            cursor: 'pointer',
                                            borderColor: freteiroId ? '#0EA5E9' : '#e2e8f0',
                                            borderWidth: freteiroId ? '2px' : '1px'
                                        }}
                                    >
                                        <option value="">Selecione o freteiro (opcional)...</option>
                                        {freteiroList.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
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

                        {/* Bill To & Ship To Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Bill To */}
                            <div style={{ ...cardStyle, marginBottom: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                                        📄 Faturamento (Bill To)
                                    </h3>
                                    <span style={{ fontSize: '10px', padding: '4px 8px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', fontWeight: '900' }}>AUTOMÁTICO</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Razão Social / Nome</label>
                                        <textarea
                                            value={billToName}
                                            onChange={e => setBillToName(e.target.value)}
                                            style={{ ...inputStyle, minHeight: '80px', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={labelStyle}>Endereço</label>
                                            <input type="text" value={billToAddress} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Cidade</label>
                                            <input type="text" value={billToCity} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>País</label>
                                            <input type="text" value={billToCountry} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ship To */}
                            <div style={{ ...cardStyle, marginBottom: 0, border: deliveryType === 'custom' ? '2px solid #7c3aed' : '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                                        📫 Destino (Ship To)
                                    </h3>
                                    {deliveryType === 'custom' ? (
                                        <span style={{ fontSize: '10px', padding: '4px 8px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontWeight: '900' }}>MANUAL</span>
                                    ) : (
                                        <span style={{ fontSize: '10px', padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '6px', fontWeight: '900' }}>DINÂMICO</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Recebedor</label>
                                        <input
                                            type="text"
                                            value={shipToName}
                                            onChange={e => setShipToName(e.target.value)}
                                            style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc', fontWeight: '600' }}
                                            required
                                            readOnly={deliveryType !== 'custom'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Endereço Completo</label>
                                        <input
                                            type="text"
                                            value={shipToAddress}
                                            onChange={e => setShipToAddress(e.target.value)}
                                            style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }}
                                            required
                                            readOnly={deliveryType !== 'custom'}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={labelStyle}>Cidade</label>
                                            <input
                                                type="text"
                                                value={shipToCity}
                                                onChange={e => setShipToCity(e.target.value)}
                                                style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }}
                                                required
                                                readOnly={deliveryType !== 'custom'}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Estado / UF</label>
                                            <input
                                                type="text"
                                                value={shipToState}
                                                onChange={e => setShipToState(e.target.value)}
                                                style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }}
                                                required
                                                readOnly={deliveryType !== 'custom'}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Zip Code</label>
                                            <input
                                                type="text"
                                                value={shipToZip}
                                                onChange={e => setShipToZip(e.target.value)}
                                                style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }}
                                                required
                                                readOnly={deliveryType !== 'custom'}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>País</label>
                                            <input
                                                type="text"
                                                value={shipToCountry}
                                                onChange={e => setShipToCountry(e.target.value)}
                                                style={{ ...inputStyle, background: deliveryType === 'custom' ? 'white' : '#f8fafc' }}
                                                required
                                                readOnly={deliveryType !== 'custom'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Header Info & Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Summary Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            padding: '40px',
                            borderRadius: '24px',
                            color: 'white',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '100px', opacity: 0.05, pointerEvents: 'none' }}>💵</div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', opacity: 0.6, letterSpacing: '0.1em' }}>VALOR TOTAL</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '11px', fontWeight: '900' }}>
                                        📦 {items.reduce((sum, i) => sum + i.quantity, 0)} ITENS
                                    </span>
                                    <span style={{ padding: '6px 14px', background: payAtDestination ? '#0ea5e9' : '#7c3aed', borderRadius: '100px', fontSize: '11px', fontWeight: '900' }}>
                                        {payAtDestination ? '📦 DESTINO' : '🇺🇸 ORIGEM'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ fontSize: '48px', fontWeight: '950', letterSpacing: '-0.03em', marginBottom: '4px' }}>
                                ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            {discountAmount > 0 && (
                                <div style={{ fontSize: '14px', opacity: 0.7, textDecoration: 'line-through' }}>
                                    Subtotal: ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                            )}
                            <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.5 }}>Preços baseados em estoque disponível</div>
                        </div>

                        {/* General Configs */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '24px' }}>
                                ⚙️ Detalhes do Documento
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={labelStyle}>📅 Data Documento</label>
                                    <input type="date" value={estimateDate} onChange={e => setEstimateDate(e.target.value)} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>⌛ Vencimento</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputStyle, borderColor: '#7c3aed', borderWidth: '1px' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>🚢 Envio Previsto</label>
                                    <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>🤵 Vendedor</label>
                                    <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="">Selecione...</option>
                                        {salespersons.map(s => (
                                            <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>💰 Comissão (%)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="number" min="0" step="0.01" value={commissionPercent} onChange={e => setCommissionPercent(Math.max(0, parseFloat(e.target.value) || 0))} style={{ ...inputStyle, width: '90px' }} />
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>
                                            = ${calculateCommissionValue().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={labelStyle}>🌍 Pagamento</label>
                                    <button
                                        type="button"
                                        onClick={() => setPayAtDestination(!payAtDestination)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: payAtDestination ? '2px solid #0ea5e9' : '1px solid #7c3aed',
                                            background: payAtDestination ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
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

                            {discountAmount > 0 && (
                                <div style={{
                                    padding: '10px 14px',
                                    background: '#fff1f2',
                                    borderRadius: '10px',
                                    border: '1px solid #fecaca',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <input
                                        type="checkbox"
                                        id="deductDiscount"
                                        checked={deductDiscountFromCommission}
                                        onChange={e => setDeductDiscountFromCommission(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="deductDiscount" style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b', cursor: 'pointer' }}>
                                        Deseja que os $ {discountAmount.toFixed(2)} de desconto sejam abatidos da comissão?
                                    </label>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                <div>
                                    <label style={labelStyle}>🏷️ Desconto (Valor Total)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#64748b' }}>$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={discountAmount}
                                            onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                                            style={{ ...inputStyle, borderColor: discountAmount > 0 ? '#ef4444' : '#e2e8f0', color: discountAmount > 0 ? '#ef4444' : '#0f172a', fontWeight: '800' }}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>⚠️ Justificativa do Desconto (Interno)</label>
                                    <input
                                        type="text"
                                        value={discountJustification}
                                        onChange={e => setDiscountJustification(e.target.value)}
                                        placeholder="Motivo do desconto..."
                                        style={{ ...inputStyle, borderColor: discountAmount > 0 && !discountJustification ? '#ef4444' : '#e2e8f0' }}
                                        required={discountAmount > 0}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Notes */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '16px' }}>
                                💬 Observações Internas
                            </h3>
                            <textarea
                                value={customerNotes}
                                onChange={e => setCustomerNotes(e.target.value)}
                                rows={3}
                                style={{ ...inputStyle, minHeight: '80px', fontSize: '13px' }}
                                placeholder="Notas que não aparecem para o cliente..."
                            />
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                            📱 Itens do Estimate
                        </h3>
                        <button
                            type="button"
                            onClick={addItem}
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 24px',
                                fontSize: '14px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                            }}
                        >
                            + Adicionar Item
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📦</div>
                            <div style={{ fontSize: '15px', fontWeight: '600' }}>Sua lista de itens está vazia</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>MODELO</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'left', width: '130px' }}>CAPACIDADE</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'left', width: '130px' }}>GRADE</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>DESCRIÇÃO</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '80px' }}>QTD</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '110px' }}>CUSTO AVG</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '100px' }}>MARGEM %</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '120px' }}>PREÇO UNIT.</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '120px' }}>TOTAL</th>
                                        <th style={{ ...tableHeaderStyle, width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>
                                                <input
                                                    type="text"
                                                    list="models-list"
                                                    value={item.model}
                                                    onChange={e => updateItem(item.id, 'model', e.target.value)}
                                                    placeholder="Digite o modelo..."
                                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                                    required
                                                />
                                                <datalist id="models-list">
                                                    {catalogModels.map(combined => <option key={combined} value={combined} />)}
                                                </datalist>
                                            </td>
                                            <td style={{ padding: '12px', width: '130px' }}>
                                                <input
                                                    type="text"
                                                    value={item.capacity}
                                                    readOnly
                                                    style={{ ...inputStyle, padding: '10px 12px', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                                                    placeholder="--"
                                                />
                                            </td>
                                            <td style={{ padding: '12px', width: '130px' }}>
                                                <input
                                                    type="text"
                                                    list={`grade-list-${item.id}`}
                                                    value={item.grade}
                                                    onChange={e => updateItem(item.id, 'grade', e.target.value)}
                                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                                />
                                                <datalist id={`grade-list-${item.id}`}>
                                                    {[...new Set([
                                                        ...grades.map(g => g.code),
                                                        ...availableStock.filter(s => s.model === item.model && s.capacity === item.capacity).map(s => s.grade)
                                                    ])].map(g => <option key={g} value={g} />)}
                                                </datalist>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    style={{ ...inputStyle, padding: '10px 12px', textAlign: 'center' }}
                                                    required
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <input
                                                    type="number"
                                                    value={(item.cost_price || 0).toFixed(2)}
                                                    readOnly
                                                    style={{ ...inputStyle, padding: '8px 10px', textAlign: 'right', background: '#f1f5f9', color: '#64748b', fontSize: '13px' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={(item.margin_percent || 0).toFixed(1)}
                                                    onChange={e => updateItem(item.id, 'margin_percent', e.target.value)}
                                                    style={{ ...inputStyle, padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#7c3aed' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={(item.unit_price || 0).toFixed(2)}
                                                    onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                                                    style={{ ...inputStyle, padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}
                                                    required
                                                />
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                                                ${(item.quantity * item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.5 }}
                                                    title="Remover"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>
                            🏦 Contas para Pagamento
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Selecione as contas que aparecerão no Estimate para o cliente realizar o pagamento:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {bankAccounts.map(account => (
                                <div
                                    key={account.id}
                                    onClick={() => {
                                        if (selectedBankIds.includes(account.id)) {
                                            setSelectedBankIds(selectedBankIds.filter(id => id !== account.id));
                                        } else {
                                            setSelectedBankIds([...selectedBankIds, account.id]);
                                        }
                                    }}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: selectedBankIds.includes(account.id) ? '2px solid #10b981' : '1px solid #e2e8f0',
                                        background: selectedBankIds.includes(account.id) ? '#f0fdf4' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '800', fontSize: '14px' }}>{account.name}</span>
                                        {selectedBankIds.includes(account.id) && <span style={{ color: '#10b981' }}>✅</span>}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                        {account.full_account_number || account.account_number || account.wallet_address}
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ fontSize: '10px', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', fontWeight: '700' }}>{account.currency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingBottom: '80px' }}>
                    <Link
                        href={`/${locale}/commercial/estimates`}
                        style={{ padding: '16px 32px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', textDecoration: 'none' }}
                    >
                        Descartar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '16px 48px',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)'
                        }}
                    >
                        {loading ? 'Salvando...' : '✨ Salvar Estimate'}
                    </button>
                </div>
            </form>
        </div>
    );
}
