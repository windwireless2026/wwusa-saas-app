'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ViewInvoicePage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/dashboard/invoices" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
                    ← Voltar para listagem
                </Link>
            </div>
            <h1>Visualizar AP</h1>
            <p style={{ color: '#64748b' }}>ID da AP: {id}</p>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', marginTop: '24px', border: '1px solid #e2e8f0' }}>
                <p>O módulo de visualização detalhada está em desenvolvimento.</p>
                <Link
                    href={`/dashboard/invoices/${id}/edit`}
                    style={{
                        display: 'inline-block',
                        marginTop: '16px',
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}
                >
                    Editar esta AP
                </Link>
            </div>
        </div>
    );
}
