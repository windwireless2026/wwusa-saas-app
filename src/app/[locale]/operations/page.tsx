'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function OperationsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';

  const modulosOperacionais = [
    {
      icon: '📊',
      title: 'Dashboard Operacional',
      description: 'Visão geral do estoque: quantidade, reservas e valor',
      href: `/${locale}/operations/dashboard`,
      status: 'Ativo',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '📦',
      title: 'Estoque',
      description: 'Gerencie produtos, entrada e saída de estoque',
      href: `/${locale}/operations/inventory`,
      status: 'Ativo',
      color: 'from-green-500 to-green-600'
    }
  ];

  const configuracoesOperacionais = [
    {
      icon: '🏷️',
      title: 'Tipos de Produto',
      description: 'Categorias e classificações de produtos',
      href: `/${locale}/operations/product-types`,
      status: 'Ativo',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🏭',
      title: 'Fabricantes',
      description: 'Cadastro de fabricantes e fornecedores',
      href: `/${locale}/operations/manufacturers`,
      status: 'Ativo',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '📱',
      title: 'Modelos',
      description: 'Modelos e variações de produtos',
      href: `/${locale}/operations/models`,
      status: 'Ativo',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '📍',
      title: 'Locais de Estoque',
      description: 'Gerencie armazéns e localizações',
      href: `/${locale}/operations/stock-locations`,
      status: 'Ativo',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader 
        title="Módulo Operações" 
        icon="⚡"
        breadcrumbs={[
          { label: 'DASHBOARD', href: `/${locale}/dashboard` },
          { label: 'OPERAÇÕES', href: `/${locale}/operations` }
        ]}
      />

      {/* Módulos Operacionais */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>📊</span> Módulos Operacionais
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {modulosOperacionais.map((item, index) => (
          <div
            key={index}
            onClick={() => item.status === 'Ativo' && router.push(item.href as string)}
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

      {/* Configurações Operacionais */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⚙️</span> Configurações Operacionais
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {configuracoesOperacionais.map((item, index) => (
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
