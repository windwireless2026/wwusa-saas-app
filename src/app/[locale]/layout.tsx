import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WindWireless | Iphone B2B Solutions',
  description: 'Conectando o mercado americano de iPhones usados aos maiores lojistas do Brasil.',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }, { locale: 'es' }];
}

import { UIProvider } from '@/context/UIContext';
import { QueryProvider } from '@/context/QueryProvider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Ensure params is awaited if needed in newer Next.js or just treated as async
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['en', 'pt', 'es'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <UIProvider>{children}</UIProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
