'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useParams } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';

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
