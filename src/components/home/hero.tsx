import TechStackRow from '@/components/shared/tech-stack-row';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="container mx-auto px-4 pt-14 md:pt-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t('title')}
        </h1>

        <p className="mt-6 text-lg text-muted-foreground">{t('tagline')}</p>

        <p className="mt-8 text-base leading-relaxed text-muted-foreground">
          {t('description')}
        </p>

        <div className="mt-8">
          <TechStackRow />
        </div>
      </div>
    </section>
  );
}
