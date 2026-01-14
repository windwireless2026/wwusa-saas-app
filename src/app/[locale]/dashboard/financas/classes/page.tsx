'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';
import { useUI } from '@/context/UIContext';
import ColumnFilter from '@/components/ui/ColumnFilter';

interface FinancialClass {
    id: string;
    name: string;
    group_id: string;
    dre_category_id: string;
    capital_flow_category_id: string;
    subcategory: string | null;
    description: string | null;
    is_tax_deductible: boolean;
    requires_approval: boolean;
    active: boolean;
    created_at: string;

    // Relacionamentos
    group?: { id: string; name: string };
    dre_category?: { id: string; name: string };
    capital_flow_category?: { id: string; name: string };
}

interface FinancialGroup {
    id: string;
    name: string;
}

interface DRECategory {
    id: string;
    name: string;
}

interface CapitalFlowCategory {
    id: string;
    name: string;
}

export default function FinancialClassesPage() {
    const supabase = useSupabase();
    const t = useTranslations('Dashboard.Financial');
    const tCommon = useTranslations('Dashboard.Common');
    const { alert, confirm } = useUI();

    const [classes, setClasses] = useState<FinancialClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<FinancialClass | null>(null);

    // Dados para os dropdowns do modal
    const [groups, setGroups] = useState<FinancialGroup[]>([]);
    const [dreCategories, setDRECategories] = useState<DRECategory[]>([]);
    const [capitalFlowCategories, setCapitalFlowCategories] = useState<CapitalFlowCategory[]>([]);

    // Filtros Excel
    const [selectedNames, setSelectedNames] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedDRE, setSelectedDRE] = useState<string[]>([]);
    const [selectedCapital, setSelectedCapital] = useState<string[]>([]);
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        group_id: '',
        dre_category_id: '',
        capital_flow_category_id: '',
        subcategory: '',
        description: '',
        is_tax_deductible: true,
        requires_approval: false,
    });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([
            fetchClasses(),
            fetchGroups(),
            fetchDRECategories(),
            fetchCapitalFlowCategories(),
        ]);
        setLoading(false);
    };

    const fetchClasses = async () => {
        const { data } = await supabase
            .from('financial_classes')
            .select(`
        *,
        group:financial_groups(id, name),
        dre_category:dre_categories(id, name),
        capital_flow_category:capital_flow_categories(id, name)
      `)
            .is('deleted_at', null)
            .order('name');

        if (data) setClasses(data as any);
    };

    const fetchGroups = async () => {
        const { data } = await supabase
            .from('financial_groups')
            .select('id, name')
            .is('deleted_at', null)
            .eq('active', true)
            .order('name');

        if (data) setGroups(data);
    };

    const fetchDRECategories = async () => {
        const { data } = await supabase
            .from('dre_categories')
            .select('id, name')
            .is('deleted_at', null)
            .eq('active', true)
            .order('name');

        if (data) setDRECategories(data);
    };

    const fetchCapitalFlowCategories = async () => {
        const { data } = await supabase
            .from('capital_flow_categories')
            .select('id, name')
            .is('deleted_at', null)
            .eq('active', true)
            .order('name');

        if (data) setCapitalFlowCategories(data);
    };

    // Valores únicos para filtros
    const uniqueNames = useMemo(
        () => [...new Set(classes.map(c => c.name))].sort(),
        [classes]
    );
    const uniqueGroups = useMemo(
        () => [...new Set(classes.map(c => c.group?.name || '-'))].sort(),
        [classes]
    );
    const uniqueDRE = useMemo(
        () => [...new Set(classes.map(c => c.dre_category?.name || '-'))].sort(),
        [classes]
    );
    const uniqueCapital = useMemo(
        () => [...new Set(classes.map(c => c.capital_flow_category?.name || '-'))].sort(),
        [classes]
    );

    // Inicializar filtros
    useEffect(() => {
        if (classes.length > 0 && !filtersInitialized) {
            setSelectedNames(uniqueNames);
            setSelectedGroups(uniqueGroups);
            setSelectedDRE(uniqueDRE);
            setSelectedCapital(uniqueCapital);
            setFiltersInitialized(true);
        }
    }, [classes.length, filtersInitialized, uniqueNames, uniqueGroups, uniqueDRE, uniqueCapital]);

    // Filtrar classes
    const filteredClasses = classes.filter(c => {
        const matchesName = selectedNames.includes(c.name);
        const matchesGroup = selectedGroups.includes(c.group?.name || '-');
        const matchesDRE = selectedDRE.includes(c.dre_category?.name || '-');
        const matchesCapital = selectedCapital.includes(c.capital_flow_category?.name || '-');

        return matchesName && matchesGroup && matchesDRE && matchesCapital;
    });

    const clearFilters = () => {
        setSelectedNames(uniqueNames);
        setSelectedGroups(uniqueGroups);
        setSelectedDRE(uniqueDRE);
        setSelectedCapital(uniqueCapital);
    };

    const hasActiveFilters =
        selectedNames.length !== uniqueNames.length ||
        selectedGroups.length !== uniqueGroups.length ||
        selectedDRE.length !== uniqueDRE.length ||
        selectedCapital.length !== uniqueCapital.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingClass) {
                // Update
                const { error } = await supabase
                    .from('financial_classes')
                    .update({
                        name: formData.name,
                        group_id: formData.group_id || null,
                        dre_category_id: formData.dre_category_id || null,
                        capital_flow_category_id: formData.capital_flow_category_id || null,
                        subcategory: formData.subcategory || null,
                        description: formData.description || null,
                        is_tax_deductible: formData.is_tax_deductible,
                        requires_approval: formData.requires_approval,
                    })
                    .eq('id', editingClass.id);

                if (error) throw error;
                await alert('Sucesso', 'Classe atualizada com sucesso!', 'success');
            } else {
                // Insert
                const { error } = await supabase
                    .from('financial_classes')
                    .insert({
                        name: formData.name,
                        group_id: formData.group_id || null,
                        dre_category_id: formData.dre_category_id || null,
                        capital_flow_category_id: formData.capital_flow_category_id || null,
                        subcategory: formData.subcategory || null,
                        description: formData.description || null,
                        is_tax_deductible: formData.is_tax_deductible,
                        requires_approval: formData.requires_approval,
                    });

                if (error) throw error;
                await alert('Sucesso', 'Classe criada com sucesso!', 'success');
            }

            await fetchClasses();
            closeModal();
        } catch (error: any) {
            await alert('Erro', error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (classItem: FinancialClass) => {
        setEditingClass(classItem);
        setFormData({
            name: classItem.name,
            group_id: classItem.group_id || '',
            dre_category_id: classItem.dre_category_id || '',
            capital_flow_category_id: classItem.capital_flow_category_id || '',
            subcategory: classItem.subcategory || '',
            description: classItem.description || '',
            is_tax_deductible: classItem.is_tax_deductible,
            requires_approval: classItem.requires_approval,
        });
        setIsAddModalOpen(true);
    };

    const handleToggleActive = async (classItem: FinancialClass) => {
        const confirmed = await confirm(
            classItem.active ? 'Desativar Classe' : 'Ativar Classe',
            `Tem certeza que deseja ${classItem.active ? 'desativar' : 'ativar'} a classe "${classItem.name}"?`,
            'danger'
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('financial_classes')
                .update({ active: !classItem.active })
                .eq('id', classItem.id);

            if (error) throw error;
            await fetchClasses();
            await alert(tCommon('success'), tCommon('saved'), 'success');
        } catch (error: any) {
            await alert('Erro', error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditingClass(null);
        setFormData({
            name: '',
            group_id: '',
            dre_category_id: '',
            capital_flow_category_id: '',
            subcategory: '',
            description: '',
            is_tax_deductible: true,
            requires_approval: false,
        });
    };

    // Estilos da tabela
    const thStyle = {
        padding: '16px 24px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase' as const,
        textAlign: 'left' as const,
        background: '#f8fafc',
        position: 'relative' as const,
        overflow: 'visible' as const,
    };

    const cellStyle = {
        padding: '18px 24px',
        fontSize: '14px',
        color: '#334155',
        borderBottom: '1px solid rgba(0,0,0,0.03)',
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
                📋 <a href="/dashboard/registration" style={{ fontWeight: '600', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}>Cadastro</a> › Classes
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        💰 Classes Financeiras
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
                        Gerencie as classificações financeiras do sistema
                        {t('classes.description')}
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
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
                    <span style={{ fontSize: '20px' }}>+</span> {t('classes.newButton')}
                </button>
            </div>

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {tCommon('clearFilters')}
                    </button>
                </div>
            )}

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
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ ...thStyle, width: '20%' }}>
                                <ColumnFilter
                                    label={t('classes.table.name')}
                                    options={uniqueNames}
                                    selected={selectedNames}
                                    onChange={setSelectedNames}
                                />
                            </th>
                            <th style={{ ...thStyle, width: '15%' }}>
                                <ColumnFilter
                                    label={t('classes.table.group')}
                                    options={uniqueGroups}
                                    selected={selectedGroups}
                                    onChange={setSelectedGroups}
                                />
                            </th>
                            <th style={{ ...thStyle, width: '15%' }}>
                                <ColumnFilter
                                    label={t('classes.table.dre')}
                                    options={uniqueDRE}
                                    selected={selectedDRE}
                                    onChange={setSelectedDRE}
                                />
                            </th>
                            <th style={{ ...thStyle, width: '15%' }}>
                                <ColumnFilter
                                    label={t('classes.table.capital')}
                                    options={uniqueCapital}
                                    selected={selectedCapital}
                                    onChange={setSelectedCapital}
                                />
                            </th>
                            <th style={{ ...thStyle, width: '10%' }}>{tCommon('subcategory')}</th>
                            <th style={{ ...thStyle, textAlign: 'right', width: '10%' }}>{t('classes.table.status')}</th>
                            <th style={{ ...thStyle, textAlign: 'right', width: '15%' }}>{t('classes.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                                    Carregando...
                                </td>
                            </tr>
                        ) : filteredClasses.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    {tCommon('noRecords')}
                                </td>
                            </tr>
                        ) : (
                            filteredClasses.map(classItem => (
                                <tr key={classItem.id}>
                                    <td style={cellStyle}>
                                        <span style={{ fontWeight: '600' }}>{classItem.name}</span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            background: '#f1f5f9',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#475569'
                                        }}>
                                            {classItem.group?.name || '-'}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            background: '#fef3c7',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#92400e'
                                        }}>
                                            {classItem.dre_category?.name || '-'}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            background: '#dbeafe',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#1e40af'
                                        }}>
                                            {classItem.capital_flow_category?.name || '-'}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                                            {classItem.subcategory || '-'}
                                        </span>
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <span style={{
                                            background: classItem.active ? '#d1fae5' : '#fee2e2',
                                            color: classItem.active ? '#065f46' : '#991b1b',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {classItem.active ? '✓ Ativo' : '✗ Inativo'}
                                        </span>
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleEdit(classItem)}
                                                style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    color: '#0ea5e9',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(classItem)}
                                                style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    color: classItem.active ? '#dc2626' : '#16a34a',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {classItem.active ? '🚫 Desativar' : '✓ Ativar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
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
                        }}
                    >
                        <div style={{ padding: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
                                {editingClass ? t('classes.modal.edit') : t('classes.modal.new')}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Nome */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            {t('classes.modal.name')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Ex: Aluguel Escritório"
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

                                    {/* Grupo */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            {t('classes.modal.group')}
                                        </label>
                                        <select
                                            value={formData.group_id}
                                            onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                                fontSize: '14px',
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* DRE */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            {t('classes.modal.dre')}
                                        </label>
                                        <select
                                            value={formData.dre_category_id}
                                            onChange={e => setFormData({ ...formData, dre_category_id: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                                fontSize: '14px',
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            {dreCategories.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Batimento Capital */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            {t('classes.modal.capital')}
                                        </label>
                                        <select
                                            value={formData.capital_flow_category_id}
                                            onChange={e => setFormData({ ...formData, capital_flow_category_id: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                outline: 'none',
                                                fontSize: '14px',
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            {capitalFlowCategories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subcategoria */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            {tCommon('subcategory')}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subcategory}
                                            onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                            placeholder="Ex: Office Expenses:Rent"
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

                                    {/* Checkboxes */}
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_tax_deductible}
                                                onChange={e => setFormData({ ...formData, is_tax_deductible: e.target.checked })}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '14px' }}>{t('classes.modal.taxDeductible')}</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.requires_approval}
                                                onChange={e => setFormData({ ...formData, requires_approval: e.target.checked })}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '14px' }}>{t('classes.modal.requiresApproval')}</span>
                                        </label>
                                    </div>

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
                                            {loading ? tCommon('loading') : (editingClass ? tCommon('edit') : tCommon('save'))}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
