'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTranslations } from 'next-intl';

interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: string;
    old_data: any;
    new_data: any;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
}

export default function AuditLogsPage() {
    const supabase = useSupabase();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
                *,
                profiles (full_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching audit logs:', error);
        } else if (data) {
            setLogs(data as any);
        }
        setLoading(false);
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return { bg: '#dcfce7', text: '#166534' };
            case 'UPDATE': return { bg: '#fef9c3', text: '#854d0e' };
            case 'DELETE': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                    🛡️ Logs de Segurança e Auditoria
                </h1>
                <p style={{ color: '#64748b', marginTop: '8px' }}>
                    Acompanhe todas as atividades administrativas realizadas no sistema.
                </p>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Data/Hora</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Usuário</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Ação</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Entidade</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Carregando logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Nenhum log encontrado.</td></tr>
                        ) : (
                            logs.map(log => {
                                const actionColor = getActionColor(log.action);
                                return (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                                            {new Date(log.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{log.profiles?.full_name || 'Sistema'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{log.profiles?.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                backgroundColor: actionColor.bg,
                                                color: actionColor.text
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                                            {log.entity_type.toUpperCase()}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0f172a' }}>
                                            {log.details}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
