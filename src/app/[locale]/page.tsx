import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Hero');
  const tStats = await getTranslations('Stats');
  const tAbout = await getTranslations('About');
  const tProducts = await getTranslations('Products');
  const tContact = await getTranslations('Contact');

  const whatsappLink = "https://wa.me/17869634734"; // Placeholder number, common for Miami business

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <Header locale={locale} />

      {/* Hero Section - Hybrid Premium */}
      <section
        style={{
          paddingTop: '160px',
          paddingBottom: '100px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
            <div className="animate-fade-in">
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: '700',
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
                  fontWeight: '850',
                  lineHeight: '1.05',
                  marginBottom: '28px',
                  letterSpacing: '-3px',
                  color: '#0f172a',
                }}
              >
                {t('titlePrefix')} <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
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
                  fontSize: '20px',
                  color: '#475569',
                  maxWidth: '540px',
                  marginBottom: '48px',
                  lineHeight: '1.6',
                }}
              >
                {t('description')}
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                  {t('ctaPrimary')}
                </a>
                <Link href="#products" className="btn-secondary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                  {t('ctaSecondary')}
                </Link>
              </div>
            </div>

            <div style={{ position: 'relative', height: '500px' }} className="animate-slide-up">
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(255,255,255,0) 70%)',
                zIndex: -1
              }} />
              <Image
                src="/images/hero_iphone.png"
                alt="Premium iPhones"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean Design */}
      <section
        style={{
          padding: '80px 0',
          background: '#0f172a',
          color: 'white'
        }}
      >
        <div
          className="container"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', textAlign: 'center' }}
        >
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>15k+</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{tStats('sold')}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>100+</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{tStats('partners')}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MIAMI</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{tStats('hq')}</p>
          </div>
        </div>
      </section>

      {/* About Section - Storytelling */}
      <section id="about" style={{ padding: '140px 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
            <div style={{ position: 'relative', height: '600px', borderRadius: '32px', overflow: 'hidden' }}>
              <Image
                src="/images/quality_check.png"
                alt="Quality Inspection"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: '48px', fontWeight: '850', marginBottom: '32px', color: '#0f172a', letterSpacing: '-2px', lineHeight: '1.1' }}>
                {tAbout('titlePrefix')} <span style={{ color: '#2563eb' }}>{tAbout('titleHighlight')}</span>
              </h2>
              <p style={{ fontSize: '18px', color: '#475569', marginBottom: '24px', lineHeight: '1.7' }}>
                {tAbout('p1')}
              </p>
              <p style={{ fontSize: '18px', color: '#475569', marginBottom: '40px', lineHeight: '1.7' }}>
                {tAbout('p2')}
              </p>
              <div style={{ display: 'grid', gap: '20px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                      ✓
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{(tAbout as any)(`list${i}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Quality focus */}
      <section id="products" style={{ padding: '140px 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px' }}>
            <span style={{ color: '#2563eb', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>{tProducts('subtitle')}</span>
            <h2 style={{ fontSize: '48px', fontWeight: '850', color: '#0f172a', marginTop: '16px', marginBottom: '24px', letterSpacing: '-2px' }}>{tProducts('title')}</h2>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.7' }}>{tProducts('description')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel" style={{ padding: '40px', background: 'white', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '32px', marginBottom: '24px' }}>{i === 1 ? '💎' : i === 2 ? '⚖️' : '⚙️'}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{(tProducts as any)(`item${i}Title`)}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>{(tProducts as any)(`item${i}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Lead Generation */}
      <section id="contact" style={{ padding: '140px 0', background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '48px', fontWeight: '850', color: '#0f172a', marginBottom: '24px', letterSpacing: '-2px' }}>{tContact('subtitle')}</h2>
              <p style={{ fontSize: '18px', color: '#475569', marginBottom: '40px', lineHeight: '1.7' }}>{tContact('title')}</p>

              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px 32px',
                  background: '#25d366',
                  color: 'white',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '18px',
                  boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '24px' }}>📱</span>
                {tContact('whatsappText')}
              </a>
            </div>

            <div style={{ background: '#f8fafc', padding: '48px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '32px' }}>{tContact('formTitle')}</h3>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{tContact('name')}</label>
                  <input type="text" style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="John Doe" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{tContact('email')}</label>
                  <input type="email" style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="john@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{tContact('message')}</label>
                  <textarea rows={4} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none' }} placeholder="..." />
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '16px' }}>{tContact('send')}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: '#0f172a' }}>
        <Footer />
      </div>
    </main>
  );
}
