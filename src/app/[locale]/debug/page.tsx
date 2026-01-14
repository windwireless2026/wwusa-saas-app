'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export default function DebugPage() {
    const supabase = useSupabase();
    const [info, setInfo] = useState<any>({});

    useEffect(() => {
        async function checkEverything() {
            // 1. Verificar sessão
            const { data: { session } } = await supabase.auth.getSession();

            // 2. Tentar buscar produtos
            const { data: products, error: productsError, count } = await supabase
                .from('product_catalog')
                .select('*', { count: 'exact' })
                .is('deleted_at', null)
                .limit(5);

            // 3. Verificar tipos
            const { data: types, error: typesError } = await supabase
                .from('product_types')
                .select('*')
                .is('deleted_at', null);

            // 4. Verificar perfil
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user?.id || '')
                .single();

            setInfo({
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                session: {
                    email: session?.user?.email,
                    id: session?.user?.id,
                    isAuthenticated: !!session
                },
                products: {
                    count: count,
                    data: products,
                    error: productsError
                },
                types: {
                    count: types?.length,
                    data: types,
                    error: typesError
                },
                profile: {
                    data: profile,
                    error: profileError
                }
            });
        }

        checkEverything();
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', fontSize: '12px' }}>
            <h1 style={{ marginBottom: '20px' }}>🔍 Debug Info</h1>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>🌐 Supabase Configuration</h2>
                <pre>{JSON.stringify({ url: info.supabaseUrl }, null, 2)}</pre>
            </div>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>👤 Session Info</h2>
                <pre>{JSON.stringify(info.session, null, 2)}</pre>
            </div>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>📦 Products (should be 119)</h2>
                <pre>{JSON.stringify(info.products, null, 2)}</pre>
            </div>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>🏷️ Product Types (should be 6)</h2>
                <pre>{JSON.stringify(info.types, null, 2)}</pre>
            </div>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <h2>👨‍💼 Profile</h2>
                <pre>{JSON.stringify(info.profile, null, 2)}</pre>
            </div>
        </div>
    );
}
