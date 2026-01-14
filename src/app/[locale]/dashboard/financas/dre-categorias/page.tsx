'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';

interface DRECategory {
    id: string;
    name: string;
    category_type: string;
    display_order: number;
    is_subtotal: boolean;
    is_total: boolean;
    active: boolean;
}

export default function DRECategoriesPage() {
    const supabase = useSupabase();
    const { alert, confirm } = useUI();
    const t = useTranslations('Dashboard.Financial');
    const tCommon = useTranslations('Dashboard.Common');

    const [categories, setCategories] = useState<DRECategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<DRECategory | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category_type: 'expense',
        display_order: 0,
        is_subtotal: false,
        is_total: false,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('dre_categories')
            .select('*')
            .is('deleted_at', null)
            .order('display_order');

        if (data) setCategories(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editing) {
                const { error } = await supabase
                    .from('dre_categories')
                    .update(formData)
                    .eq('id', editing.id);
                if (error) throw error;
                await alert('Sucesso', 'Categoria DRE atualizada!', 'success');
            } else {
                const { error } = await supabase
                    .from('dre_categories')
                    .insert({ ...formData, active: true });
                if (error) throw error;
                await alert('Sucesso', 'Categoria DRE criada!', 'success');
            }
            await fetchCategories();
            closeModal();
        } catch (error: any) {
            await alert('Erro', error.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat: DRECategory) => {
        setEditing(cat);
        setFormData({
            name: cat.name,
            category_type: cat.category_type,
            display_order: cat.display_order,
            is_subtotal: cat.is_subtotal,
            is_total: cat.is_total,
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (cat: DRECategory) => {
        const confirmed = await confirm(
            'Confirmar',
            `Deseja ${cat.active ? 'desativar' : 'ativar'} "${cat.name}"?`,
            'danger'
        );
        if (!confirmed) return;

        const { error } = await supabase
            .from('dre_categories')
            .update({ active: !cat.active })
            .eq('id', cat.id);

        if (!error) {
            await fetchCategories();
            await alert('Sucesso', 'Status atualizado!', 'success');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setFormData({ name: '', category_type: 'expense', display_order: 0, is_subtotal: false, is_total: false });
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'revenue': { bg: '#d1fae5', text: '#065f46' },
            'expense': { bg: '#fee2e2', text: '#991b1b' },
            'calculation': { bg: '#dbeafe', text: '#1e40af' },
            'neutral': { bg: '#f1f5f9', text: '#475569' },
        };
        return colors[type] || colors['neutral'];
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b' }}>
                📋 <a href="/dashboard/registration" style={{ fontWeight: '600', color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}>{t('breadcrumb')}</a> › {t('dre.title')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>
                        📈 {t('dre.title')}
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>
                        {t('dre.description')}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
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
                    }}
                >
                    {t('dre.newButton')}
                </button>
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
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '8%' }}>
                                {t('dre.table.order')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '30%' }}>
                                {t('dre.table.name')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '15%' }}>
                                {t('dre.table.type')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '10%' }}>
                                {t('dre.table.subtotal')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '10%' }}>
                                {t('dre.table.total')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '12%' }}>
                                {t('dre.table.status')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', width: '15%' }}>
                                {t('dre.table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>Carregando...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma categoria encontrada</td></tr>
                        ) : (
                            categories.map(cat => {
                                const typeColor = getTypeColor(cat.category_type);
                                return (
                                    <tr key={cat.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <td style={{ padding: '18px 24px', fontSize: '14px' }}>
                                            <span style={{ fontWeight: '700', color: '#0ea5e9' }}>{cat.display_order}</span>
                                        </td>
                                        <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>
                                            {cat.name}
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
                                                {cat.category_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            {cat.is_subtotal && <span style={{ fontSize: '18px' }}>✓</span>}
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                                            {cat.is_total && <span style={{ fontSize: '18px' }}>✓</span>}
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <span style={{
                                                background: cat.active ? '#d1fae5' : '#fee2e2',
                                                color: cat.active ? '#065f46' : '#991b1b',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {cat.active ? t('groups.status.active') : t('groups.status.inactive')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(cat)}
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
                                                    onClick={() => handleToggle(cat)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        background: 'white',
                                                        color: cat.active ? '#dc2626' : '#16a34a',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {cat.active ? '🚫' : '✓'}
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
                            maxWidth: '500px',
                            padding: '32px',
                        }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
                            {editing ? t('dre.modal.edit') : t('dre.modal.new')}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        {t('dre.modal.name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
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
                                        {t('dre.modal.type')}
                                    </label>
                                    <select
                                        value={formData.category_type}
                                        onChange={e => setFormData({ ...formData, category_type: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="revenue">Revenue (Receita)</option>
                                        <option value="expense">Expense (Despesa)</option>
                                        <option value="calculation">Calculation (Cálculo)</option>
                                        <option value="neutral">Neutral</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        {t('dre.modal.order')}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_subtotal}
                                            onChange={e => setFormData({ ...formData, is_subtotal: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '14px' }}>{t('dre.modal.isSubtotal')}</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_total}
                                            onChange={e => setFormData({ ...formData, is_total: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '14px' }}>{t('dre.modal.isTotal')}</span>
                                    </label>
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
                                        {loading ? tCommon('loading') : (editing ? tCommon('edit') : tCommon('save'))}
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
