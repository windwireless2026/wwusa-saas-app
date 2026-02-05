'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import PageHeader from '@/components/ui/PageHeader';

type AuditLog = {
    id: string;
    created_at: string;
    user_email: string;
    action: string;
    table_name: string;
    record_id: string;
    changes: any;
};

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
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching audit logs:', error);
        } else {
            setLogs(data || []);
        }
        setLoading(false);
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return { bg: '#d1fae5', text: '#065f46' };
            case 'UPDATE': return { bg: '#dbeafe', text: '#1e40af' };
            case 'DELETE': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Logs de Auditoria"
                description="Histórico completo de ações realizadas no sistema"
                icon="📋"
                breadcrumbs={[
                    { label: 'SEGURANÇA', href: '/dashboard/security', color: '#dc2626' },
                    { label: 'LOGS DE AUDITORIA', color: '#dc2626' },
                ]}
                moduleColor="#dc2626"
            />

            {/* Table */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                        Carregando logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                        Nenhum log de auditoria encontrado
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Data/Hora
                                </th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Usuário
                                </th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Ação
                                </th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Tabela
                                </th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Registro ID
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => {
                                const actionColor = getActionColor(log.action);
                                return (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                                            {new Date(log.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>
                                            {log.user_email || 'Sistema'}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                background: actionColor.bg,
                                                color: actionColor.text,
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600', fontFamily: 'monospace' }}>
                                            {log.table_name}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            {log.record_id?.substring(0, 8)}...
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
