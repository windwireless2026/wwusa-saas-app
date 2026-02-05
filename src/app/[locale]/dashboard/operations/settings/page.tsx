'use client';

import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

export default function OperationsSettingsPage() {
    const modules = [
        {
            title: 'Tipos de Produto',
            description: 'Categorias e métodos de rastreamento',
            icon: '🏷️',
            href: '/dashboard/product-types',
            color: '#7c3aed',
        },
        {
            title: 'Fabricantes',
            description: 'Gestão de marcas e fabricantes',
            icon: '🏭',
            href: '/dashboard/manufacturers',
            color: '#7c3aed',
        },
        {
            title: 'Modelos',
            description: 'Catálogo de produtos e especificações',
            icon: '📱',
            href: '/dashboard/models',
            color: '#7c3aed',
        },
        {
            title: 'Locais de Estoque',
            description: 'Armazéns e pontos de armazenamento',
            icon: '📍',
            href: '/dashboard/stock-locations',
            color: '#7c3aed',
        },
    ];

    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#f8fafc' }}>
            <PageHeader
                title="Configurações de Operações"
                description="Parametrizações e cadastros auxiliares do módulo operacional"
                icon="⚙️"
                breadcrumbs={[
                    { label: 'OPERAÇÕES', href: '/dashboard/operations', color: '#7c3aed' },
                    { label: 'CONFIGURAÇÕES', color: '#7c3aed' },
                ]}
                moduleColor="#7c3aed"
            />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
                marginTop: '40px',
            }}>
                {modules.map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        style={{
                            textDecoration: 'none',
                            background: 'white',
                            borderRadius: '20px',
                            padding: '32px',
                            border: '1px solid #f1f5f9',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            display: 'block',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 58, 237, 0.15)';
                            e.currentTarget.style.borderColor = module.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
                            e.currentTarget.style.borderColor = '#f1f5f9';
                        }}
                    >
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '80px',
                        }}>
                            {module.icon}
                        </div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#0f172a',
                            marginBottom: '8px',
                            textAlign: 'center',
                        }}>
                            {module.title}
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            textAlign: 'center',
                            lineHeight: '1.6',
                        }}>
                            {module.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Info Box */}
            <div style={{
                marginTop: '40px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>ℹ️</span>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                        Configurações Operacionais
                    </h4>
                </div>
                <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', margin: 0 }}>
                    Estas configurações são essenciais para o funcionamento correto do módulo de operações.
                    Certifique-se de manter os cadastros atualizados para garantir a precisão do controle de estoque.
                </p>
            </div>
        </div>
    );
}
