'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function RegistrationAgentsIdRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const id = params.id as string;
  useEffect(() => {
    if (id) router.replace(`/${locale}/finance/agents/${id}`);
  }, [locale, router, id]);
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
      Redirecionando...
    </div>
  );
}
