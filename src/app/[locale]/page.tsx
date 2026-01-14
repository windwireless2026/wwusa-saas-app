import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Hero');
  const tStats = await getTranslations('Stats');
  const tAbout = await getTranslations('About');
  const tCTA = await getTranslations('CTA');

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header locale={locale} />

      {/* Hero Section - Light Theme */}
      <section
        style={{
          paddingTop: '180px',
          paddingBottom: '120px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract Background Elements (Subtle for Light Mode) */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(0,71,171,0.05) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(60px)',
            zIndex: -1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0%',
            left: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0,224,255,0.05) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(60px)',
            zIndex: -1,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="animate-fade-in">
            <span
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '20px',
                background: 'rgba(46, 92, 255, 0.05)',
                border: '1px solid var(--border-highlight)',
                color: 'var(--color-primary)',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {t('badge')}
            </span>
            <h1
              style={{
                fontSize: '64px',
                fontWeight: '800',
                lineHeight: '1.1',
                marginBottom: '24px',
                letterSpacing: '-2px',
                color: 'var(--text-primary)',
              }}
            >
              {t('titlePrefix')} <br />
              <span
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('titleHighlight')}
              </span>{' '}
              {t('titleSuffix')}
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 40px',
                lineHeight: '1.6',
              }}
            >
              {t('description')}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href="/auth/register" className="btn-primary">
                {t('ctaPrimary')}
              </Link>
              <Link href="#how-it-works" className="btn-secondary">
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Dark Mode Band */}
      <section
        className="dark-section"
        style={{
          padding: '60px 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>15k+</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{tStats('sold')}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>100+</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{tStats('partners')}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>FL</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{tStats('hq')}</p>
          </div>
        </div>
      </section>

      {/* Value Proposition (Storytelling) */}
      <section id="about" style={{ padding: '120px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '80px',
              alignItems: 'center',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '40px',
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  lineHeight: '1.2',
                }}
              >
                {tAbout('titlePrefix')}{' '}
                <span style={{ color: 'var(--color-primary)' }}>{tAbout('titleHighlight')}</span>.
              </h2>
              <p
                style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}
              >
                {tAbout('p1')}
              </p>
              <p
                style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}
              >
                {tAbout('p2')}
              </p>
              <ul
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none' }}
              >
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--color-primary)' }}>✓</span> {tAbout('list1')}
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--color-primary)' }}>✓</span> {tAbout('list2')}
                </li>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--color-primary)' }}>✓</span> {tAbout('list3')}
                </li>
              </ul>
            </div>
            <div
              className="glass-panel"
              style={{
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Image Placeholder */}
              <div
                style={{
                  width: '80%',
                  height: '80%',
                  background: 'linear-gradient(135deg, rgba(0,71,171,0.05), rgba(0,224,255,0.05))',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'var(--text-tertiary)' }}>
                  Imagem Institucional / Warehouse
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Mode Band */}
      <section
        className="dark-section"
        style={{
          padding: '100px 0',
          background: 'linear-gradient(180deg, var(--bg-primary) 0%, rgba(0,71,171,0.1) 100%)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2
            style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}
          >
            {tCTA('title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '18px' }}>
            {tCTA('description')}
          </p>
          <Link
            href="/auth/register"
            className="btn-primary"
            style={{ padding: '16px 48px', fontSize: '18px' }}
          >
            {tCTA('button')}
          </Link>
        </div>
      </section>

      <div className="dark-section">
        <Footer />
      </div>
    </main>
  );
}
