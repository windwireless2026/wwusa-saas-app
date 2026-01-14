'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer
      style={{
        background: '#0f172a',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '80px 0 40px',
        color: 'white'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
            gap: '60px',
            marginBottom: '64px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>
              WindWireless
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '15px', maxWidth: '300px' }}>
              {t('description')}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('company')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <a href="#about" style={{ color: '#94a3b8', fontSize: '15px', textDecoration: 'none' }}>
                Sobre nós
              </a>
              <a href="#products" style={{ color: '#94a3b8', fontSize: '15px', textDecoration: 'none' }}>
                Nossos Produtos
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('support')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <a href="/terms" style={{ color: '#94a3b8', fontSize: '15px', textDecoration: 'none' }}>
                Termos de Uso
              </a>
              <a href="/privacy" style={{ color: '#94a3b8', fontSize: '15px', textDecoration: 'none' }}>
                Privacidade
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('contact')}</h4>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '12px' }}>
              Miami, FL - USA
            </p>
            <a href="https://wa.me/17869634734" target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontSize: '15px', textDecoration: 'none', fontWeight: '700' }}>
              WhatsApp: +1 (786) 963-4734
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            &copy; {new Date().getFullYear()} {t('rights')}
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Social placeholders if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
