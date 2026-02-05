'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';

interface Bank {
    id: string;
    routing_number: string;
    name: string;
    country: string;
    swift_code: string | null;
    is_active: boolean;
}

export default function BankManagement() {
    const supabase = useSupabase();
    const { alert, confirm, toast } = useUI();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        routing_number: '',
        name: '',
        country: 'US',
        swift_code: '',
    });

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('banks')
            .select('*')
            .is('deleted_at', null)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching banks:', error);
        } else {
            setBanks(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingBank) {
                const { error } = await supabase
                    .from('banks')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingBank.id);
                if (error) throw error;
                toast.success('Banco atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('banks').insert([formData]);
                if (error) throw error;
                await alert('Sucesso', 'Banco cadastrado com sucesso!', 'success');
            }
            setIsModalOpen(false);
            setEditingBank(null);
            setFormData({ routing_number: '', name: '', country: 'US', swift_code: '' });
            fetchBanks();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bank: Bank) => {
        const confirmed = await confirm(
            'Excluir Banco',
            `Tem certeza que deseja excluir o banco "${bank.name}"?`,
            'danger'
        );
        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('banks')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', bank.id);
            if (error) throw error;
            await alert('Sucesso', 'Banco excluído com sucesso!', 'success');
            fetchBanks();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        }
    };

    const openModal = (bank: Bank | null = null) => {
        if (bank) {
            setEditingBank(bank);
            setFormData({
                routing_number: bank.routing_number,
                name: bank.name,
                country: bank.country,
                swift_code: bank.swift_code || '',
            });
        } else {
            setEditingBank(null);
            setFormData({ routing_number: '', name: '', country: 'US', swift_code: '' });
        }
        setIsModalOpen(true);
    };

    const filteredBanks = banks.filter(
        b =>
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.routing_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        marginBottom: '8px',
        textTransform: 'uppercase',
    };

    return (
        <div style={{ padding: '20px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                }}
            >
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        🏦 Gestão de Bancos
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>
                        Configure Routing Numbers para identificação automática no cadastro de agentes.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                    }}
                >
                    + Novo Banco
                </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou routing number..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        ...inputStyle,
                        maxWidth: '500px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                />
            </div>

            <div
                style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                                ROUTING #
                            </th>
                            <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                                NOME DO BANCO
                            </th>
                            <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                                PAÍS
                            </th>
                            <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                                AÇÕES
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Carregando bancos...
                                </td>
                            </tr>
                        ) : filteredBanks.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Nenhum banco encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredBanks.map(bank => (
                                <tr key={bank.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#1e293b' }}>
                                        {bank.routing_number}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#475569' }}>{bank.name}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span
                                            style={{
                                                padding: '4px 8px',
                                                background: bank.country === 'US' ? '#eff6ff' : '#ecfdf5',
                                                color: bank.country === 'US' ? '#3b82f6' : '#10b981',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                            }}
                                        >
                                            {bank.country === 'US' ? '🇺🇸 USA' : '🇧🇷 BR'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => openModal(bank)}
                                                style={{
                                                    background: '#f1f5f9',
                                                    border: 'none',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bank)}
                                                style={{
                                                    background: '#fff1f2',
                                                    border: 'none',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '500px',
                            padding: '32px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1e293b' }}>
                            {editingBank ? 'Editar Banco' : 'Novo Banco'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Routing Number / ABA <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={formData.routing_number}
                                    onChange={e =>
                                        setFormData({ ...formData, routing_number: e.target.value.replace(/\D/g, '').slice(0, 9) })
                                    }
                                    style={inputStyle}
                                    placeholder="Ex: 021000021"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Nome do Banco <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: JPMorgan Chase"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>País</label>
                                    <select
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="US">🇺🇸 Estados Unidos</option>
                                        <option value="BR">🇧🇷 Brasil</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>SWIFT (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.swift_code}
                                        onChange={e => setFormData({ ...formData, swift_code: e.target.value })}
                                        style={inputStyle}
                                        placeholder="CHASUS33"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        background: 'white',
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
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                        color: 'white',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {loading ? 'Salvando...' : 'Salvar Banco'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
