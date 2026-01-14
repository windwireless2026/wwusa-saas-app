import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente básico - APENAS para uso no SERVIDOR
// NO BROWSER: Use useSupabase() hook ao invés!
export const supabase = typeof window === 'undefined'
  ? createClient(supabaseUrl, supabaseKey)
  : null as any; // No browser, retorna null para forçar uso do useSupabase()

// Types for our user roles
export type UserRole = 'super_admin' | 'stock_manager' | 'finance_manager' | 'client' | 'partner';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  company_name?: string;
}

// ⚠️ IMPORTANTE ⚠️
// Para componentes Client ('use client'), use:
// import { useSupabase } from '@/hooks/useSupabase';
// const supabase = useSupabase();
//
// Este export 'supabase' só funciona em Server Components!
