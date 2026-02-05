'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';
import { getErrorMessage } from '@/lib/errors';

interface FinancialGroup {
    id: string;
    name: string;
    description: string | null;
    display_order: number;
    active: boolean;
}

export default function FinancialGroupsPage() {
    const supabase = useSupabase();
    const { alert, confirm, toast } = useUI();
    const t = useTranslations('Dashboard.Financial');
    const tCommon = useTranslations('Dashboard.Common');

    const [groups, setGroups] = useState<FinancialGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<FinancialGroup | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        display_order: 0,
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('financial_groups')
            .select('*')
            .is('deleted_at', null)
            .order('display_order');

        if (data) setGroups(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editing) {
                const { error } = await supabase
                    .from('financial_groups')
                    .update(formData)
                    .eq('id', editing.id);
                if (error) throw error;
                await alert('Sucesso', 'Grupo atualizado!', 'success');
            } else {
                const { error } = await supabase
                    .from('financial_groups')
                    .insert({ ...formData, active: true });
                if (error) throw error;
                toast.success('Grupo criado!');
            }
            await fetchGroups();
            closeModal();
        } catch (error: unknown) {
            await alert('Erro', getErrorMessage(error), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (group: FinancialGroup) => {
        setEditing(group);
        setFormData({
            name: group.name,
            description: group.description || '',
            display_order: group.display_order,
        });
        setIsModalOpen(true);
    };

    const handleToggle = async (group: FinancialGroup) => {
        const confirmed = await confirm(
            'Confirmar',
            `Deseja ${group.active ? 'desativar' : 'ativar'} "${group.name}"?`,
            'danger'
        );
        if (!confirmed) return;

        const { error } = await supabase
            .from('financial_groups')
            .update({ active: !group.active })
            .eq('id', group.id);

        if (!error) {
            await fetchGroups();
            toast.success('Status atualizado!');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setFormData({ name: '', description: '', display_order: 0 });
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Grupos Financeiros"
                description="Grupos e categorias de classificação financeira"
                icon="📁"
                breadcrumbs={[
                    { label: 'FINANCEIRO', href: '/dashboard/financas', color: '#059669' },
                    { label: 'CONFIGURAÇÕES', href: '/dashboard/financas/settings', color: '#059669' },
                    { label: 'GRUPOS', color: '#059669' },
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
                        {t('groups.newButton')}
                    </button>
                }
            />

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
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                {t('groups.table.order')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                {t('groups.table.name')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                {t('groups.table.description')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                {t('groups.table.status')}
                            </th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                                {t('groups.table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>Carregando...</td></tr>
                        ) : groups.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum grupo encontrado</td></tr>
                        ) : (
                            groups.map(group => (
                                <tr key={group.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '18px 24px', fontSize: '14px' }}>
                                        <span style={{ fontWeight: '700', color: '#0ea5e9' }}>{group.display_order}</span>
                                    </td>
                                    <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>
                                        {group.name}
                                    </td>
                                    <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748b' }}>
                                        {group.description || '-'}
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                        <span style={{
                                            background: group.active ? '#d1fae5' : '#fee2e2',
                                            color: group.active ? '#065f46' : '#991b1b',
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {group.active ? t('groups.status.active') : t('groups.status.inactive')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleEdit(group)}
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
                                                onClick={() => handleToggle(group)}
                                                style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    color: group.active ? '#dc2626' : '#16a34a',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {group.active ? '🚫' : '✓'}
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
                            padding: '40px',
                        }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
                            {editing ? t('groups.modal.edit') : t('groups.modal.new')}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        {t('groups.modal.name')}
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
                                        {t('groups.modal.description')}
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
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

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        {t('groups.modal.order')}
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
                                        {t('groups.modal.cancel')}
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
