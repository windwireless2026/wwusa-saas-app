'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import ColumnFilter from '@/components/ui/ColumnFilter';

interface FinancialClass {
    id: string;
    account_code: string;
    name: string;
    account_type: string;
    account_subtype: string;
    normal_balance: string;
    level: number;
    is_summary: boolean;
    is_contra: boolean;
    parent_account_id: string | null;
    active: boolean;
}

export default function ChartOfAccountsPage() {
    const supabase = useSupabase();
    const { alert, confirm } = useUI();

    const [accounts, setAccounts] = useState<FinancialClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<FinancialClass | null>(null);

    // Filtros
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
    const [selectedBalances, setSelectedBalances] = useState<string[]>([]);
    const [showInactiveAccounts, setShowInactiveAccounts] = useState(false);
    const [searchAccount, setSearchAccount] = useState('');
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        account_code: '',
        name: '',
        account_type: 'Expense',
        account_subtype: '',
        normal_balance: 'Debit',
        parent_account_id: '',
        is_contra: false,
        level: 1,
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('financial_classes')
            .select('*')
            .not('account_code', 'is', null)
            .is('deleted_at', null)
            .order('account_code');

        if (data) setAccounts(data);
        setLoading(false);
    };

    // Valores únicos para filtros
    const uniqueTypes = useMemo(
        () => [...new Set(accounts.map(a => a.account_type))].sort(),
        [accounts]
    );
    const uniqueSubtypes = useMemo(
        () => [...new Set(accounts.map(a => a.account_subtype))].sort(),
        [accounts]
    );
    const uniqueBalances = useMemo(
        () => [...new Set(accounts.map(a => a.normal_balance))].sort(),
        [accounts]
    );

    // Inicializar filtros
    useEffect(() => {
        if (accounts.length > 0 && !filtersInitialized) {
            setSelectedTypes(uniqueTypes);
            setSelectedSubtypes(uniqueSubtypes);
            setSelectedBalances(uniqueBalances);
            setFiltersInitialized(true);
        }
    }, [accounts.length, filtersInitialized, uniqueTypes, uniqueSubtypes, uniqueBalances]);

    // Filtrar accounts
    const filteredAccounts = accounts.filter(a => {
        const matchesType = selectedTypes.includes(a.account_type);
        const matchesSubtype = selectedSubtypes.includes(a.account_subtype);
        const matchesBalance = selectedBalances.includes(a.normal_balance);
        const matchesActive = showInactiveAccounts || a.active;
        const matchesSearch = a.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
            (a.account_code || '').toLowerCase().includes(searchAccount.toLowerCase());

        return matchesType && matchesSubtype && matchesBalance && matchesActive && matchesSearch;
    });

    const clearFilters = () => {
        setSelectedTypes(uniqueTypes);
        setSelectedSubtypes(uniqueSubtypes);
        setSelectedBalances(uniqueBalances);
        setSearchAccount('');
    };

    const hasActiveFilters =
        selectedTypes.length !== uniqueTypes.length ||
        selectedSubtypes.length !== uniqueSubtypes.length ||
        selectedBalances.length !== uniqueBalances.length ||
        searchAccount !== '';

    const getTypeColor = (type: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'Asset': { bg: '#dbeafe', text: '#1e40af' },
            'Liability': { bg: '#fee2e2', text: '#991b1b' },
            'Equity': { bg: '#fef3c7', text: '#92400e' },
            'Revenue': { bg: '#d1fae5', text: '#065f46' },
            'Expense': { bg: '#f3e8ff', text: '#6b21a8' },
        };
        return colors[type] || { bg: '#f1f5f9', text: '#475569' };
    };

    const handleEdit = (account: FinancialClass) => {
        setEditingAccount(account);
        setFormData({
            account_code: account.account_code,
            name: account.name,
            account_type: account.account_type,
            account_subtype: account.account_subtype,
            normal_balance: account.normal_balance,
            parent_account_id: account.parent_account_id || '',
            is_contra: account.is_contra,
            level: account.level,
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingAccount) {
                const { error } = await supabase
                    .from('financial_classes')
                    .update({
                        account_code: formData.account_code,
                        name: formData.name,
                        account_type: formData.account_type,
                        account_subtype: formData.account_subtype,
                        normal_balance: formData.normal_balance,
                        parent_account_id: formData.parent_account_id || null,
                        is_contra: formData.is_contra,
                        level: formData.level,
                    })
                    .eq('id', editingAccount.id);

                if (error) throw error;
                await alert('Sucesso', 'Conta atualizada com sucesso!', 'success');
            } else {
                const { error } = await supabase
                    .from('financial_classes')
                    .insert({
                        account_code: formData.account_code,
                        name: formData.name,
                        account_type: formData.account_type,
                        account_subtype: formData.account_subtype,
                        normal_balance: formData.normal_balance,
                        parent_account_id: formData.parent_account_id || null,
                        is_contra: formData.is_contra,
                        level: formData.level,
                        is_summary: false,
                        active: true,
                    });

                if (error) throw error;
                await alert('Sucesso', 'Conta criada com sucesso!', 'success');
            }

            await fetchAccounts();
            closeModal();
        } catch (error: any) {
            await alert('Erro', error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (account: FinancialClass) => {
        const confirmed = await confirm(
            account.active ? 'Desativar Conta' : 'Ativar Conta',
            `Tem certeza que deseja ${account.active ? 'desativar' : 'ativar'} a conta "${account.name}"?`,
            'danger'
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('financial_classes')
                .update({ active: !account.active })
                .eq('id', account.id);

            if (error) throw error;
            await fetchAccounts();
            await alert('Sucesso', `Conta ${account.active ? 'desativada' : 'ativada'} com sucesso!`, 'success');
        } catch (error: any) {
            await alert('Erro', error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditingAccount(null);
        setFormData({
            account_code: '',
            name: '',
            account_type: 'Expense',
            account_subtype: '',
            normal_balance: 'Debit',
            parent_account_id: '',
            is_contra: false,
            level: 1,
        });
    };

    const thStyle: React.CSSProperties = {
        padding: '16px 24px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
    };

    const cellStyle: React.CSSProperties = {
        padding: '12px 24px',
        fontSize: '14px',
        color: '#334155',
        borderBottom: '1px solid rgba(0,0,0,0.03)',
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
                📋 <a href="/dashboard/registration" style={{ fontWeight: '600', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}>Cadastro</a> › Plano de Contas
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        📊 Chart of Accounts
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
                        Wind Wireless LLC - GAAP Compliant
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditingAccount(null);
                        setIsAddModalOpen(true);
                    }}
                    style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 28px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <span style={{ fontSize: '20px' }}>+</span> Nova Conta
                </button>
            </div>

            {/* Search and Clear Filters */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nome ou código da conta..."
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

            {/* Toggle inactive */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: 'fit-content' }}>
                    <input
                        type="checkbox"
                        checked={showInactiveAccounts}
                        onChange={(e) => setShowInactiveAccounts(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Mostrar contas inativas</span>
                </label>
            </div>

            {/* Table */}
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
                    <thead style={{ position: 'sticky', top: 0, zIndex: 60, background: '#f8fafc' }}>
                        <tr>
                            <th style={{ ...thStyle, width: '10%' }}>Código</th>
                            <th style={{ ...thStyle, textAlign: 'left', width: '25%' }}>Nome da Conta</th>
                            <th style={{ ...thStyle, width: '15%' }}>
                                <ColumnFilter
                                    label="Tipo"
                                    options={uniqueTypes}
                                    selected={selectedTypes}
                                    onChange={setSelectedTypes}
                                />
                            </th>
                            <th style={{ ...thStyle, width: '15%' }}>
                                <ColumnFilter
                                    label="Subtipo"
                                    options={uniqueSubtypes}
                                    selected={selectedSubtypes}
                                    onChange={setSelectedSubtypes}
                                />
                            </th>
                            <th style={{ ...thStyle, width: '10%' }}>
                                <ColumnFilter
                                    label="Balanc."
                                    options={uniqueBalances}
                                    selected={selectedBalances}
                                    onChange={setSelectedBalances}
                                />
                            </th>
                            <th style={{ ...thStyle, textAlign: 'right', width: '10%' }}>Status</th>
                            <th style={{ ...thStyle, textAlign: 'right', width: '15%' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                                    Carregando...
                                </td>
                            </tr>
                        ) : filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Nenhuma conta encontrada
                                </td>
                            </tr>
                        ) : (
                            filteredAccounts.map(account => {
                                const indent = (account.level - 1) * 24;
                                const typeColor = getTypeColor(account.account_type);

                                return (
                                    <tr key={account.id} style={{
                                        background: account.is_summary ? '#fafafa' : 'white',
                                        opacity: account.active ? 1 : 0.5,
                                    }}>
                                        <td style={cellStyle}>
                                            <span style={{
                                                fontFamily: 'monospace',
                                                fontWeight: '700',
                                                fontSize: '13px',
                                                color: account.is_summary ? '#0ea5e9' : '#334155'
                                            }}>
                                                {account.account_code}
                                            </span>
                                        </td>
                                        <td style={{ ...cellStyle, paddingLeft: `${24 + indent}px` }}>
                                            <span style={{
                                                fontWeight: account.is_summary ? '700' : '600',
                                                fontSize: account.level === 1 ? '15px' : '14px',
                                            }}>
                                                {account.name}
                                            </span>
                                            {account.is_summary && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '11px',
                                                    color: '#94a3b8',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '600'
                                                }}>
                                                    (Summary)
                                                </span>
                                            )}
                                            {account.is_contra && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '11px',
                                                    background: '#fee2e2',
                                                    color: '#991b1b',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: '600'
                                                }}>
                                                    CONTRA
                                                </span>
                                            )}
                                        </td>
                                        <td style={cellStyle}>
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
                                        <td style={cellStyle}>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                                                {account.account_subtype}
                                            </span>
                                        </td>
                                        <td style={cellStyle}>
                                            <span style={{
                                                background: account.normal_balance === 'Debit' ? '#dbeafe' : '#fef3c7',
                                                color: account.normal_balance === 'Debit' ? '#1e40af' : '#92400e',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {account.normal_balance === 'Debit' ? 'DR' : 'CR'}
                                            </span>
                                        </td>
                                        <td style={{ ...cellStyle, textAlign: 'right' }}>
                                            <span style={{
                                                background: account.active ? '#d1fae5' : '#fee2e2',
                                                color: account.active ? '#065f46' : '#991b1b',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {account.active ? '✓ Ativa' : '✗ Inativa'}
                                            </span>
                                        </td>
                                        <td style={{ ...cellStyle, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                                                {!account.is_summary && (
                                                    <button
                                                        onClick={() => handleToggleActive(account)}
                                                        style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e2e8f0',
                                                            background: 'white',
                                                            color: account.active ? '#dc2626' : '#16a34a',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {account.active ? '🚫' : '✓'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal - Similar ao anterior, simplificado para brevidade */}
            {isAddModalOpen && (
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
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            padding: '32px',
                        }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
                            {editingAccount ? '✏️ Editar Conta' : '➕ Nova Conta'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Account Code */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Código da Conta *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.account_code}
                                        onChange={e => setFormData({ ...formData, account_code: e.target.value })}
                                        required
                                        placeholder="Ex: 6999"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>

                                {/* Name */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Nome da Conta *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Ex: Office Equipment"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>

                                {/* Account Type */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Tipo de Conta *
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
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="Asset">Asset</option>
                                        <option value="Liability">Liability</option>
                                        <option value="Equity">Equity</option>
                                        <option value="Revenue">Revenue</option>
                                        <option value="Expense">Expense</option>
                                    </select>
                                </div>

                                {/* Normal Balance */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Normal Balance *
                                    </label>
                                    <select
                                        value={formData.normal_balance}
                                        onChange={e => setFormData({ ...formData, normal_balance: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="Debit">Debit</option>
                                        <option value="Credit">Credit</option>
                                    </select>
                                </div>

                                {/* Contra Account Checkbox */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_contra}
                                        onChange={e => setFormData({ ...formData, is_contra: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '14px' }}>Conta Contra (ex: Accumulated Depreciation)</span>
                                </label>

                                {/* Buttons */}
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
                                        {loading ? 'Salvando...' : (editingAccount ? 'Atualizar' : 'Criar')}
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
