import { getSeriesFromDb } from '@/lib/get-project-from-db';
import { createStaticClient } from '@/lib/supabase/static';
import SeriesCard from '@/components/home/series-card';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function Series() {
  const locale = await getLocale();
  const t = await getTranslations('series');

  const supabase = createStaticClient();
  const seriesList = await getSeriesFromDb(supabase, locale);

  if (seriesList.length === 0) {
    // No series yet — don't render an empty section header with
    // nothing under it.
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {t('sectionTitle')}
      </h2>

      <div className="mt-0 flex flex-col gap-8">
        {seriesList.map((series) => (
          <SeriesCard key={series.slug} series={series} />
        ))}
      </div>
    </section>
  );
}
