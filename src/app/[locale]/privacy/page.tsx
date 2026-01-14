import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Privacy');

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <Header locale={locale} />

            <section style={{ paddingTop: '160px', paddingBottom: '100px' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '850', color: '#0f172a', marginBottom: '16px', letterSpacing: '-2px' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: '#64748b', marginBottom: '48px', fontWeight: '600' }}>{t('lastUpdated')}</p>

                    <div style={{ display: 'grid', gap: '40px' }}>
                        <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.7' }}>{t('intro')}</p>

                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{t('section1Title')}</h2>
                            <p style={{ color: '#475569', lineHeight: '1.7' }}>{t('section1Content')}</p>
                        </div>

                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{t('section2Title')}</h2>
                            <p style={{ color: '#475569', lineHeight: '1.7' }}>{t('section2Content')}</p>
                        </div>

                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{t('section3Title')}</h2>
                            <p style={{ color: '#475569', lineHeight: '1.7' }}>{t('section3Content')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div style={{ marginTop: 'auto', background: '#0f172a' }}>
                <Footer />
            </div>
        </main>
    );
}
