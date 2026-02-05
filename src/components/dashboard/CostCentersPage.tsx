'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import AddCostCenterModal from './AddCostCenterModal';
import ColumnFilter from '@/components/ui/ColumnFilter';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

interface CostCenter {
    id: string;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    created_at: string;
    deleted_at: string | null;
}

export default function CostCentersPage() {
    const supabase = useSupabase();
    const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CostCenter | null>(null);
    const [showDeleted, setShowDeleted] = useState(false);
    const [search, setSearch] = useState('');
    const { alert, confirm, toast } = useUI();

    // Excel-like column filters
    const [selectedNames, setSelectedNames] = useState<string[]>([]);
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    useEffect(() => {
        fetchData();
    }, [showDeleted]);

    const fetchData = async () => {
        setLoading(true);
        let query = supabase.from('cost_centers').select('*').order('name');

        if (showDeleted) {
            query = query.not('deleted_at', 'is', null);
        } else {
            query = query.is('deleted_at', null);
        }

        const { data } = await query;
        if (data) setCostCenters(data);
        setLoading(false);
    };

    const handleEdit = (item: CostCenter) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        const confirmed = await confirm(
            'Excluir Centro de Custo',
            `Deseja realmente excluir "${name}"?`,
            'danger'
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('cost_centers')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            await fetchData();
            toast.success('Centro de custo excluído com sucesso!');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: string, name: string) => {
        const confirmed = await confirm(
            'Restaurar Centro de Custo',
            `Deseja restaurar "${name}" para a lista de ativos?`,
            'info'
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('cost_centers')
                .update({ deleted_at: null })
                .eq('id', id);

            if (error) throw error;
            await fetchData();
            toast.success('Centro de custo restaurado!');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // Filter options
    const uniqueNames = useMemo(() => [...new Set(costCenters.map(cc => cc.name))].sort(), [costCenters]);
    const uniqueCodes = useMemo(() => [...new Set(costCenters.map(cc => cc.code))].sort(), [costCenters]);

    // Serializar para dependência estável (evita erro de mudança de tamanho de array no useEffect)
    const namesKey = uniqueNames.join(',');
    const codesKey = uniqueCodes.join(',');

    useEffect(() => {
        if (costCenters.length > 0) {
            if (!filtersInitialized) {
                setSelectedNames(uniqueNames);
                setSelectedCodes(uniqueCodes);
                setFiltersInitialized(true);
            } else {
                // Ao editar ou adicionar, garantir que novos nomes apareçam (não sumam pelo filtro)
                setSelectedNames(prev => {
                    const newItems = uniqueNames.filter(n => !prev.includes(n));
                    return newItems.length > 0 ? [...prev, ...newItems] : prev;
                });
                setSelectedCodes(prev => {
                    const newItems = uniqueCodes.filter(c => !prev.includes(c));
                    return newItems.length > 0 ? [...prev, ...newItems] : prev;
                });
            }
        }
    }, [namesKey, codesKey, filtersInitialized]);

    const filteredData = costCenters.filter(cc => {
        const matchesSearch = cc.name.toLowerCase().includes(search.toLowerCase()) ||
            cc.code.toLowerCase().includes(search.toLowerCase());
        const matchesName = selectedNames.includes(cc.name);
        const matchesCode = selectedCodes.includes(cc.code);
        return matchesSearch && matchesName && matchesCode;
    });

    const clearFilters = () => {
        setSelectedNames(uniqueNames);
        setSelectedCodes(uniqueCodes);
        setSearch('');
    };

    const hasActiveFilters =
        selectedNames.length !== uniqueNames.length ||
        selectedCodes.length !== uniqueCodes.length ||
        search !== '';

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Centros de Custo"
                description="Gerencie as divisões financeiras e departamentos da empresa"
                icon="💼"
                breadcrumbs={[
                    { label: 'FINANCEIRO', href: '/finance', color: '#059669' },
                    { label: 'CENTROS DE CUSTO', color: '#059669' },
                ]}
                moduleColor="#059669"
                actions={
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setShowDeleted(!showDeleted)}
                            style={{
                                background: showDeleted ? '#64748b' : 'white',
                                color: showDeleted ? 'white' : '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '14px 24px',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: 'pointer',
                            }}
                        >
                            {showDeleted ? 'Ver Ativos' : 'Ver Lixeira'}
                        </button>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setIsModalOpen(true);
                            }}
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
                            + Novo Centro de Custo
                        </button>
                    </div>
                }
            />

            {/* Toolbar */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Buscar pelo nome ou código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 100 }}>
                        <tr>
                            <th style={{ padding: '16px 24px', textAlign: 'left', width: '35%' }}>
                                <ColumnFilter
                                    label="NOME"
                                    options={uniqueNames}
                                    selected={selectedNames}
                                    onChange={setSelectedNames}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', width: '15%' }}>
                                <ColumnFilter
                                    label="CÓDIGO"
                                    options={uniqueCodes}
                                    selected={selectedCodes}
                                    onChange={setSelectedCodes}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', width: '30%' }}>DESCRIÇÃO</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', width: '10%' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', width: '10%' }}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Carregando...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum centro de custo encontrado.</td></tr>
                        ) : (
                            filteredData.map((cc) => (
                                <tr key={cc.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '18px 24px', fontWeight: '700', color: '#1e293b' }}>{cc.name}</td>
                                    <td style={{ padding: '18px 24px' }}>
                                        <span style={{
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '800'
                                        }}>
                                            {cc.code}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px', color: '#64748b', fontSize: '13px' }}>{cc.description || '-'}</td>
                                    <td style={{ padding: '18px 24px' }}>
                                        <span style={{
                                            background: cc.is_active ? '#dcfce7' : '#fee2e2',
                                            color: cc.is_active ? '#166534' : '#991b1b',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}>
                                            {cc.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                        {!showDeleted ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', opacity: 0.7 }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(cc);
                                                    }}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(cc.id, cc.name);
                                                    }}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRestore(cc.id, cc.name);
                                                }}
                                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #10b981', color: '#10b981', background: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Restaurar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddCostCenterModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onSuccess={fetchData}
                costCenter={editingItem || undefined}
            />
        </div>
    );
}
