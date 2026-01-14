'use client';

import { useRouter } from 'next/navigation';

export default function RegistrationCentralPage() {
  const router = useRouter();

  const cadastros = [
    {
      title: 'Agentes',
      description: 'Fornecedores, clientes e parceiros',
      icon: '🤝',
      href: '/dashboard/agents',
      color: { bg: '#dbeafe', text: '#1e40af' }
    },
    {
      title: 'Fabricantes',
      description: 'Marcas e fabricantes de produtos',
      icon: '🏭',
      href: '/dashboard/manufacturers',
      color: { bg: '#fef3c7', text: '#92400e' }
    },
    {
      title: 'Tipos de Produto',
      description: 'Categorias de produtos',
      icon: '📋',
      href: '/dashboard/product-types',
      color: { bg: '#d1fae5', text: '#065f46' }
    },
    {
      title: 'Locais de Estoque',
      description: 'Armazéns e localizações',
      icon: '📍',
      href: '/dashboard/stock-locations',
      color: { bg: '#fee2e2', text: '#991b1b' }
    },
    {
      title: 'Modelos',
      description: 'Catálogo de produtos',
      icon: '📦',
      href: '/dashboard/models',
      color: { bg: '#f3e8ff', text: '#6b21a8' }
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários do sistema',
      icon: '👤',
      href: '/dashboard/users',
      color: { bg: '#dbeafe', text: '#1e40af' }
    },
    {
      title: 'Centros de Custo',
      description: 'Gerenciar departamentos e centros de custo',
      icon: '💰',
      href: '/dashboard/cost-centers',
      color: { bg: '#ede9fe', text: '#5b21b6' }
    },
  ];

  const cadastrosFinanceiros = [
    {
      title: 'Chart of Accounts',
      description: 'Plano de contas GAAP completo',
      icon: '📋',
      href: '/dashboard/financas/chart-of-accounts',
      color: { bg: '#dbeafe', text: '#1e40af' }
    },
    {
      title: 'Classes Financeiras',
      description: 'Classificação detalhada',
      icon: '📊',
      href: '/dashboard/financas/classes',
      color: { bg: '#d1fae5', text: '#065f46' }
    },
    {
      title: 'Grupos Financeiros',
      description: 'SG&A, Sócios, Operacionais',
      icon: '📁',
      href: '/dashboard/financas/grupos',
      color: { bg: '#fef3c7', text: '#92400e' }
    },
    {
      title: 'Categorias DRE',
      description: 'DRE Gerencial',
      icon: '📈',
      href: '/dashboard/financas/dre-categorias',
      color: { bg: '#fee2e2', text: '#991b1b' }
    },
    {
      title: 'Batimento Capital',
      description: 'Fluxo de caixa',
      icon: '💵',
      href: '/dashboard/financas/batimento-capital',
      color: { bg: '#f3e8ff', text: '#6b21a8' }
    },
    {
      title: 'Contas Bancárias',
      description: 'Bancos, crypto wallets',
      icon: '🏦',
      href: '/dashboard/financas/contas-bancarias',
      color: { bg: '#dbeafe', text: '#1e40af' }
    },
  ];

  const cadastrosSeguranca = [
    {
      title: 'Logs de Auditoria',
      description: 'Histórico de todas as ações no sistema',
      icon: '🛡️',
      href: '/dashboard/security/logs',
      color: { bg: '#fee2e2', text: '#991b1b' }
    },
    {
      title: 'Usuários e Perfis',
      description: 'Gestão de acesso e permissões',
      icon: '🔑',
      href: '/dashboard/users',
      color: { bg: '#ede9fe', text: '#5b21b6' }
    },
  ];

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#1e293b' }}>
          📁 Central de Cadastro
        </h1>
        <p style={{ color: '#64748b', marginTop: '12px', fontSize: '16px' }}>
          Selecione o módulo que deseja gerenciar a partir desta central
        </p>
      </div>

      {/* Administrativo */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🏢</span>
          Administrativo
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {cadastros.map((item) => (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                border: '2px solid #e2e8f0',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = item.color.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                background: item.color.bg,
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Financeiro */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>💰</span>
          Financeiro
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {cadastrosFinanceiros.map((item) => (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                border: '2px solid #e2e8f0',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = item.color.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                background: item.color.bg,
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Segurança */}
      <div style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🛡️</span>
          Segurança e Auditoria
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {cadastrosSeguranca.map((item) => (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                border: '2px solid #e2e8f0',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = item.color.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                background: item.color.bg,
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
