'use client';

import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useGrades } from '@/hooks/useGrades';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

const CAPACITY_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '41mm', '42mm', '44mm', '45mm', '46mm', '49mm'];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

interface Agent {
    id: string;
    name: string;
    default_financial_class_id?: string;
}

interface CostCenter {
    id: string;
    name: string;
    code: string;
}

interface Product {
    id: string;
    name: string;
    model: string;
    /** product_catalog.type: grupo do produto (Celular, Fone, Tablet, etc.) */
    type?: string;
}

interface BankAccount {
    id: string;
    name: string;
    account_number: string;
}

interface Account {
    id: string;
    name: string;
    code: string;
}

interface User {
    id: string;
    first_name: string;
    last_name: string;
}

interface InvoiceItem {
    id: string;
    product_type_id: string;
    product_id: string;
    financial_class_id: string;
    capacity: string;
    grade: string;
    lot_id: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    description?: string;
    account_id?: string;
    unit_cost?: number;
}

interface ComboboxProps {
    value: string;
    options: { id: string; name: string }[];
    onChange: (value: string) => void;
    placeholder?: string;
}

function Combobox({ value, options, onChange, placeholder }: ComboboxProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.id === value);

    const filtered = options.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (!isOpen) {
            setSearch(selectedOption?.name || '');
        }
    }, [isOpen, selectedOption]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                value={isOpen ? search : (selectedOption?.name || '')}
                onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '13px',
                    background: 'white',
                    outline: 'none'
                }}
            />
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginTop: '4px'
                }}>
                    {filtered.length > 0 ? (
                        filtered.map(opt => (
                            <div
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                    setSearch(opt.name);
                                }}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: opt.id === value ? '#eff6ff' : 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                onMouseOver={(e: any) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseOut={(e: any) => e.currentTarget.style.background = opt.id === value ? '#eff6ff' : 'white'}
                            >
                                {opt.name}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
                            Nenhum resultado
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function NewInvoicePage() {
    const supabase = useSupabase();
    const { grades } = useGrades();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const isEdit = !!id;

    const { alert: uiAlert, confirm: uiConfirm, toast } = useUI();
    const { logAction } = useAuditLog();
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
    const [productTypes, setProductTypes] = useState<Product[]>([]);
    const [models, setModels] = useState<Product[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [financialClasses, setFinancialClasses] = useState<{ id: string, name: string }[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, [supabase]);

    // Data fetching for edit mode
    useEffect(() => {
        if (isEdit) {
            fetchInvoiceData();
        }
    }, [isEdit, id]);

    const fetchInvoiceData = async () => {
        setLoading(true);
        try {
            const { data: invoice, error } = await supabase
                .from('invoices')
                .select('*, invoice_items(*)')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (invoice) {
                setFormData({
                    agent_id: invoice.agent_id || '',
                    invoice_number: invoice.invoice_number || '',
                    invoice_date: invoice.invoice_date || '',
                    due_date: invoice.due_date || '',
                    competence: invoice.competence || '',
                    cost_center_id: invoice.cost_center_id || '',
                    payment_frequency: invoice.payment_frequency || 'one-time',
                    invoice_type: invoice.invoice_type || 'service',
                    notes: invoice.notes || '',
                    board_status: invoice.board_status || 'pending',
                    installmentsCount: invoice.total_installments || 1,
                    requested_by: invoice.requested_by || '',
                    ap_number: invoice.ap_number || '',
                    attachment_url: invoice.attachment_url || '',
                });

                if (invoice.invoice_items) {
                    setItems(invoice.invoice_items.map((item: any) => ({
                        id: item.id,
                        product_type_id: item.product_type_id || '',
                        product_id: item.product_id || '',
                        financial_class_id: item.financial_class_id || '',
                        capacity: item.capacity || '',
                        grade: item.grade || '',
                        lot_id: item.lot_id || '',
                        quantity: item.quantity || 0,
                        unit_price: item.unit_price || 0,
                        total_amount: item.total_amount || 0
                    })));
                }
            }
        } catch (error: unknown) {
            console.error('Error fetching invoice:', error);
            uiAlert('Erro', 'Não foi possível carregar os dados da AP: ' + getErrorMessage(error), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await uiConfirm(
            'Confirmar Exclusão',
            'Deseja realmente excluir esta AP permanentemente?',
            'danger'
        );

        if (!isConfirmed) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('invoices')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            await logAction({
                action: 'DELETE',
                entity_type: 'invoice',
                entity_id: id,
                details: `Excluiu a AP ${id} via formulário`
            });

            toast.success('AP excluída com sucesso!');
            router.push('/finance/accounts-payable');
        } catch (error: unknown) {
            console.error('Error deleting invoice:', error);
            uiAlert('Erro', 'Erro ao excluir AP: ' + getErrorMessage(error), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        agent_id: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        competence: '',
        cost_center_id: '',
        payment_frequency: 'one-time',
        invoice_type: 'service',
        notes: '',
        board_status: 'pending',
        installmentsCount: 1,
        requested_by: '',
        ap_number: '',
        attachment_url: '',
    });

    const [installmentDates, setInstallmentDates] = useState<{ number: number, dueDate: string, amount: number }[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            await uiAlert('Tipo de arquivo', 'Por favor, envie um PDF, JPG ou PNG.', 'info');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            await uiAlert('Arquivo muito grande', 'O tamanho máximo permitido é 5MB.', 'info');
            return;
        }

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `invoices/${formData.invoice_number.replace(/[^a-z0-9]/gi, '_')}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('invoice-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('invoice-attachments').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, attachment_url: publicUrl }));
            toast.success('Arquivo anexado com sucesso!');
        } catch (error: unknown) {
            console.error('Upload error:', error);
            await uiAlert('Erro no envio', 'Não foi possível enviar o arquivo.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const total = getTotalAmount();
        const count = formData.installmentsCount || 1;
        const perInstallment = total / count;

        const newDates = [];
        for (let i = 1; i <= count; i++) {
            const date = new Date(formData.due_date || formData.invoice_date);
            if (i > 1) date.setMonth(date.getMonth() + (i - 1));

            newDates.push({
                number: i,
                dueDate: date.toISOString().split('T')[0],
                amount: perInstallment
            });
        }
        setInstallmentDates(newDates);
    }, [formData.installmentsCount, formData.due_date, items]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Agents
        const { data: agentsData, error: agentsError } = await supabase
            .from('agents')
            .select('id, name, default_financial_class_id')
            .is('deleted_at', null)
            .order('name');

        if (agentsError) {
            console.error('❌ Erro ao buscar agentes:', agentsError);
            // Fallback if default_financial_class_id doesn't exist yet
            if (agentsError.code === '42703') {
                const { data: fallbackData } = await supabase
                    .from('agents')
                    .select('id, name')
                    .is('deleted_at', null)
                    .order('name');
                if (fallbackData) setAgents(fallbackData);
            }
        } else if (agentsData) {
            setAgents(agentsData);
        }

        // Cost Centers
        const { data: costCentersData } = await supabase
            .from('cost_centers')
            .select('id, name, code')
            .is('deleted_at', null)
            .eq('is_active', true)
            .order('name');
        if (costCentersData) setCostCenters(costCentersData);

        // Product Types
        console.log('📡 Buscando product_types...');
        const { data: productTypesData, error: ptError } = await supabase
            .from('product_types')
            .select('*')
            .order('name');

        if (ptError) {
            console.error('❌ Erro no Supabase (product_types):', ptError);
        } else {
            console.log('✅ Product Types carregados:', productTypesData?.length);
            setProductTypes(productTypesData.map((p: any) => ({ id: p.id, name: p.name, model: p.name })));
        }

        // Product Catalog (Models)
        console.log('📡 Buscando product_catalog...');
        const { data: catalogData, error: catError } = await supabase
            .from('product_catalog')
            .select('*')
            .order('name');

        if (catError) {
            console.error('❌ Erro no Supabase (product_catalog):', catError);
        } else {
            console.log('✅ Models carregados:', catalogData?.length);
            setModels(catalogData.map((p: any) => ({ id: p.id, name: p.name, model: p.name, type: p.type || '' })));
        }

        // Bank Accounts (agents with role 'banco')
        const { data: banksData } = await supabase
            .from('agents')
            .select('id, name, bank_account_number')
            .contains('roles', ['banco'])
            .is('deleted_at', null)
            .order('name');
        if (banksData) setBankAccounts(banksData.map((b: any) => ({ id: b.id, name: b.name, account_number: b.bank_account_number || '' })));

        // Financial Classes (Plano Financeiro)
        const { data: finData } = await supabase
            .from('financial_classes')
            .select('id, name')
            .is('deleted_at', null)
            .order('name');
        if (finData) {
            setFinancialClasses(finData);
            setAccounts(finData);
        }

        // Stock Locations
        const { data: locData } = await supabase
            .from('stock_locations')
            .select('id, name')
            .is('deleted_at', null)
            .order('name');
        if (locData) setLocations(locData);

        // Users for approval
        const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .is('deleted_at', null)
            .order('first_name');

        if (usersError) {
            console.error('❌ Erro ao buscar perfis:', usersError);
        } else if (usersData) {
            console.log('✅ Perfis carregados:', usersData.length);
            setUsers(usersData);
        }
    };

    const addItem = () => {
        setItems([...items, {
            id: Math.random().toString(),
            product_type_id: '',
            product_id: '',
            financial_class_id: '',
            capacity: '',
            grade: '',
            lot_id: '',
            quantity: 1,
            unit_price: 0,
            total_amount: 0,
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                // Logic for "Fone", "Relógio", "TV" (N/A Concept)
                if (field === 'product_type_id') {
                    const type = productTypes.find(t => t.id === value);
                    const typeName = type?.name?.toLowerCase() || '';
                    const noCap = ['fone', 'relogio', 'relógio', 'tv', 'watch', 'headphone'].some(k => typeName.includes(k));
                    if (noCap) {
                        updated.capacity = '';
                    }
                    // Limpar modelo se não pertencer ao novo tipo (respeitar grupo do produto)
                    const selectedModel = models.find((m: Product) => m.id === item.product_id);
                    const newTypeName = type?.name;
                    if (selectedModel?.type && newTypeName && selectedModel.type !== newTypeName) {
                        updated.product_id = '';
                    }
                }

                // Auto-calculate total for both unit_price and unit_cost
                if (field === 'quantity' || field === 'unit_price' || field === 'unit_cost') {
                    const unitValue = updated.unit_cost || updated.unit_price || 0;
                    updated.total_amount = updated.quantity * unitValue;
                }
                return updated;
            }
            return item;
        }));
    };

    const getTotalAmount = () => {
        return items.reduce((sum, item) => sum + item.total_amount, 0);
    };

    const getTotalQuantity = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const totalAmount = getTotalAmount();
            if (totalAmount <= 0) throw new Error("A AP deve ter pelo menos um item com valor.");
            if (!formData.agent_id) throw new Error("Selecione um fornecedor.");
            if (!formData.invoice_number) throw new Error("Informe o número da fatura.");
            if (!formData.due_date && formData.installmentsCount === 1) throw new Error("Informe a data de vencimento.");
            if (!formData.competence) throw new Error("Informe a competência (mês/ano).");

            // 1. Check for duplicate invoice number for this agent
            const { data: existing } = await supabase
                .from('invoices')
                .select('id')
                .eq('agent_id', formData.agent_id)
                .eq('invoice_number', formData.invoice_number)
                .is('deleted_at', null)
                .limit(1);

            if (existing && existing.length > 0 && !isEdit) {
                const proceed = await uiConfirm(
                    '⚠️ Fatura Duplicada',
                    `Já existe uma fatura (${formData.invoice_number}) para este fornecedor. Deseja continuar mesmo assim?`,
                    'danger'
                );
                if (!proceed) return;
            }

            if (isEdit) {
                // 1. UPDATE SHARED FIELDS FOR ALL INSTALLMENTS IN THIS AP
                if (formData.ap_number) {
                    const { error: groupUpdateError } = await supabase
                        .from('invoices')
                        .update({
                            agent_id: formData.agent_id,
                            invoice_number: formData.invoice_number,
                            invoice_date: formData.invoice_date,
                            competence: formData.competence,
                            cost_center_id: formData.cost_center_id,
                            payment_frequency: formData.payment_frequency,
                            invoice_type: formData.invoice_type,
                            notes: formData.notes,
                            requested_by: formData.requested_by || null,
                            attachment_url: formData.attachment_url || null,
                        })
                        .eq('ap_number', formData.ap_number);

                    if (groupUpdateError) console.error('Error updating AP group:', groupUpdateError);
                }

                // 2. UPDATE SPECIFIC RECORD
                const { error: updateError } = await supabase
                    .from('invoices')
                    .update({
                        due_date: formData.due_date,
                        amount: totalAmount,
                        amount_usd: totalAmount,
                    })
                    .eq('id', id);

                if (updateError) throw updateError;

                // 3. SYNC ITEMS
                const itemsToInsertBase = items.filter(item =>
                    item.product_id || item.product_type_id || item.financial_class_id
                ).map(item => ({
                    product_type_id: item.product_type_id || null,
                    product_id: item.product_id || null,
                    financial_class_id: item.financial_class_id || null,
                    capacity: item.capacity || null,
                    grade: item.grade || null,
                    lot_id: item.lot_id || null,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_amount: item.total_amount,
                }));

                const { data: siblings } = await supabase
                    .from('invoices')
                    .select('id')
                    .eq('ap_number', formData.ap_number || '');

                if (siblings && siblings.length > 0) {
                    for (const sibling of siblings) {
                        await supabase.from('invoice_items').delete().eq('invoice_id', sibling.id);
                        if (itemsToInsertBase.length > 0) {
                            const siblingItems = itemsToInsertBase.map(it => ({ ...it, invoice_id: sibling.id }));
                            await supabase.from('invoice_items').insert(siblingItems);
                        }
                    }
                }

                await logAction({
                    action: 'UPDATE',
                    entity_type: 'invoice',
                    entity_id: id,
                    new_data: { formData, items },
                    details: `Editou a AP ${formData.ap_number || id}`
                });

                toast.success('AP atualizada com sucesso!');
            } else {
                // CREATE MODE
                const invoicesToCreate = installmentDates.map(inst => ({
                    agent_id: formData.agent_id,
                    invoice_number: formData.invoice_number,
                    invoice_date: formData.invoice_date,
                    due_date: inst.dueDate,
                    competence: formData.competence,
                    cost_center_id: formData.cost_center_id,
                    payment_frequency: formData.payment_frequency,
                    invoice_type: formData.invoice_type,
                    notes: formData.notes,
                    status: 'pending',
                    amount: inst.amount,
                    amount_usd: inst.amount,
                    currency: 'USD',
                    exchange_rate: 1,
                    created_by: userId,
                    installment_number: inst.number,
                    total_installments: formData.installmentsCount,
                    requested_by: formData.requested_by || null,
                    attachment_url: formData.attachment_url || null,
                }));

                const { data: createdInvoices, error: invoiceError } = await supabase
                    .from('invoices')
                    .insert(invoicesToCreate)
                    .select();

                if (invoiceError) throw invoiceError;
                const primaryInvoice = createdInvoices[0];

                const itemsToInsert = items.filter(item =>
                    item.product_id || item.product_type_id || item.financial_class_id
                );

                if (itemsToInsert.length > 0) {
                    const itemsPayload = createdInvoices.flatMap((inv: any) =>
                        itemsToInsert.map(item => ({
                            invoice_id: inv.id,
                            product_type_id: item.product_type_id || null,
                            product_id: item.product_id || null,
                            financial_class_id: item.financial_class_id || null,
                            capacity: item.capacity || null,
                            grade: item.grade || null,
                            lot_id: item.lot_id || null,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            total_amount: item.total_amount,
                        }))
                    );

                    const { error: itemsError } = await supabase
                        .from('invoice_items')
                        .insert(itemsPayload);

                    if (itemsError) throw itemsError;
                }

                await logAction({
                    action: 'CREATE',
                    entity_type: 'invoice',
                    entity_id: primaryInvoice.id,
                    new_data: { formData, items: itemsToInsert },
                    details: `Criou AP ${primaryInvoice.ap_number || '(Gerando...)'} (${formData.installmentsCount} parcelas)`
                });

                const successMsg = primaryInvoice.ap_number
                    ? `AP ${primaryInvoice.ap_number} criada com ${formData.installmentsCount} parcelas!`
                    : `AP criada com ${formData.installmentsCount} parcelas!`;

                await uiAlert('Sucesso', successMsg, 'success');
            }
            router.push('/finance/accounts-payable');
        } catch (error: unknown) {
            console.error('Erro ao processar AP:', error);
            toast.error('Erro ao processar AP: ' + getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#64748b',
        marginBottom: '6px',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        color: '#0f172a',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s',
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title={isEdit ? 'Editar Autorização de Pagamento (AP)' : 'Nova Autorização de Pagamento (AP)'}
                description="Gerenciar faturas e autorizações de pagamento"
                icon="💰"
                breadcrumbs={[
                    { label: 'FINANCEIRO', href: '/finance', color: '#059669' },
                    { label: 'CONTAS A PAGAR', href: '/finance/accounts-payable', color: '#059669' },
                    { label: isEdit ? 'EDITAR' : 'NOVA AP', color: '#059669' },
                ]}
                moduleColor="#059669"
            />

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '24px' }}>
            <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📄 Dados da Autorização de Pagamento (AP)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>{isEdit ? 'Número da AP' : 'Número da AP (Interno)'}</label>
                            <input readOnly type="text" value={isEdit ? (formData.ap_number || id.substring(0, 8).toUpperCase()) : "Gerado na Gravação"} style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', fontStyle: 'italic', borderStyle: 'dashed' }} />
                        </div>

                        <div>
                            <label style={labelStyle}>Fornecedor / Agente <span style={{ color: '#ef4444' }}>*</span></label>
                            <Combobox
                                value={formData.agent_id}
                                options={agents}
                                onChange={(val) => {
                                    setFormData({ ...formData, agent_id: val });
                                    const agent = agents.find(a => a.id === val);
                                    if (agent?.default_financial_class_id) {
                                        setItems(prev => prev.map(item => ({
                                            ...item,
                                            financial_class_id: item.financial_class_id || agent.default_financial_class_id || ''
                                        })));
                                    }
                                }}
                                placeholder="Pesquisar fornecedor..."
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Número da Invoice <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required type="text" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} style={inputStyle} placeholder="Ex: INV-2026-001" />
                        </div>

                        <div>
                            <label style={labelStyle}>Data da Invoice <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required type="date" value={formData.invoice_date} onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })} style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Data de Vencimento <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Competência <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required type="month" value={formData.competence} onChange={(e) => setFormData({ ...formData, competence: e.target.value })} style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Centro de Custo</label>
                            <select value={formData.cost_center_id} onChange={(e) => setFormData({ ...formData, cost_center_id: e.target.value })} style={inputStyle}>
                                <option value="">Selecione...</option>
                                {costCenters.map((cc) => (
                                    <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Frequência de Pagamento</label>
                            <select value={formData.payment_frequency} onChange={(e) => setFormData({ ...formData, payment_frequency: e.target.value })} style={inputStyle}>
                                <option value="one-time">Única</option>
                                <option value="monthly">Mensal</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Tipo de AP / Despesa</label>
                            <select value={formData.invoice_type} onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })} style={inputStyle}>
                                <option value="service">Serviço</option>
                                <option value="product">Produtos Estoque</option>
                                <option value="recurring">Recorrente</option>
                                <option value="rent">Aluguel</option>
                                <option value="utilities">Utilidades</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Quantidade de Parcelas</label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={formData.installmentsCount}
                                onChange={(e) => setFormData({ ...formData, installmentsCount: parseInt(e.target.value) || 1 })}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Solicitado por</label>
                            <select
                                value={formData.requested_by}
                                onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="">Selecione...</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Anexar Invoice (PDF/Imagem)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    style={{ fontSize: '12px', width: '100%' }}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={loading}
                                />
                                {formData.attachment_url && (
                                    <a
                                        href={formData.attachment_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            fontSize: '11px',
                                            color: '#3B82F6',
                                            fontWeight: '700',
                                            padding: '8px 12px',
                                            background: '#eff6ff',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            border: '1px solid #dbeafe',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        📄 Ver Anexo
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {formData.installmentsCount > 1 && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px dashed #cbd5e1'
                        }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '12px', textTransform: 'uppercase' }}>
                                📅 Detalhamento das Parcelas
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {installmentDates.map((inst, idx) => (
                                    <div key={idx} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>PARCELA {inst.number}/{formData.installmentsCount}</div>
                                        <input
                                            type="date"
                                            value={inst.dueDate}
                                            onChange={(e) => {
                                                const newDates = [...installmentDates];
                                                newDates[idx].dueDate = e.target.value;
                                                setInstallmentDates(newDates);
                                            }}
                                            style={{ ...inputStyle, padding: '6px', fontSize: '12px', marginBottom: '4px' }}
                                        />
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textAlign: 'right' }}>
                                            ${formatCurrency(inst.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {formData.invoice_type === 'product' && (
                    <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                📦 Itens da AP
                            </h3>
                            <button type="button" onClick={addItem} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3B82F6', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                                + Adicionar Item
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                                Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                            </div>
                        ) : (
                            <div style={{ overflow: 'visible' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                    <thead>
                                        <tr style={{ background: '#fff', borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '12%' }}>Produto</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '13%' }}>Modelo</th>
                                            <th style={{ padding: '12px 0px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '90px' }}>Capac.</th>
                                            <th style={{ padding: '12px 0px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '85px' }}>Grade</th>
                                            <th style={{ padding: '12px 0px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '90px' }}>Lot ID</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '15%' }}>Plano Financ.</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '60px' }}>Qtd</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '90px' }}>Unitário</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', width: '100px' }}>Total</th>
                                            <th style={{ padding: '12px 8px', width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <Combobox
                                                        value={item.product_type_id}
                                                        options={productTypes}
                                                        onChange={(val) => updateItem(item.id, 'product_type_id', val)}
                                                        placeholder="Tipo..."
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <Combobox
                                                        value={item.product_id}
                                                        options={(() => {
                                                            const selectedTypeName = productTypes.find(t => t.id === item.product_type_id)?.name;
                                                            if (!selectedTypeName) return [];
                                                            return models.filter((m: Product) => (m.type || '') === selectedTypeName);
                                                        })()}
                                                        onChange={(val) => updateItem(item.id, 'product_id', val)}
                                                        placeholder="Modelo..."
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 0px' }}>
                                                    {(() => {
                                                        const pType = productTypes.find(pt => pt.id === item.product_type_id);
                                                        const typeName = pType?.name?.toLowerCase() || '';
                                                        const noCap = ['fone', 'relogio', 'relógio', 'tv', 'watch', 'headphone'].some(k => typeName.includes(k));

                                                        if (noCap) {
                                                            return <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', fontWeight: '500' }}>N/A</div>;
                                                        }

                                                        return (
                                                            <select
                                                                value={item.capacity}
                                                                onChange={(e) => updateItem(item.id, 'capacity', e.target.value)}
                                                                style={{ ...inputStyle, fontSize: '13px', padding: '8px 4px', marginBottom: 0 }}
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {CAPACITY_OPTIONS.map(opt => (
                                                                    !opt.includes('mm') && <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        );
                                                    })()}
                                                </td>
                                                <td style={{ padding: '12px 0px' }}>
                                                    <select
                                                        value={item.grade}
                                                        onChange={(e) => updateItem(item.id, 'grade', e.target.value)}
                                                        style={{ ...inputStyle, fontSize: '13px', padding: '8px 4px', marginBottom: 0 }}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {grades.map(g => {
                                                        const same = !g.name || g.name.trim().toLowerCase() === g.code.trim().toLowerCase();
                                                        return <option key={g.id} value={g.code}>{same ? g.code : `${g.code} – ${g.name}`}</option>;
                                                      })}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '12px 0px' }}>
                                                    <input
                                                        type="text"
                                                        value={item.lot_id}
                                                        onChange={(e) => updateItem(item.id, 'lot_id', e.target.value)}
                                                        placeholder="Lote..."
                                                        style={{ ...inputStyle, fontSize: '13px', padding: '8px', marginBottom: 0 }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <Combobox
                                                        value={item.financial_class_id}
                                                        options={financialClasses}
                                                        onChange={(val) => updateItem(item.id, 'financial_class_id', val)}
                                                        placeholder="Plano..."
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <input type="number" min="0" step="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '13px', padding: '8px', textAlign: 'right', marginBottom: 0 }} />
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '13px', padding: '8px', textAlign: 'right', marginBottom: 0 }} />
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                                                    ${formatCurrency(item.total_amount)}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <button type="button" onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid #0f172a' }}>
                                            <td colSpan={6} style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                                                TOTAL
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#3B82F6' }}>
                                                {getTotalQuantity()}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}></td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#3B82F6' }}>
                                                ${formatCurrency(getTotalAmount())}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Simplified Items Form for Non-Product Types */}
                {formData.invoice_type && formData.invoice_type !== 'product' && (
                    <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                📋 Itens da AP
                            </h3>
                            <button type="button" onClick={addItem} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3B82F6', color: 'white', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                                + Adicionar Item
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                Clique em "+ Adicionar Item" para incluir itens nesta AP
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                                                Descrição
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                                                Plano Financeiro
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                                                Qtd
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                                                Unitário
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                                                Total
                                            </th>
                                            <th style={{ padding: '12px', width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <input
                                                        type="text"
                                                        value={item.description || ''}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        placeholder="Descrição do item"
                                                        style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', minWidth: '200px' }}>
                                                    <select
                                                        value={item.account_id || ''}
                                                        onChange={(e) => updateItem(item.id, 'account_id', e.target.value)}
                                                        style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {accounts.map((account) => (
                                                            <option key={account.id} value={account.id}>
                                                                {account.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        style={{ width: '80px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', textAlign: 'right' }}
                                                        min="0"
                                                        step="1"
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <input
                                                        type="number"
                                                        value={item.unit_cost || 0}
                                                        onChange={(e) => updateItem(item.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                        style={{ width: '100px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', textAlign: 'right' }}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                                                    ${formatCurrency(item.quantity * (item.unit_cost || 0))}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        style={{ padding: '6px 10px', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid #3B82F6', background: '#f8fafc' }}>
                                            <td colSpan={2} style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: '#0f172a', textTransform: 'uppercase' }}>
                                                TOTAL
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#3B82F6' }}>
                                                {getTotalQuantity()}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}></td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#3B82F6' }}>
                                                ${formatCurrency(getTotalAmount())}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📝 Observações
                    </h3>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Adicione qualquer informação adicional..." />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                    {isEdit && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: '1px solid #fee2e2',
                                background: '#fff',
                                color: '#ef4444',
                                fontWeight: '600',
                                fontSize: '14px',
                                marginRight: 'auto',
                                cursor: 'pointer'
                            }}
                        >
                            Excluir AP
                        </button>
                    )}
                    <Link href="/finance/accounts-payable" style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                        Cancelar
                    </Link>
                    <button type="submit" disabled={loading} style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3B82F6 0%, #1e40af 100%)', color: 'white', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                        {loading ? 'Salvando...' : isEdit ? '💾 Salvar Alterações' : '💾 Salvar AP'}
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
}
