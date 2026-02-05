'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function SystemHubPage() {
    const router = useRouter();

    const systemItems = [
        {
            title: 'Documentação Técnica',
            description: 'Guias, APIs e documentação do sistema',
            icon: '📄',
            href: '/dashboard/docs',
            color: { bg: '#dbeafe', text: '#1e40af' }
        },
    ];

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Sistema"
                description="Ferramentas de sistema e documentação técnica"
                icon="🛠️"
                breadcrumbs={[
                    { label: 'SISTEMA', color: '#6b7280' },
                ]}
                moduleColor="#6b7280"
            />

            {/* System Items */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
            }}>
                {systemItems.map((item) => (
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
