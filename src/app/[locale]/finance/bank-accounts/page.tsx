'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import ColumnFilter from '@/components/ui/ColumnFilter';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';
import { lookupBankByRouting } from '@/lib/bankLookup';

interface BankAccount {
    id: string;
    name: string;
    account_type: string;
    account_number: string | null;
    full_account_number: string | null;
    routing_number: string | null;
    institution: string | null;
    currency: string;
    current_balance: number;
    is_active: boolean;
    is_receiving_account: boolean;
    description: string | null;
    wallet_address: string | null;
    blockchain: string | null;
}

export default function BankAccountsPage() {
    const supabase = useSupabase();
    const { alert, confirm, toast } = useUI();

    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<BankAccount | null>(null);

    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['active', 'inactive']);
    const [searchAccount, setSearchAccount] = useState('');
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        account_type: 'Bank USA',
        account_number: '',
        full_account_number: '',
        routing_number: '',
        institution: '',
        currency: 'USD',
        description: '',
        wallet_address: '',
        blockchain: '',
        is_receiving_account: true,
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('bank_accounts')
            .select('*')
            .is('deleted_at', null)
            .order('account_type')
            .order('name');

        if (data) setAccounts(data);
        setLoading(false);
    };

    const uniqueTypes = useMemo(
        () => [...new Set(accounts.map(a => a.account_type))].sort(),
        [accounts]
    );
    const uniqueCurrencies = useMemo(
        () => [...new Set(accounts.map(a => a.currency))].sort(),
        [accounts]
    );

    const statusOptions = useMemo(() => [
        { value: 'active', label: '✓ Ativa' },
        { value: 'inactive', label: '✗ Inativa' }
    ], []);

    // Inicializar filtros apenas UMA VEZ
    useEffect(() => {
        if (accounts.length > 0 && !filtersInitialized) {
            setSelectedTypes(uniqueTypes);
            setSelectedCurrencies(uniqueCurrencies);
            setFiltersInitialized(true);
        }
    }, [accounts.length, filtersInitialized, uniqueTypes, uniqueCurrencies]);

    const filteredAccounts = accounts.filter(a => {
        const matchesType = selectedTypes.includes(a.account_type);
        const matchesCurrency = selectedCurrencies.includes(a.currency);
        const matchesStatus = selectedStatuses.includes(a.is_active ? 'active' : 'inactive');
        const matchesSearch = searchAccount === '' ||
            a.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
            (a.account_number && a.account_number.toLowerCase().includes(searchAccount.toLowerCase())) ||
            (a.wallet_address && a.wallet_address.toLowerCase().includes(searchAccount.toLowerCase()));

        return matchesType && matchesCurrency && matchesStatus && matchesSearch;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editing) {
                const { error } = await supabase
                    .from('bank_accounts')
                    .update({
                        name: formData.name,
                        account_type: formData.account_type,
                        account_number: formData.account_number || null,
                        full_account_number: formData.full_account_number || null,
                        routing_number: formData.routing_number || null,
                        institution: formData.institution || null,
                        currency: formData.currency,
                        description: formData.description || null,
                        wallet_address: formData.wallet_address || null,
                        blockchain: formData.blockchain || null,
                        is_receiving_account: formData.is_receiving_account,
                    })
                    .eq('id', editing.id);
                if (error) throw error;
                toast.success('Conta atualizada!');
            } else {
                const { error } = await supabase
                    .from('bank_accounts')
                    .insert({
                        name: formData.name,
                        account_type: formData.account_type,
                        account_number: formData.account_number || null,
                        full_account_number: formData.full_account_number || null,
                        routing_number: formData.routing_number || null,
                        institution: formData.institution || null,
                        currency: formData.currency,
                        description: formData.description || null,
                        wallet_address: formData.wallet_address || null,
                        blockchain: formData.blockchain || null,
                        is_active: true,
                        is_receiving_account: formData.is_receiving_account,
                        current_balance: 0,
                    });
                if (error) throw error;
                await alert('Sucesso', 'Conta criada!', 'success');
            }
            await fetchAccounts();
            closeModal();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (account: BankAccount) => {
        setEditing(account);
        setFormData({
            name: account.name,
            account_type: account.account_type,
            account_number: account.account_number || '',
            full_account_number: account.full_account_number || '',
            routing_number: account.routing_number || '',
            institution: account.institution || '',
            currency: account.currency,
            description: account.description || '',
            wallet_address: account.wallet_address || '',
            blockchain: account.blockchain || '',
            is_receiving_account: account.is_receiving_account ?? true,
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (account: BankAccount) => {
        const confirmed = await confirm(
            'Confirmar',
            `Deseja ${account.is_active ? 'desativar' : 'ativar'} "${account.name}"?`,
            'danger'
        );
        if (!confirmed) return;

        const { error } = await supabase
            .from('bank_accounts')
            .update({ is_active: !account.is_active })
            .eq('id', account.id);

        if (!error) {
            await fetchAccounts();
            toast.success('Status atualizado!');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setFormData({
            name: '',
            account_type: 'Bank USA',
            account_number: '',
            full_account_number: '',
            routing_number: '',
            institution: '',
            currency: 'USD',
            description: '',
            wallet_address: '',
            blockchain: '',
            is_receiving_account: true,
        });
    };

    const clearFilters = () => {
        setSelectedTypes(uniqueTypes);
        setSelectedCurrencies(uniqueCurrencies);
        setSelectedStatuses(['active', 'inactive']);
        setSearchAccount('');
    };

    const hasActiveFilters =
        selectedTypes.length !== uniqueTypes.length ||
        selectedCurrencies.length !== uniqueCurrencies.length ||
        selectedStatuses.length !== 2 ||
        searchAccount !== '';

    const getTypeColor = (type: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'Bank USA': { bg: '#dbeafe', text: '#1e40af' },
            'Bank BR': { bg: '#d1fae5', text: '#065f46' },
            'Crypto': { bg: '#f3e8ff', text: '#6b21a8' },
            'Cash': { bg: '#fef3c7', text: '#92400e' },
            'Cartao': { bg: '#fee2e2', text: '#991b1b' },
            'Gerencial': { bg: '#f1f5f9', text: '#475569' },
        };
        return colors[type] || { bg: '#f1f5f9', text: '#475569' };
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Contas Bancárias"
                description="Bancos, crypto wallets e contas gerenciais"
                icon="🏦"
                breadcrumbs={[
                    { label: 'FINANCEIRO', href: '/finance', color: '#059669' },
                    { label: 'CONTAS BANCÁRIAS', color: '#059669' },
                ]}
                moduleColor="#059669"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px 28px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)',
                        }}
                    >
                        + Nova Conta
                    </button>
                }
            />

            {/* Campo de Busca e Botão Limpar Filtros */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nome ou número da conta..."
                    value={searchAccount}
                    onChange={(e) => setSearchAccount(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        background: 'white',
                    }}
                />
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: '14px 24px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        🗑️ Limpar Filtros
                    </button>
                )}
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.6)',
                overflowY: 'auto',
                overflowX: 'visible',
                height: '65vh',
                boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                position: 'relative',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 100 }}>
                        <tr>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '35%' }}>
                                Conta
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', position: 'relative', overflow: 'visible', width: '18%' }}>
                                <ColumnFilter
                                    label="Tipo"
                                    options={uniqueTypes}
                                    selected={selectedTypes}
                                    onChange={setSelectedTypes}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', position: 'relative', overflow: 'visible', width: '12%' }}>
                                <ColumnFilter
                                    label="Moeda"
                                    options={uniqueCurrencies}
                                    selected={selectedCurrencies}
                                    onChange={setSelectedCurrencies}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', position: 'relative', overflow: 'visible', width: '15%' }}>
                                <ColumnFilter
                                    label="Status"
                                    options={['active', 'inactive']}
                                    selected={selectedStatuses}
                                    onChange={setSelectedStatuses}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '20%' }}>
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Carregando...</td></tr>
                        ) : filteredAccounts.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma conta encontrada</td></tr>
                        ) : (
                            filteredAccounts.map(account => {
                                const typeColor = getTypeColor(account.account_type);
                                const displayNumber = account.account_number || account.wallet_address || '';
                                const accountDisplay = displayNumber ? `${account.name}${displayNumber}` : account.name;

                                return (
                                    <tr key={account.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>
                                            {accountDisplay}
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{
                                                background: typeColor.bg,
                                                color: typeColor.text,
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {account.account_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            <span style={{
                                                background: '#f1f5f9',
                                                color: '#475569',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                fontFamily: 'monospace'
                                            }}>
                                                {account.currency}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <span style={{
                                                background: account.is_active ? '#d1fae5' : '#fee2e2',
                                                color: account.is_active ? '#065f46' : '#991b1b',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {account.is_active ? '✓ Ativa' : '✗ Inativa'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {account.is_receiving_account && (
                                                    <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>RECEBIMENTO</span>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(account)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        background: 'white',
                                                        color: '#0ea5e9',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(account)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        background: 'white',
                                                        color: account.is_active ? '#dc2626' : '#16a34a',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {account.is_active ? '🚫' : '✓'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)',
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            (e.currentTarget as any)._startedOnOverlay = true;
                        } else {
                            (e.currentTarget as any)._startedOnOverlay = false;
                        }
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && (e.currentTarget as any)._startedOnOverlay) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            width: '90%',
                            maxWidth: '600px',
                            padding: '40px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                        }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
                            {editing ? '✏️ Editar Conta' : '➕ Nova Conta Bancária'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Tipo e Moeda */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Tipo *
                                        </label>
                                        <select
                                            value={formData.account_type}
                                            onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                            }}
                                        >
                                            <option value="Bank USA">Bank USA</option>
                                            <option value="Bank BR">Bank BR</option>
                                            <option value="Crypto">Crypto</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Cartao">Cartão</option>
                                            <option value="Gerencial">Gerencial</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Moeda *
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                            }}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="BRL">BRL</option>
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                            <option value="USDT">USDT</option>
                                            <option value="SOL">SOL</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Campos específicos para Bank USA */}
                                {formData.account_type === 'Bank USA' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                Nome * (ex: Bank Of America, Chase)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="Bank Of America"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                Número da Conta * (completo)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.full_account_number}
                                                onChange={e => {
                                                    const full = e.target.value;
                                                    const last4 = full.length >= 4 ? `••${full.slice(-4)}` : full;
                                                    setFormData({
                                                        ...formData,
                                                        full_account_number: full,
                                                        account_number: last4
                                                    });
                                                }}
                                                required
                                                placeholder="123456789012"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    outline: 'none',
                                                    fontFamily: 'monospace',
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                    Routing Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.routing_number}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                        const institution = raw.length === 9 ? lookupBankByRouting(raw) : '';
                                                        setFormData({
                                                            ...formData,
                                                            routing_number: raw,
                                                            ...(institution ? { institution } : {})
                                                        });
                                                    }}
                                                    required
                                                    placeholder="123456789"
                                                    maxLength={9}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #e2e8f0',
                                                        outline: 'none',
                                                        fontFamily: 'monospace',
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                    Instituição (auto)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.institution}
                                                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                                    placeholder="Auto-preenchido"
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #e2e8f0',
                                                        outline: 'none',
                                                        background: '#f8fafc',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Campos para outros tipos (não Bank USA) */}
                                {formData.account_type !== 'Bank USA' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                Nome *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder={formData.account_type === 'Crypto' ? 'Crypto Wallet' : 'Nome da conta'}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                    {formData.account_type === 'Crypto' ? 'Wallet Address' : 'Número da Conta'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.account_type === 'Crypto' ? formData.wallet_address : formData.account_number}
                                                    onChange={e => {
                                                        if (formData.account_type === 'Crypto') {
                                                            setFormData({ ...formData, wallet_address: e.target.value });
                                                        } else {
                                                            setFormData({ ...formData, account_number: e.target.value });
                                                        }
                                                    }}
                                                    placeholder={formData.account_type === 'Crypto' ? '0x...' : '••1234'}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #e2e8f0',
                                                        outline: 'none',
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                    {formData.account_type === 'Crypto' ? 'Blockchain' : 'Instituição'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.account_type === 'Crypto' ? formData.blockchain : formData.institution}
                                                    onChange={e => {
                                                        if (formData.account_type === 'Crypto') {
                                                            setFormData({ ...formData, blockchain: e.target.value });
                                                        } else {
                                                            setFormData({ ...formData, institution: e.target.value });
                                                        }
                                                    }}
                                                    placeholder={formData.account_type === 'Crypto' ? 'Bitcoin, Ethereum...' : 'Nome do banco'}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #e2e8f0',
                                                        outline: 'none',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                <div
                                    onClick={() => setFormData({ ...formData, is_receiving_account: !formData.is_receiving_account })}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: formData.is_receiving_account ? '2px solid #10b981' : '1px solid #e2e8f0',
                                        background: formData.is_receiving_account ? '#f0fdf4' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        border: '2px solid',
                                        borderColor: formData.is_receiving_account ? '#10b981' : '#cbd5e1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: formData.is_receiving_account ? '#10b981' : 'transparent',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}>
                                        {formData.is_receiving_account && '✓'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: formData.is_receiving_account ? '#065f46' : '#1e293b' }}>
                                            Disponível para Recebimento de Clientes
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                            Ative para que esta conta apareça como opção de pagamento nos documentos comerciais.
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            color: '#64748b',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: '#10b981',
                                            color: 'white',
                                            fontWeight: '700',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                        }}
                                    >
                                        {loading ? 'Salvando...' : (editing ? 'Atualizar' : 'Criar')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
