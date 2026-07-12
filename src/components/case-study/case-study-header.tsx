import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/theme-toggle';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/shared/locale-switcher';

export default function CaseStudyHeader() {
  const t = useTranslations('caseStudyHeader');
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-12 items-center justify-between px-4">
        <Link
          href={'/'}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t('caseStudies')}
        </Link>

        <div className={'flex items-center ml-1 border-l pl-2'}>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
