import { useSupabase } from './useSupabase';
import { useCallback } from 'react';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export interface AuditLogParams {
    action: AuditAction;
    entity_type: string;
    entity_id?: string;
    old_data?: any;
    new_data?: any;
    details?: string;
}

export function useAuditLog() {
    const supabase = useSupabase();

    const logAction = useCallback(async (params: AuditLogParams) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    user_id: user.id,
                    action: params.action,
                    entity_type: params.entity_type,
                    entity_id: params.entity_id,
                    old_data: params.old_data,
                    new_data: params.new_data,
                    details: params.details
                });

            if (error) {
                console.error('Error recording audit log:', error);
            }
        } catch (err) {
            console.error('Critical error in audit log service:', err);
        }
    }, [supabase]);

    return { logAction };
}
