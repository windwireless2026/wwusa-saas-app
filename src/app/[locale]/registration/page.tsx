'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

/** Redireciona /registration para /finance (agentes e cadastros estão no Módulo Financeiro). */
export default function RegistrationRedirectPage() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    router.replace(`/${locale}/finance`);
  }, [locale, router]);
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
      Redirecionando para o Módulo Financeiro...
    </div>
  );
}
