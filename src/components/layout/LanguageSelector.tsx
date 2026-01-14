'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSelector({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // Basic replacement for now. In a real app with next-intl, we'd use a robust path replacement.
    // Assuming path starts with /en, /pt, or /es
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  const flags: Record<string, string> = {
    pt: '🇧🇷',
    en: '🇺🇸',
    es: '🇪🇸',
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {['pt', 'en', 'es'].map(l => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          style={{
            background: locale === l ? 'rgba(0, 71, 171, 0.1)' : 'transparent',
            border: locale === l ? '1px solid var(--color-primary-light)' : '1px solid transparent',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '14px',
            filter: locale === l ? 'none' : 'grayscale(100%)',
            opacity: locale === l ? 1 : 0.6,
            transition: 'all 0.2s',
          }}
          title={l.toUpperCase()}
        >
          {flags[l]}
        </button>
      ))}
    </div>
  );
}
