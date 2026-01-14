import { useRef, useEffect } from 'react';
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Instância GLOBAL única (fora de qualquer componente)
let globalBrowserClient: ReturnType<typeof createSSRBrowserClient> | null = null;

// Função para obter/criar cliente (chamada APENAS uma vez)
function getOrCreateBrowserClient() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (globalBrowserClient) {
        return globalBrowserClient;
    }

    // Cria apenas UMA vez
    globalBrowserClient = createSSRBrowserClient(supabaseUrl, supabaseKey, {
        cookies: {
            get(name: string) {
                const cookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith(`${name}=`));
                return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
            },
            set(name: string, value: string, options: any) {
                const cookieOptions = {
                    ...options,
                    path: '/',
                    sameSite: 'lax' as const,
                    secure: window.location.protocol === 'https:',
                    maxAge: options.maxAge || 60 * 60 * 24 * 365,
                };

                let cookieString = `${name}=${encodeURIComponent(value)}`;

                Object.entries(cookieOptions).forEach(([key, val]) => {
                    if (val === true) {
                        cookieString += `; ${key}`;
                    } else if (val !== false && val !== null && val !== undefined) {
                        cookieString += `; ${key}=${val}`;
                    }
                });

                document.cookie = cookieString;
            },
            remove(name: string) {
                document.cookie = `${name}=; path=/; max-age=0`;
            },
        },
    });

    return globalBrowserClient;
}

// Hook React que retorna sempre a mesma instância
export function useSupabase() {
    const clientRef = useRef<ReturnType<typeof createSSRBrowserClient> | null>(null);

    if (!clientRef.current) {
        clientRef.current = getOrCreateBrowserClient();
    }

    return clientRef.current!;
}
