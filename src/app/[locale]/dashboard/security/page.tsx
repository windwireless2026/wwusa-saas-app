'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function SecurityHubPage() {
    const router = useRouter();

    const securityItems = [
        {
            title: 'Perfis de Acesso',
            description: 'Gerencie perfis e permissões por módulo',
            icon: '🔐',
            href: '/dashboard/security/access-profiles',
            color: { bg: '#dbeafe', text: '#1e40af' }
        },
        {
            title: 'Usuários',
            description: 'Gestão de acesso e permissões',
            icon: '👤',
            href: '/dashboard/users',
            color: { bg: '#ede9fe', text: '#5b21b6' }
        },
        {
            title: 'Logs de Auditoria',
            description: 'Histórico completo de ações no sistema',
            icon: '📋',
            href: '/dashboard/security/logs',
            color: { bg: '#fee2e2', text: '#991b1b' }
        },
    ];

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Segurança"
                description="Controle de acesso, auditoria e segurança do sistema"
                icon="🛡️"
                breadcrumbs={[
                    { label: 'SEGURANÇA', color: '#dc2626' },
                ]}
                moduleColor="#dc2626"
            />

            {/* Security Items */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
            }}>
                {securityItems.map((item) => (
                    <div
                        key={item.href}
                        onClick={() => router.push(item.href)}
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
    );
}
