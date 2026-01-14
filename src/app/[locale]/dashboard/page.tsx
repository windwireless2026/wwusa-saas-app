import { useTranslations } from 'next-intl';

export default function DashboardHome() {
  const t = useTranslations('Dashboard');
  const tHome = useTranslations('Dashboard.Home');
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{t('title')}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {tHome('welcome')}
      </p>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <MetricCard
          title={tHome('totalStock')}
          value="1,248"
          trend={tHome('trendVsLastMonth', { trend: '+12%' })}
        />
        <MetricCard
          title={tHome('stockValue')}
          value="$452,000"
          trend={tHome('trendVsLastMonth', { trend: '+5%' })}
        />
        <MetricCard
          title={tHome('salesMonth')}
          value="$128,500"
          trend={tHome('trendVsLastMonth', { trend: '+18%' })}
          highlight
        />
        <MetricCard
          title={tHome('pendingOrders')}
          value="14"
          trend={tHome('actionRequired')}
          warning
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Chart Area */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>
            {tHome('commercialPerformance')}
          </h3>
          <div
            style={{
              width: '100%',
              height: '300px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-tertiary)' }}>{tHome('chartPlaceholder')}</p>
          </div>
        </div>

        {/* Recent Activity / Audit Log */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>
            {tHome('recentActivity')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

function MetricCard({ title, value, trend, highlight, warning }: any) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
        {title}
      </p>
      <h3
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: highlight ? 'var(--color-accent)' : 'white',
        }}
      >
        {value}
      </h3>
      <p
        style={{
          fontSize: '12px',
          color: warning ? '#F59E0B' : trend.includes('+') ? '#10B981' : 'var(--text-tertiary)',
        }}
      >
        {trend}
      </p>
    </div>
  );
}

function ActivityItem({ user, action, time }: any) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--color-primary-light)',
        }}
      />
      <div>
        <p style={{ fontSize: '14px' }}>
          <span style={{ fontWeight: '600' }}>{user}</span> {action}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{time}</p>
      </div>
    </div>
  );
}
