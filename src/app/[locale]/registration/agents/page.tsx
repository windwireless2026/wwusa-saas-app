'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function RegistrationAgentsRedirectPage() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    router.replace(`/${locale}/finance/agents`);
  }, [locale, router]);
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
      Redirecionando para o Módulo Financeiro...
    </div>
  );
}
