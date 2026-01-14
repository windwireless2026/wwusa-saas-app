export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '64px 0 32px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
              WindWireless
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>
              Conectando o mercado americano de iPhones usados aos maiores lojistas do Brasil.
              Qualidade, procedência e logística eficiente.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Empresa</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#about" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Sobre nós
              </a>
              <a href="#process" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Como funciona
              </a>
              <a href="#careers" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Trabalhe conosco
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Suporte</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="/help" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Central de Ajuda
              </a>
              <a href="/terms" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Termos de Uso
              </a>
              <a href="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Privacidade
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Contato</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              Miami, FL - USA
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              contact@windwireless.com
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
            &copy; 2026 WindWireless LLC. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>{/* Social Icons Placeholder */}</div>
        </div>
      </div>
    </footer>
  );
}
