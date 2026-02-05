'use client';

import Breadcrumb from './Breadcrumb';

type BreadcrumbItem = {
    label: string;
    href?: string;
    color?: string;
};

type PageHeaderProps = {
    title: string;
    description?: string;
    icon?: string;
    breadcrumbs?: BreadcrumbItem[];
    moduleColor?: string;
    locale?: string;
    actions?: React.ReactNode;
};

export default function PageHeader({
    title,
    description,
    icon,
    breadcrumbs,
    moduleColor = '#7c3aed',
    locale = 'pt',
    actions,
}: PageHeaderProps) {
    return (
        <div style={{ marginBottom: '40px' }}>
            {/* Breadcrumb */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb items={breadcrumbs} locale={locale} />
            )}

            {/* Title Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    {icon && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '48px' }}>{icon}</span>
                            <h1 style={{
                                fontSize: '42px',
                                fontWeight: '950',
                                color: '#0f172a',
                                letterSpacing: '-0.04em',
                                margin: 0,
                            }}>
                                {title}
                            </h1>
                        </div>
                    )}
                    {!icon && (
                        <h1 style={{
                            fontSize: '42px',
                            fontWeight: '950',
                            color: '#0f172a',
                            letterSpacing: '-0.04em',
                            margin: 0,
                        }}>
                            {title}
                        </h1>
                    )}
                    {description && (
                        <p style={{
                            color: '#64748b',
                            fontSize: '16px',
                            marginTop: icon ? '0' : '8px',
                            marginLeft: icon ? '64px' : '0',
                            lineHeight: '1.6',
                        }}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions (buttons, etc) */}
                {actions && (
                    <div style={{ marginLeft: '24px' }}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
