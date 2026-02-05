'use client';

import Link from 'next/link';

type BreadcrumbItem = {
    label: string;
    href?: string;
    color?: string;
};

type BreadcrumbProps = {
    items: BreadcrumbItem[];
    locale?: string;
};

export default function Breadcrumb({ items, locale = 'pt' }: BreadcrumbProps) {
    return (
        <div style={{
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            marginBottom: '12px',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
        }}>
            {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.href ? (
                        <Link
                            href={`/${locale}${item.href}`}
                            style={{
                                color: item.color || '#7c3aed',
                                textDecoration: 'none',
                                padding: '4px 10px',
                                background: item.color ? `${item.color}15` : '#f5f3ff',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = item.color ? `${item.color}25` : '#ede9fe';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = item.color ? `${item.color}15` : '#f5f3ff';
                            }}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span style={{
                            color: item.color || '#7c3aed',
                            padding: '4px 10px',
                            background: 'transparent',
                        }}>
                            {item.label}
                        </span>
                    )}
                    {index < items.length - 1 && (
                        <span style={{ opacity: 0.3, color: item.color || '#7c3aed' }}>›</span>
                    )}
                </div>
            ))}
        </div>
    );
}
