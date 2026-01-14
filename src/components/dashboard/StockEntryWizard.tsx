'use client';

import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';

interface StockEntryWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Invoice {
    id: string;
    invoice_number: string;
    amount: number;
    agent_id: string;
}

interface Agent {
    id: string;
    name: string;
}

interface InvoiceItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    model_name?: string;
    capacity?: string;
    grade?: string;
}

interface ParsedItem {
    model: string;
    capacity: string;
    color: string;
    grade: string;
    price: number;
    imei: string;
    serial_number: string;
    lotId: string;
    isValid: boolean;
    error?: string;
}

export default function StockEntryWizard({ isOpen, onClose, onSuccess }: StockEntryWizardProps) {
    const supabase = useSupabase();
    const { alert, confirm } = useUI();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Helper function to normalize model names for comparison
    // Converts "IPHONE 16 PRO MAX" to "iphone16promax"
    const normalizeModelName = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/\s+/g, '')      // Remove spaces
            .replace(/-/g, '')        // Remove hyphens
            .replace(/[^a-z0-9]/g, '') // Remove special chars
            .trim();
    };

    // Helper function to match spreadsheet model+capacity with invoice model+capacity
    const matchModels = (
        spreadsheetModel: string,
        spreadsheetCapacity: string,
        invoiceModel: string,
        invoiceCapacity: string
    ): boolean => {
        const normSpreadsheet = normalizeModelName(spreadsheetModel);
        const normInvoice = normalizeModelName(invoiceModel);
        const normSpreadCap = normalizeModelName(spreadsheetCapacity);
        const normInvCap = normalizeModelName(invoiceCapacity);

        // Match model names (without capacity)
        const modelMatch = normSpreadsheet === normInvoice;

        // Match capacity
        const capacityMatch = normSpreadCap === normInvCap;

        return modelMatch && capacityMatch;
    };

    // Data for Step 0
    const [agents, setAgents] = useState<Agent[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [stockLocations, setStockLocations] = useState<{ id: string; name: string }[]>([]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

    // Data for Step 1 & 2
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

    // Data for T-Mobile Lot Mapping (Step 2.5)
    const [uniqueLots, setUniqueLots] = useState<string[]>([]);
    const [lotMappings, setLotMappings] = useState<Record<string, { locationId: string; unitPrice: number }>>({});

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const startedOnOverlay = useRef(false);

    useEffect(() => {
        if (isOpen) {
            fetchAgents();
            fetchStockLocations();
            setStep(0);
            setSelectedAgent('');
            setSelectedInvoiceId('');
            setFileName('');
            setParsedItems([]);
            setUniqueLots([]);
            setLotMappings({});
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedAgent) {
            fetchInvoices(selectedAgent);
        } else {
            setInvoices([]);
            setInvoiceItems([]);
        }
    }, [selectedAgent]);

    useEffect(() => {
        if (selectedInvoiceId) {
            fetchInvoiceItems(selectedInvoiceId);
        } else {
            setInvoiceItems([]);
        }
    }, [selectedInvoiceId]);

    const fetchAgents = async () => {
        const { data } = await supabase
            .from('agents')
            .select('id, name')
            .contains('roles', ['fornecedor_estoque'])
            .is('deleted_at', null)
            .order('name');
        if (data) setAgents(data);
    };

    const fetchStockLocations = async () => {
        const { data } = await supabase
            .from('stock_locations')
            .select('id, name')
            .is('deleted_at', null)
            .order('name');
        if (data) setStockLocations(data);
    };

    const fetchInvoices = async (agentId: string) => {
        // 1. Fetch all invoices for the agent
        const { data: invoicesData } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount')
            .eq('agent_id', agentId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (!invoicesData) {
            setInvoices([]);
            return;
        }

        // 2. Fetch which invoices already have items in inventory
        const { data: inventoryData } = await supabase
            .from('inventory')
            .select('purchase_invoice')
            .eq('agent_id', agentId)
            .is('deleted_at', null);

        const registeredInvoices = new Set(
            inventoryData?.map((i: any) => i.purchase_invoice?.toLowerCase().trim()).filter(Boolean) || []
        );

        // 3. Filter: Only show invoices that DON'T have a single item in inventory yet
        const pendingInvoices = invoicesData.filter((inv: Invoice) =>
            !registeredInvoices.has(inv.invoice_number.toLowerCase().trim())
        );

        setInvoices(pendingInvoices);
    };

    const fetchInvoiceItems = async (invoiceId: string) => {
        setLoading(true);
        try {
            console.log('📡 Buscando itens para invoice_id:', invoiceId);
            const { data, error } = await supabase
                .from('invoice_items')
                .select(`
                    *,
                    model:product_id(name)
                `)
                .eq('invoice_id', invoiceId);

            if (error) {
                console.error('❌ Erro ao buscar itens da invoice (com join):', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                // Fallback attempt without join if join failed
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('invoice_items')
                    .select('*')
                    .eq('invoice_id', invoiceId);

                if (fallbackError) throw fallbackError;

                setInvoiceItems(fallbackData.map((item: any) => ({
                    ...item,
                    model_name: item.model_name || 'Item sem nome',
                    capacity: item.capacity || '',
                    grade: item.grade || ''
                })));
            } else if (data) {
                console.log('✅ Itens encontrados:', data.length);
                setInvoiceItems(data.map((item: any) => ({
                    ...item,
                    model_name: item.model?.name || item.model_name || 'Item',
                    capacity: item.capacity || '',
                    grade: item.grade || ''
                })));
            }
        } catch (err: any) {
            console.error('❌ Erro fatal ao buscar itens:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | null = null;

        if ('files' in (e as any).target) {
            file = (e.target as HTMLInputElement).files?.[0] || null;
        } else {
            e.preventDefault();
            setIsDragging(false);
            file = (e as React.DragEvent).dataTransfer.files?.[0] || null;
        }

        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const { read, utils } = await import('xlsx');
                const wb = read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = utils.sheet_to_json(ws);

                // Map data based on column headers (common names)
                const items: ParsedItem[] = data.map((row: any) => {
                    const normalize = (s: string) =>
                        s.toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]/g, '');

                    const findVal = (keys: string[]) => {
                        const targetKey = Object.keys(row).find(k => {
                            const normalizedKey = normalize(k);
                            return keys.some(search => normalizedKey.includes(normalize(search)));
                        });
                        return targetKey ? String(row[targetKey]).trim() : '';
                    };

                    const rawPrice = findVal(['preco', 'price', 'valor', 'unitario', 'unit price']);

                    // Smart Price Parsing
                    let price = 0;
                    if (rawPrice) {
                        // Remove spaces and currency symbols
                        let cleaned = rawPrice.replace(/[$\s]/g, '');

                        // Check if it has a comma (Brazilian style 1.234,56)
                        if (cleaned.includes(',') && cleaned.includes('.')) {
                            // If has both, assume dot is thousands and comma is decimal
                            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
                        } else if (cleaned.includes(',')) {
                            // If only comma, it's the decimal separator
                            cleaned = cleaned.replace(',', '.');
                        } else if (cleaned.split('.').length > 2) {
                            // If multiple dots, they are thousands separators
                            cleaned = cleaned.replace(/\./g, '');
                        }

                        price = parseFloat(cleaned) || 0;
                    }

                    // T-Mobile format: Lot ID, Auction Model (contains model + capacity), Grade, Serial No
                    const lotId = findVal(['lot id', 'lotid', 'lote']);
                    const auctionModel = findVal(['auction model', 'auctionmodel']);
                    const imei = findVal(['imei']).replace(/\D/g, '');
                    const serial = findVal(['serial', 'sn', 'serie', 'serial no']);

                    // Parse model and capacity
                    let model = findVal(['modelo', 'model']);
                    let capacity = findVal(['capacidade', 'capacity', 'cap']);

                    // If we have an Auction Model column (T-Mobile format), use it
                    if (auctionModel) {
                        model = auctionModel;
                    }

                    // Extract capacity from model if it's embedded (e.g., "IPHONE 16 128GB" → model: "IPHONE 16", capacity: "128GB")
                    // This handles both "128GB" at the end and capacity with space like "128 GB"
                    if (model && !capacity) {
                        const capacityMatch = model.match(/\s+(\d+\s*(?:GB|TB))$/i);
                        if (capacityMatch) {
                            capacity = capacityMatch[1].replace(/\s/g, '').toUpperCase();
                            model = model.replace(capacityMatch[0], '').trim();
                        }
                    }

                    // Also handle if capacity was found but model still has it embedded
                    if (model && capacity) {
                        // Remove capacity from model if still present
                        const capRegex = new RegExp('\\s*' + capacity.replace(/\s/g, '\\s*') + '\\s*$', 'i');
                        model = model.replace(capRegex, '').trim();
                    }

                    console.log('📋 Parsed row:', { original: findVal(['modelo', 'model', 'auction model', 'auctionmodel']), model, capacity });

                    return {
                        model: model,
                        capacity: capacity,
                        color: findVal(['cor', 'color']),
                        grade: findVal(['grade', 'quality', 'condicao']),
                        price: price,
                        imei: imei,
                        serial_number: serial,
                        lotId: lotId,
                        isValid: !!model && (!!imei || !!serial)
                    };
                });

                if (items.length === 0) {
                    alert('Atenção', 'Nenhum dado encontrado na planilha. Verifique as colunas.', 'danger');
                    return;
                }

                // Extract unique Lot IDs for mapping
                const lots = [...new Set(items.map(i => i.lotId).filter(Boolean))];
                setUniqueLots(lots);

                // Initialize lot mappings with empty values
                if (lots.length > 0) {
                    const initialMappings: Record<string, { locationId: string; unitPrice: number }> = {};
                    lots.forEach(lot => {
                        initialMappings[lot] = { locationId: '', unitPrice: 0 };
                    });
                    setLotMappings(initialMappings);
                }

                setParsedItems(items);

                // If we have lots, go to lot mapping step (2), otherwise go to review (3)
                setStep(lots.length > 0 ? 2 : 3);
            } catch (err: any) {
                alert('Erro', 'Não foi possível ler o arquivo: ' + err.message, 'danger');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);
            const { data: { user } } = await supabase.auth.getUser();

            const itemsToInsert = parsedItems.map((item: ParsedItem) => {
                // Get lot mapping if exists
                const lotMapping = item.lotId ? lotMappings[item.lotId] : null;

                return {
                    model: item.model,
                    capacity: item.capacity,
                    color: item.color,
                    grade: item.grade,
                    price: lotMapping?.unitPrice || item.price,
                    imei: item.imei || null,
                    serial_number: item.serial_number || null,
                    purchase_invoice: selectedInvoice?.invoice_number || null,
                    agent_id: selectedAgent || null,
                    location_id: lotMapping?.locationId || null,
                    status: 'Available',
                    created_by: user?.id,
                    entry_date: entryDate
                };
            });

            console.log('📦 Inserting items:', { count: itemsToInsert.length, sample: itemsToInsert[0] });

            const { data, error } = await supabase.from('inventory').insert(itemsToInsert).select();

            console.log('📦 Insert result:', { data, error });

            if (error) throw error;

            await alert('Sucesso', `${itemsToInsert.length} itens inseridos com sucesso!`, 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('❌ Insert error:', error);
            await alert('Erro', error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);
    const totalParsedValue = parsedItems.reduce((sum: number, item: ParsedItem) => {
        const lotMapping = item.lotId ? lotMappings[item.lotId] : null;
        return sum + (lotMapping?.unitPrice || item.price);
    }, 0);
    const diffValue = totalParsedValue - (selectedInvoice?.amount || 0);

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) startedOnOverlay.current = true;
                else startedOnOverlay.current = false;
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && startedOnOverlay.current) onClose();
            }}
        >
            <div style={{
                background: 'white', borderRadius: '24px', width: '90%', maxWidth: '800px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header */}
                <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        🚀 Entrada de Estoque via Planilha
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                        Siga os passos para realizar o batimento com a invoice.
                    </p>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

                    {step === 0 && (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#475569' }}>
                                    1. SELEÇÃO DE ORIGEM
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>FORNECEDOR</label>
                                        <select
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="">Selecione o fornecedor...</option>
                                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>INVOICE (CONTA A PAGAR)</label>
                                        <select
                                            value={selectedInvoiceId}
                                            onChange={(e) => setSelectedInvoiceId(e.target.value)}
                                            style={inputStyle}
                                            disabled={!selectedAgent}
                                        >
                                            <option value="">Selecione a invoice...</option>
                                            {invoices.map(i => (
                                                <option key={i.id} value={i.id}>
                                                    {i.invoice_number} - ${i.amount.toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#475569' }}>
                                    2. DATA DE ENTRADA
                                </h3>
                                <div style={{ width: '200px' }}>
                                    <label style={labelStyle}>DATA EFETIVA</label>
                                    <input
                                        type="date"
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                    Esta data define quando o item entrou fisicamente no estoque.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!selectedInvoiceId}
                                    style={{
                                        background: '#7c3aed', color: 'white', border: 'none', padding: '12px 32px',
                                        borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
                                        opacity: !selectedInvoiceId ? 0.5 : 1
                                    }}
                                >
                                    Continuar Para Planilha →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                    Envie sua planilha do Excel (.xlsx ou .csv)
                                </h3>
                                <div style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                                    Colunas suportadas: Modelo, Capacidade, Cor, Grade, Preço, IMEI/Serial
                                </div>
                            </div>

                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileUpload}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '100%', height: '250px',
                                    border: `2px dashed ${isDragging ? '#7c3aed' : '#e2e8f0'}`,
                                    borderRadius: '24px', background: isDragging ? '#f5f3ff' : '#f8fafc',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', gap: '16px', cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '48px' }}>📊</div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>
                                        {fileName ? fileName : 'Arraste o arquivo aqui ou clique para selecionar'}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                        Formatos aceitos: .xlsx, .xls, .csv
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx,.xls,.csv"
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => setStep(0)} style={secondaryBtn}>Voltar</button>
                                <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                    💡 Dica: O sistema identifica as colunas automaticamente pelo nome.
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && uniqueLots.length > 0 && (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>
                                    3. MAPEAMENTO DE LOTES
                                </h3>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                                    Encontramos {uniqueLots.length} lotes únicos. Configure o local e preço de cada um:
                                </p>

                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '12px', fontWeight: '700', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                                        <div>LOT ID</div>
                                        <div>LOCAL DO ESTOQUE *</div>
                                        <div>PREÇO UNITÁRIO *</div>
                                    </div>

                                    {uniqueLots.map(lot => (
                                        <div key={lot} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', background: '#e2e8f0', padding: '10px 12px', borderRadius: '8px' }}>
                                                {lot}
                                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                                                    ({parsedItems.filter(i => i.lotId === lot).length} itens)
                                                </span>
                                            </div>
                                            <select
                                                value={lotMappings[lot]?.locationId || ''}
                                                onChange={(e) => setLotMappings(prev => ({
                                                    ...prev,
                                                    [lot]: { ...prev[lot], locationId: e.target.value }
                                                }))}
                                                style={inputStyle}
                                            >
                                                <option value="">Selecione...</option>
                                                {stockLocations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={lotMappings[lot]?.unitPrice || ''}
                                                    onChange={(e) => setLotMappings(prev => ({
                                                        ...prev,
                                                        [lot]: { ...prev[lot], unitPrice: parseFloat(e.target.value) || 0 }
                                                    }))}
                                                    style={{ ...inputStyle, paddingLeft: '28px' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => setStep(1)} style={secondaryBtn}>Voltar</button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!uniqueLots.every(lot => lotMappings[lot]?.locationId && lotMappings[lot]?.unitPrice > 0)}
                                    style={{
                                        ...primaryBtn,
                                        opacity: !uniqueLots.every(lot => lotMappings[lot]?.locationId && lotMappings[lot]?.unitPrice > 0) ? 0.5 : 1
                                    }}
                                >
                                    Continuar Para Revisão →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Reconciliation Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <div style={statCard}>
                                    <div style={statLabel}>ITENS NA INVOICE</div>
                                    <div style={statValue}>{invoiceItems.reduce((sum: number, i: InvoiceItem) => sum + i.quantity, 0)}</div>
                                </div>
                                <div style={statCard}>
                                    <div style={statLabel}>ITENS NA PLANILHA</div>
                                    <div style={statValue}>{parsedItems.length}</div>
                                </div>
                                <div style={{ ...statCard, background: Math.abs(diffValue) > 0.1 ? '#fff1f2' : '#f0fdf4' }}>
                                    <div style={statLabel}>DIFERENÇA DE VALOR</div>
                                    <div style={{ ...statValue, color: Math.abs(diffValue) > 0.1 ? '#e11d48' : '#16a34a' }}>
                                        ${diffValue.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Reconciliation */}
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#475569' }}>
                                    DIVERGÊNCIAS POR MODELO
                                </h3>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {invoiceItems.map((invItem: InvoiceItem) => {
                                        const actualQty = parsedItems.filter((p: ParsedItem) => {
                                            return matchModels(
                                                p.model,
                                                p.capacity,
                                                invItem.model_name || '',
                                                invItem.capacity || ''
                                            );
                                        }).length;
                                        const isMismatch = actualQty !== invItem.quantity;

                                        return (
                                            <div key={invItem.id} style={{
                                                display: 'flex', justifyContent: 'space-between', padding: '12px',
                                                background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '13px' }}>
                                                        {invItem.model_name} {invItem.capacity && <span style={{ color: '#7c3aed' }}>{invItem.capacity}</span>}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                        Grade: {invItem.grade || '---'} | Unitário: ${invItem.unit_price}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{
                                                        fontSize: '14px', fontWeight: '800',
                                                        color: isMismatch ? '#e11d48' : '#16a34a'
                                                    }}>
                                                        {actualQty} / {invItem.quantity} unidades
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: isMismatch ? '#fb7185' : '#4ade80' }}>
                                                        {isMismatch ? '⚠️ Divergência detectada' : '✓ Batimento OK'}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Data Preview */}
                            <div style={{
                                border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            <th style={thStyle}>Modelo</th>
                                            <th style={thStyle}>IMEI/Serial</th>
                                            <th style={thStyle}>Grade</th>
                                            <th style={thStyle}>Local</th>
                                            <th style={thStyle}>Preço</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedItems.slice(0, 10).map((item: ParsedItem, idx: number) => {
                                            const lotMapping = lotMappings[item.lotId];
                                            const location = stockLocations.find(l => l.id === lotMapping?.locationId);
                                            const price = lotMapping?.unitPrice || item.price;

                                            return (
                                                <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                    <td style={tdStyle}>{item.model} {item.capacity}</td>
                                                    <td style={tdStyle}>{item.imei || item.serial_number}</td>
                                                    <td style={tdStyle}>{item.grade}</td>
                                                    <td style={tdStyle}>{location?.name || '---'}</td>
                                                    <td style={tdStyle}>${price.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                        {parsedItems.length > 10 && (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    ... e mais {parsedItems.length - 10} itens
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => setStep(uniqueLots.length > 0 ? 2 : 1)} style={secondaryBtn}>Voltar</button>
                                <button
                                    onClick={handleFinish}
                                    disabled={loading}
                                    style={primaryBtn}
                                >
                                    {loading ? 'Processando...' : `Confirmar Entrada (${parsedItems.length} itens)`}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8',
    textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white'
};

const primaryBtn: React.CSSProperties = {
    background: '#7c3aed', color: 'white', border: 'none', padding: '12px 32px',
    borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
};

const secondaryBtn: React.CSSProperties = {
    background: 'white', color: '#64748b', border: '1px solid #e2e8f0',
    padding: '12px 32px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
};

const statCard: React.CSSProperties = {
    padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0'
};

const statLabel: React.CSSProperties = {
    fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px'
};

const statValue: React.CSSProperties = {
    fontSize: '20px', fontWeight: '900', color: '#0f172a'
};

const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontWeight: '700', color: '#475569'
};

const tdStyle: React.CSSProperties = {
    padding: '10px 16px', color: '#64748b'
};
