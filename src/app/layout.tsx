import type { Metadata } from 'next';
import { Geist, Geist_Mono, Raleway } from 'next/font/google';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';

const raleway = Raleway({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Fallback metadata for routes that don't override it (e.g. /admin).
// Locale-specific public pages still get their own metadata from
// [locale]/metadata.ts as before — this is unrelated to that split.
export const metadata: Metadata = {
  title: 'Technical Journal',
  description:
    'A collection of software engineering and data case studies documenting architecture, implementation and lessons learned.',
};

// True root layout. Holds <html>/<body> because it's the single layout
// shared by every route in the app — both /[locale]/* (public site) and
// /admin/* (admin panel, no i18n). Next.js only allows one root layout
// with these tags, so next-intl's NextIntlClientProvider moved down into
// [locale]/layout.tsx, which no longer renders <html>/<body> itself.
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang={'en'}
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        raleway.variable,
      )}
    >
      <body className={'min-h-full flex flex-col'}>
        <ThemeProvider attribute={'class'} defaultTheme={'system'} enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
