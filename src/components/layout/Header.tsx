import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from './LanguageSelector';
import { useTranslations } from 'next-intl';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('Header');

  return (
    <header className="glass-header" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '180px', height: '40px', position: 'relative' }}>
            <Image
              src="/images/wind_wireless.png"
              alt="WindWireless Logo"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left center' }}
            />
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link
            href="#about"
            style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}
          >
            {t('about')}
          </Link>
          <Link
            href="#products"
            style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}
          >
            {t('products')}
          </Link>
          <Link
            href="#contact"
            style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}
          >
            {t('contact')}
          </Link>
        </nav>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <LanguageSelector locale={locale} />
          <Link
            href="/auth/login"
            className="btn-secondary"
            style={{ padding: '8px 20px', fontSize: '14px' }}
          >
            {t('login')}
          </Link>
        </div>
      </div>
    </header>
  );
}
