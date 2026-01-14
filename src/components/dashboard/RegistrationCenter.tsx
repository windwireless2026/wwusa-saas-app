'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function RegistrationCenter() {
  const t = useTranslations('Dashboard.Registration');

  const adminCards = [
    {
      title: t('users.title'),
      description: t('users.description'),
      icon: '👤',
      href: '/dashboard/users',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.08)',
    },
    {
      title: t('agents.title'),
      description: t('agents.description'),
      icon: '🤝',
      href: '/dashboard/agents',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.08)',
    },
    {
      title: t('stock_locations.title'),
      description: t('stock_locations.description'),
      icon: '📍',
      href: '/dashboard/stock-locations',
      color: '#0EA5E9',
      bg: 'rgba(14, 165, 233, 0.08)',
    },
    {
      title: t('access_profiles.title'),
      description: t('access_profiles.description'),
      icon: '🔑',
      href: '/dashboard/access-profiles',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.08)',
    },
    {
      title: t('financial.title'),
      description: t('financial.description'),
      icon: '💰',
      href: '/dashboard/finance/settings',
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.08)',
    },
    {
      title: t('banks.title'),
      description: t('banks.description'),
      icon: '🏦',
      href: '/dashboard/banks',
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
    },
  ];

  const productCards = [
    {
      title: t('products.title'),
      description: t('products.description'),
      icon: '📦',
      href: '/dashboard/models',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: t('manufacturers.title'),
      description: t('manufacturers.description'),
      icon: '🏢',
      href: '/dashboard/manufacturers',
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.08)',
    },
    {
      title: t('product_types.title'),
      description: t('product_types.description'),
      icon: '📋',
      href: '/dashboard/product-types',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
  ];

  const renderGrid = (cards: typeof adminCards) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '28px',
        marginBottom: '48px',
      }}
    >
      {cards.map(card => (
        <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(24px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              borderTopColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '28px',
              padding: '40px 32px',
              height: '260px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = `0 20px 40px ${card.color}15`;
              e.currentTarget.style.background = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.03)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: '28px',
                border: `1px solid ${card.color}15`,
                boxShadow: `0 4px 12px ${card.color}10`,
              }}
            >
              {card.icon}
            </div>

            <h3
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#1e293b',
                margin: '0 0 12px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {card.title}
            </h3>

            <p
              style={{
                fontSize: '15px',
                color: '#64748b',
                margin: 0,
                lineHeight: '1.7',
                fontWeight: '500',
              }}
            >
              {card.description}
            </p>

            <div
              style={{
                position: 'absolute',
                right: '32px',
                bottom: '32px',
                fontSize: '28px',
                color: card.color,
                opacity: 0.3,
                transition: 'all 0.3s ease',
              }}
            >
              →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header Area */}
      <div style={{ marginBottom: '48px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#94a3b8',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '14px' }}>📋</span> WindSystem
        </div>
        <h1
          style={{
            fontSize: '42px',
            fontWeight: '900',
            margin: 0,
            letterSpacing: '-0.03em',
            color: '#1e293b',
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'initial',
          }}
        >
          {t('title')}
        </h1>
        <p
          style={{
            color: '#64748b',
            marginTop: '12px',
            fontSize: '18px',
            fontWeight: '500',
            maxWidth: '600px',
          }}
        >
          {t('description')}
        </p>
      </div>

      {/* Groups Area */}
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '800',
          marginBottom: '24px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ width: '32px', height: '2px', background: 'rgba(0,0,0,0.05)' }}></span>
        {t('groups.administrative')}
      </h2>
      {renderGrid(adminCards)}

      <h2
        style={{
          fontSize: '20px',
          fontWeight: '800',
          marginBottom: '24px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ width: '32px', height: '2px', background: 'rgba(0,0,0,0.05)' }}></span>
        {t('groups.products')}
      </h2>
      {renderGrid(productCards)}
    </div>
  );
}
