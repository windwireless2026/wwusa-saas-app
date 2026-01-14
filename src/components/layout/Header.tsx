'use client';

import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from './LanguageSelector';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('Header');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        background: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid #e2e8f0' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: isScrolled ? '70px' : '90px',
          transition: 'height 0.3s ease'
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '180px', height: '40px', position: 'relative' }}>
            <Image
              src="/images/wind_wireless.png"
              alt="WindWireless Logo"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left center' }}
            />
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <Link
            href="#about"
            style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {t('about')}
          </Link>
          <Link
            href="#products"
            style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {t('products')}
          </Link>
          <Link
            href="#contact"
            style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {t('contact')}
          </Link>
        </nav>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <LanguageSelector locale={locale} />
          <Link
            href="/auth/login"
            className="btn-secondary"
            style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '800' }}
          >
            {t('login')}
          </Link>
        </div>
      </div>
    </header>
  );
}
