'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { HEADING_INDEX } from '@/lib/constants/secret-keys';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const nextLocale = locale === 'en' ? 'es' : 'en';

  function switchLocale() {
    // Find every heading with an id (the ones rehype-slug generated)
    // inside the article, in DOM order — this order matches the
    // `sections` array that ReadingProgress already computes.
    const headings = Array.from(
      document.querySelectorAll('article [id]'),
    ) as HTMLElement[];

    // Determine which heading is currently "active" using the same
    // offset-based check as the scrollspy logic.
    const offset = 120;
    let currentIndex = 0;
    headings.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= offset) {
        currentIndex = i;
      }
    });

    if (headings.length > 0) {
      sessionStorage.setItem(HEADING_INDEX, String(currentIndex));
    }

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
