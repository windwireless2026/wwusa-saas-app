'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/layout/LanguageSelector';
import { useSupabase } from '@/hooks/useSupabase';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  locale: string;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, locale }: SidebarProps) {
  const t = useTranslations('Dashboard.Sidebar');
  const pathname = usePathname();
  const supabase = useSupabase(); // Hook com instância única global
  const [expandedModules, setExpandedModules] = useState<string[]>(['registration', 'operations']);
  const [userData, setUserData] = useState({ full_name: '', email: '', initials: '' });

  useEffect(() => {
    const fetchUser = async (retryCount = 0) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist or doesn't have a name, but user is erik, let's be smart
        const rawName = user.user_metadata?.full_name || profile?.full_name;
        const name = rawName || user.email?.split('@')[0] || 'Usuário';

        const initials =
          name !== 'Usuário'
            ? name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            : user.email?.substring(0, 2).toUpperCase() || '??';

        setUserData({
          full_name: name.charAt(0).toUpperCase() + name.slice(1),
          email: user.email || '',
          initials: initials,
        });

        // Auto-create/sync profile if missing name (for Erik mainly)
        if ((!profile || !profile.full_name) && retryCount === 0) {
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email,
              full_name: rawName || user.email?.split('@')[0],
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        }

        if (!profile && retryCount < 2) {
          setTimeout(() => fetchUser(retryCount + 1), 1000);
        }
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const menuItems = [
    { href: '/dashboard', icon: '📊', label: t('overview'), id: 'overview' },
    {
      id: 'registration',
      label: t('registrationModule'),
      icon: '📋',
      href: '/dashboard/registration',
    },
    {
      id: 'operations',
      label: t('operationsModule'),
      icon: '⚡',
      subItems: [
        { href: '/dashboard/operations', icon: '📊', label: t('operationsDashboard') },
        { href: '/dashboard/inventory', icon: '🔢', label: t('stock') },
      ],
    },
    {
      id: 'comercial',
      label: t('comercialModule'),
      icon: '💼',
      subItems: [
        { href: '/dashboard/comercial', icon: '📊', label: t('comercialDashboard') },
        { href: '/dashboard/comercial/estimates', icon: '📋', label: t('estimates') },
      ],
    },
    {
      id: 'financial',
      label: t('financialModule'),
      icon: '💰',
      subItems: [
        { href: '/dashboard/financas', icon: '📊', label: t('financialDashboard') },
        { href: '/dashboard/invoices', icon: '💰', label: t('invoices') },
      ],
    },
    {
      id: 'security',
      label: t('securityModule'),
      icon: '🛡️',
      subItems: [
        { href: '/dashboard/security/logs', icon: '📋', label: t('auditLogs') },
        { href: '/dashboard/users', icon: '👤', label: t('users') },
      ],
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: '⚙️',
      subItems: [
        { href: '/dashboard/settings', icon: '🏢', label: t('companyData') },
      ],
    },
  ];

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const isActive = (path: string) => pathname === `/${locale}${path}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/auth/login`;
  };

  return (
    <aside
      style={{
        width: isCollapsed ? '80px' : '280px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header / Logo restored */}
      <div
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #f8fafc',
        }}
      >
        <img
          src="/images/wind_wireless.png"
          alt="Wind Wireless Logo"
          style={{
            minWidth: '36px',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            objectFit: 'contain',
            background: 'white',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        />
        {!isCollapsed && (
          <span
            style={{
              fontSize: '18px',
              fontWeight: '850',
              color: '#0f172a',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.02em',
            }}
          >
            WIND WIRELESS
          </span>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '32px',
            width: '24px',
            height: '24px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            zIndex: 10,
          }}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }} className="hide-scroll">
        {menuItems.map(item => {
          const isModule = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedModules.includes(item.id || '');
          const active = !isModule && item.href ? isActive(item.href) : false;

          if (!isModule) {
            return (
              <Link
                key={item.id}
                href={`/${locale}${item.href}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isCollapsed ? '12px' : '12px 24px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  color: active ? '#7c3aed' : '#64748b',
                  background: active ? '#f5f3ff' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontWeight: active ? '700' : '500',
                  borderRight: active ? '3px solid #7c3aed' : 'none',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          }

          return (
            <div key={item.id} style={{ marginBottom: '4px' }}>
              <div
                onClick={() => !isCollapsed && toggleModule(item.id || '')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: '12px 24px',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: isCollapsed ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && <span style={{ fontSize: '16px' }}>{item.icon}</span>}
                </div>
                {!isCollapsed && (
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>{isExpanded ? '▼' : '▶'}</span>
                )}
              </div>

              {(isExpanded || isCollapsed) &&
                item.subItems?.map(sub => {
                  const subActive = isActive(sub.href);
                  return (
                    <Link
                      key={sub.href}
                      href={`/${locale}${sub.href}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: isCollapsed ? '12px' : '10px 24px 10px 48px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        color: subActive ? '#7c3aed' : '#475569',
                        background: subActive ? '#f5f3ff' : 'transparent',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: subActive ? '600' : '500',
                        transition: 'all 0.1s',
                      }}
                    >
                      <span
                        style={{ fontSize: '16px', filter: subActive ? 'none' : 'grayscale(1)' }}
                      >
                        {sub.icon}
                      </span>
                      {!isCollapsed && <span>{sub.label}</span>}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
        {!isCollapsed && (
          <div style={{ marginBottom: '16px' }}>
            <LanguageSelector locale={locale} />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isCollapsed ? '8px' : '12px',
            background: isCollapsed ? 'transparent' : '#f8fafc',
            borderRadius: '12px',
            border: isCollapsed ? 'none' : '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              minWidth: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.2)',
            }}
          >
            {userData.initials || '??'}
          </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {userData.full_name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                {userData.email ? 'Ver Perfil' : 'Carregando...'}
              </div>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              title="Sair"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sair
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        nav a:hover {
          background: #f8fafc !important;
        }
      `}</style>
    </aside>
  );
}
