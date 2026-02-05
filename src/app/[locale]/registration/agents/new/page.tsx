'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function RegistrationAgentsNewRedirectPage() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    router.replace(`/${locale}/finance/agents/new`);
  }, [locale, router]);
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
      Redirecionando...
    </div>
  );
}
