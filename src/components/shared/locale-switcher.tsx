'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const nextLocale = locale === 'en' ? 'es' : 'en';

  function switchLocale() {
    router.replace(pathname, {
      locale: nextLocale,
    });
  }

  return (
    <Button
      variant={'ghost'}
      size={'sm'}
      onClick={switchLocale}
      aria-label={`Switch to ${nextLocale === 'es' ? 'Spanish' : 'English'}`}
    >
      {nextLocale === 'es' ? 'ES' : 'EN'}
    </Button>
  );
}
