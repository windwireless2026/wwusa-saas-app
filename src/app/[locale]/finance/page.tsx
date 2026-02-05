'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function FinancePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';

  const relatoriosFinanceiros = [
    {
      icon: '📊',
      title: 'Relatórios',
      description: 'Dashboards e análises financeiras',
      href: `/${locale}/finance/dashboard`,
      status: 'Em breve',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '📈',
      title: 'DRE Gerencial',
      description: 'Demonstrativo de Resultado do Exercício',
      href: `/${locale}/finance/income-statement`,
      status: 'Em breve',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '⚖️',
      title: 'Balanço Patrimonial',
      description: 'Visualize ativos, passivos e patrimônio',
      href: `/${locale}/finance/balance-sheet`,
      status: 'Em breve',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '💰',
      title: 'Fluxo de Caixa',
      description: 'Acompanhe entradas e saídas de caixa',
      href: `/${locale}/finance/cash-flow`,
      status: 'Em breve',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const modulosFinanceiros = [
    {
      icon: '💳',
      title: 'Contas a Pagar',
      description: 'Gerencie contas a pagar, fornecedores e vencimentos',
      href: `/${locale}/finance/accounts-payable`,
      status: 'Ativo',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '💵',
      title: 'Contas a Receber',
      description: 'Gerencie recebimentos e cobranças de clientes',
      href: `/${locale}/finance/accounts-receivable`,
      status: 'Em breve',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🔄',
      title: 'Conciliação Bancária',
      description: 'Reconcilie contas bancárias automaticamente',
      href: `/${locale}/finance/reconciliation`,
      status: 'Em breve',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const cadastroAgentes = [
    {
      icon: '🤝',
      title: 'Cadastro de Agentes',
      description: 'Parceiros de negócio, fornecedores, clientes e transportadoras',
      href: `/${locale}/finance/agents`,
      status: 'Ativo',
      color: 'from-sky-500 to-sky-600'
    }
  ];

  const configuracoes = [
    {
      icon: '📋',
      title: 'Plano de Contas Contábil',
      description: 'Plano de contas e categorias financeiras',
      href: `/${locale}/finance/chart-of-accounts`,
      status: 'Ativo',
      color: 'from-gray-500 to-gray-600'
    },
    {
      icon: '📂',
      title: 'Plano de Contas Financeiro',
      description: 'Classificações, grupos e categorias DRE',
      href: `/${locale}/finance/classes`,
      status: 'Ativo',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: '🎯',
      title: 'Centro de Custo',
      description: 'Gerencie centros de custo e departamentos',
      href: `/${locale}/finance/cost-centers`,
      status: 'Ativo',
      color: 'from-slate-500 to-slate-600'
    },
    {
      icon: '🏦',
      title: 'Conta Bancária',
      description: 'Cadastro e gestão de contas bancárias',
      href: `/${locale}/finance/bank-accounts`,
      status: 'Ativo',
      color: 'from-zinc-500 to-zinc-600'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader 
        title="Módulo Financeiro" 
        icon="💰"
        breadcrumbs={[
          { label: 'DASHBOARD', href: `/${locale}/dashboard` },
          { label: 'FINANCEIRO', href: `/${locale}/finance` }
        ]}
      />

      {/* Relatórios Financeiros */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>📊</span> Relatórios Financeiros
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {relatoriosFinanceiros.map((item, index) => (
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

      {/* Módulos Financeiros */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>💰</span> Módulos Financeiros
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {modulosFinanceiros.map((item, index) => (
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

      {/* Cadastro de Agentes */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>🤝</span> Cadastro de Agentes
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {cadastroAgentes.map((item, index) => (
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

      {/* Configurações */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⚙️</span> Configurações
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {configuracoes.map((item, index) => (
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
    </div>
  );
}
