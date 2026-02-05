'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function RegistrationPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <PageHeader
        title="Cadastro"
        description="Gestão de agentes e parceiros de negócio"
        icon="📋"
        breadcrumbs={[
          { label: 'CADASTRO', color: '#2563eb' },
        ]}
        moduleColor="#2563eb"
      />

      {/* Card de Agentes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
      }}>
        <div
          onClick={() => router.push('/dashboard/agents')}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            cursor: 'pointer',
            border: '2px solid #e2e8f0',
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#1e40af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <div style={{
            fontSize: '56px',
            marginBottom: '20px',
            background: '#dbeafe',
            width: '90px',
            height: '90px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            🤝
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>
            Agentes
          </h3>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
            Gerencie fornecedores, clientes, prestadores de serviço e todos os parceiros de negócio
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '48px',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        border: '1px solid #e9d5ff',
        maxWidth: '800px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <span style={{ fontSize: '24px' }}>💡</span>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#6b21a8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Organização Modular
            </h4>
            <p style={{ fontSize: '14px', color: '#7c3aed', margin: 0, lineHeight: '1.6' }}>
              Outros cadastros foram organizados por módulo para facilitar o gerenciamento e permissões:
            </p>
            <ul style={{ fontSize: '13px', color: '#7c3aed', marginTop: '12px', lineHeight: '1.8' }}>
              <li><strong>Operações → Configurações:</strong> Tipos de Produto, Fabricantes, Modelos, Locais de Estoque</li>
              <li><strong>Financeiro → Configurações:</strong> Centro de Custo, Chart of Accounts, Classes, Grupos</li>
              <li><strong>Segurança:</strong> Usuários e Logs de Auditoria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
