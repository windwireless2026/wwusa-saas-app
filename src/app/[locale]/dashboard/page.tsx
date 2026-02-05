'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardHome() {
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';
  const t = useTranslations('Dashboard');
  const tHome = useTranslations('Dashboard.Home');

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title="Dashboard"
        icon="📊"
        breadcrumbs={[
          { label: 'DASHBOARD', href: `/${locale}/dashboard` },
        ]}
        moduleColor="#3b82f6"
      />

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        <MetricCard
          title={tHome('totalStock')}
          value="1,248"
          trend="+12%"
          subtitle="vs mês anterior"
          icon="📦"
          color="#8b5cf6"
        />
        <MetricCard
          title={tHome('stockValue')}
          value="$452,000"
          trend="+5%"
          subtitle="vs mês anterior"
          icon="💰"
          color="#10b981"
        />
        <MetricCard
          title={tHome('salesMonth')}
          value="$128,500"
          trend="+18%"
          subtitle="vs mês anterior"
          icon="📈"
          color="#3b82f6"
          highlight
        />
        <MetricCard
          title={tHome('pendingOrders')}
          value="14"
          trend={tHome('actionRequired')}
          subtitle="requerem atenção"
          icon="⚠️"
          color="#f59e0b"
          warning
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {/* Revenue & Sales Chart Area */}
        <ChartContainer title="Evolução Mensal (Receita vs Vendas)" icon="📊" color="#3b82f6">
          <PremiumLineChart />
        </ChartContainer>

        {/* Delinquency Chart Area */}
        <ChartContainer title="Inadimplência por Período" icon="📉" color="#f43f5e">
          <PremiumBarChart />
        </ChartContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Recent Activity / Audit Log */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px' }}>🕐</span>
            <h3 style={{ fontSize: '18px', fontWeight: '850', margin: 0, color: '#1e293b' }}>
              {tHome('recentActivity')}
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <ActivityItem user="Admin" action="Importou nova planilha" time="10 min ago" />
            <ActivityItem user="Ricardo (Sales)" action="Novo pedido #1245" time="1h ago" />
            <ActivityItem user="System" action="Backup automático" time="3h ago" />
            <ActivityItem user="Admin" action="Atualizou preços Grade A" time="5h ago" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartContainer({ title, icon, children, color }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `${color}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {icon}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '850', margin: 0, color: '#1e293b' }}>
            {title}
          </h3>
        </div>
      </div>

      <div style={{ height: '240px', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function PremiumLineChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '4%' }}>
      {[
        { h: 45, v: "US$ 157k" },
        { h: 55, v: "$198k" },
        { h: 70, v: "$342k" },
        { h: 50, v: "$226k" },
        { h: 65, v: "$256k" },
        { h: 85, v: "$1.47M" },
        { h: 75, v: "$265k" }
      ].map((item, i) => (
        <div key={i} style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          position: 'relative'
        }} className="chart-bar-group">
          {/* Detailed Value Tooltip */}
          <div style={{
            position: 'absolute',
            top: `${100 - item.h}%`,
            transform: 'translateY(-140%)',
            background: '#0f172a',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '900',
            opacity: mounted ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transitionDelay: `${i * 100}ms`,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            {item.v}
          </div>

          {/* Bar Column */}
          <div style={{
            width: '100%',
            height: mounted ? `${item.h}%` : '4%',
            minHeight: '4%',
            background: 'linear-gradient(to top, #3b82f640 0%, #3b82f6 100%)',
            borderRadius: '12px 12px 4px 4px',
            position: 'relative',
            cursor: 'help',
            transition: 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${i * 100}ms`,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              background: 'white',
              border: '4px solid #3b82f6',
              borderRadius: '50%',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)',
              zIndex: 5
            }} />
          </div>

          <span style={{
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: '850',
            marginTop: '4px',
            opacity: mounted ? 1 : 0.5,
            transition: 'opacity 0.5s'
          }}>
            {['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Dez/25', 'Jan'][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function PremiumBarChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8%' }}>
      {[
        { h: 20, v: "US$ 12k" },
        { h: 35, v: "US$ 24k" },
        { h: 15, v: "US$ 8k" },
        { h: 25, v: "US$ 15k" },
        { h: 40, v: "US$ 28k" },
        { h: 30, v: "US$ 21k" }
      ].map((item, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end', position: 'relative' }} className="chart-bar-group">
          <div style={{
            position: 'absolute',
            top: `${100 - item.h}%`,
            transform: 'translateY(-140%)',
            background: '#0f172a',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '900',
            opacity: mounted ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transitionDelay: `${i * 100}ms`,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            {item.v}
          </div>

          <div style={{
            width: '100%',
            height: mounted ? `${item.h}%` : '4%',
            background: 'linear-gradient(to top, #f43f5e20 0%, #f43f5e 100%)',
            borderRadius: '10px 10px 4px 4px',
            opacity: 0.9,
            transition: 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${i * 100}ms`,
          }} />
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '850', marginTop: '4px' }}>{['30d', '60d', '90d', '120d', '150d', '180d+'][i]}</span>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ title, value, trend, subtitle, icon, color, highlight, warning }: any) {
  const isPositive = trend?.includes('+');

  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color} 0%, #4f46e5 100%)` : 'white',
      borderRadius: '24px',
      padding: '28px',
      border: highlight ? 'none' : '1px solid #e2e8f0',
      boxShadow: highlight ? `0 12px 30px ${color}30` : '0 4px 20px rgba(0,0,0,0.02)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = highlight ? `0 20px 40px ${color}40` : '0 12px 30px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = highlight ? `0 12px 30px ${color}30` : '0 4px 20px rgba(0,0,0,0.02)';
      }}
    >
      <div style={{
        position: 'absolute',
        right: '-15px',
        top: '-15px',
        fontSize: '100px',
        opacity: highlight ? 0.2 : 0.05,
        transform: 'rotate(-10deg)',
      }}>
        {icon}
      </div>

      <p style={{
        color: highlight ? 'rgba(255,255,255,0.85)' : '#64748b',
        fontSize: '12px',
        fontWeight: '800',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {title}
      </p>

      <h3 style={{
        fontSize: '34px',
        fontWeight: '950',
        marginBottom: '10px',
        color: highlight ? 'white' : '#0f172a',
        letterSpacing: '-1px',
      }}>
        {value}
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isPositive && !warning && (
          <span style={{
            background: highlight ? 'rgba(255,255,255,0.2)' : '#dcfce7',
            color: highlight ? 'white' : '#166534',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '800',
          }}>
            ↗ {trend}
          </span>
        )}
        {warning && (
          <span style={{
            background: '#ffedd5',
            color: '#9a3412',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '800',
          }}>
            ⚠️ {trend}
          </span>
        )}
        <p style={{
          fontSize: '12px',
          fontWeight: '600',
          color: highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8',
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time }: any) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      padding: '16px',
      borderRadius: '16px',
      background: '#f8fafc',
      border: '1px solid #f1f5f9',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f8fafc';
        e.currentTarget.style.borderColor = '#f1f5f9';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3b82f6',
        fontWeight: '800',
        fontSize: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {user[0]}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', marginBottom: '2px', color: '#1e293b' }}>
          <span style={{ fontWeight: '800', color: '#3b82f6' }}>{user}</span>
          {' '}
          <span style={{ color: '#64748b', fontWeight: '500' }}>{action}</span>
        </p>
        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>{time}</p>
      </div>
    </div>
  );
}

