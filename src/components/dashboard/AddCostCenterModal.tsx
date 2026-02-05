'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useUI } from '@/context/UIContext';
import { getErrorMessage } from '@/lib/errors';

interface AddCostCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    costCenter?: {
        id: string;
        name: string;
        code: string;
        description: string;
        is_active: boolean;
    };
}

export default function AddCostCenterModal({ isOpen, onClose, onSuccess, costCenter }: AddCostCenterModalProps) {
    const supabase = useSupabase();
    const { alert, toast } = useUI();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (costCenter) {
            setFormData({
                name: costCenter.name || '',
                code: costCenter.code || '',
                description: costCenter.description || '',
                is_active: costCenter.is_active ?? true
            });
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                is_active: true
            });
        }
    }, [costCenter, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (costCenter) {
                const { error } = await supabase
                    .from('cost_centers')
                    .update(formData)
                    .eq('id', costCenter.id);
                if (error) throw error;
                toast.success('Centro de Custo atualizado com sucesso!');
            } else {
                const { error } = await supabase
                    .from('cost_centers')
                    .insert([formData]);
                if (error) throw error;
                await alert('Sucesso', 'Centro de Custo criado com sucesso!', 'success');
            }
            onSuccess();
            onClose();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    };

    const modalStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
        marginBottom: '16px'
    };

    const handleOverlayMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            style={overlayStyle}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    (e.currentTarget as any)._startedOnOverlay = true;
                } else {
                    (e.currentTarget as any)._startedOnOverlay = false;
                }
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && (e.currentTarget as any)._startedOnOverlay) {
                    onClose();
                }
            }}
        >
            <div style={modalStyle}>
                <div style={{ padding: '32px', position: 'relative' }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '24px',
                            right: '24px',
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        ✕
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                        {costCenter ? '✏️ Editar Centro de Custo' : '➕ Novo Centro de Custo'}
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
                        Preencha os dados abaixo para {costCenter ? 'atualizar o' : 'cadastrar um novo'} centro de custo.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Nome do Centro de Custo
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Operações, Marketing..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={inputStyle}
                        />

                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Código (Sigla)
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: OPS, MKT..."
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            style={inputStyle}
                        />

                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Descrição
                        </label>
                        <textarea
                            placeholder="Para que serve este centro de custo?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <label htmlFor="is_active" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                                Centro de Custo Ativo
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
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
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1e40af 100%)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                {loading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
