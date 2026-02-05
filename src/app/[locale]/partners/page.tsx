'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslations } from 'next-intl';

export default function PartnersPage() {
  const router = useRouter();
  const t = useTranslations();

  const modulosSocios = [
    {
      icon: '📊',
      title: 'Dashboard de Sócios',
      description: 'Visão geral de participações e rendimentos',
      href: '/partners/dashboard',
      status: 'Em breve',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '👥',
      title: 'Lista de Sócios',
      description: 'Gerencie sócios e participações societárias',
      href: '/partners/list',
      status: 'Ativo',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '📈',
      title: 'Evolução Patrimonial',
      description: 'Acompanhe a evolução do patrimônio dos sócios',
      href: '/partners/equity-evolution',
      status: 'Em breve',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '💰',
      title: 'Distribuições',
      description: 'Registre e acompanhe distribuição de lucros',
      href: '/partners/distributions',
      status: 'Em breve',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader 
        title="Módulo Sócios" 
        icon="🤝"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sócios', href: '/partners' }
        ]}
      />

      {/* Módulos de Sócios */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>👥</span> Módulos de Sócios
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {modulosSocios.map((item, index) => (
          <div
            key={index}
            onClick={() => item.status === 'Ativo' && router.push(item.href)}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: item.status === 'Ativo' ? 'pointer' : 'default',
              transition: 'all 0.2s',
              border: '1px solid #e5e7eb',
              position: 'relative',
              opacity: item.status === 'Em breve' ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (item.status === 'Ativo') {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            {item.status === 'Em breve' && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                Em breve
              </div>
            )}
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              {item.icon}
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#111827'
            }}>
              {item.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
