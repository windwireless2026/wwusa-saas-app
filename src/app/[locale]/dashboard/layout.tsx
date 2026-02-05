'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useSupabase } from '@/hooks/useSupabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';
  const supabase = useSupabase();

  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
      setHasSession(!!session);
      if (!session) {
        router.replace(`/${locale}/auth/login`);
      }
    });
  }, [locale, router, supabase.auth]);

  if (checking || !hasSession) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#64748b' }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar is fixed width or controlled by its own state */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} locale={locale} />

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          marginLeft: isCollapsed ? '80px' : '280px',
          // Transition matches sidebar for smooth movement
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 
                    Removal of the previous <div style={{maxWidth: '1200px', margin: '0 auto'}}> 
                    which was forcing centering and creating the gap.
                    Now children control their own layout.
                */}
        {children}
      </main>
    </div>
  );
}
