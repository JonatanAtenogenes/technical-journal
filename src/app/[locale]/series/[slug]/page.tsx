import { Locale } from 'next-intl';
import { createStaticClient } from '@/lib/supabase/static';
import {
  getSeriesBySlug,
  getSeriesSlugsFromDb,
} from '@/lib/get-project-from-db';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import ProjectCard from '@/components/home/project-card';
import CaseStudyHeader from '@/components/case-study/case-study-header';
import { getTranslations } from 'next-intl/server';

type SeriesPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

// Pre-renders one static route per locale × series that actually exists
// (and isn't hidden). Same reasoning as the project detail route:
// dynamicParams stays at its default (true), so a series created after
// the last build still renders on first visit instead of 404ing.
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const slugs = await getSeriesSlugsFromDb(supabase);
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { locale, slug } = await params;

  // Public page, no session needed — same static-client reasoning as
  // the project detail page (see src/app/[locale]/projects/[slug]/page.tsx).
  const supabase = createStaticClient();
  const series = await getSeriesBySlug(supabase, locale, slug);

  if (!series) {
    notFound();
  }

  const t = await getTranslations('seriesDetail');

  return (
    <>
      <CaseStudyHeader />
      <main>
        <div className={'border-b'}>
          <div className={'container mx-auto px-4 py-16 md:py-20'}>
            <h1 className={'text-3xl font-semibold tracking-tight md:text-4xl'}>
              {series.title}
            </h1>
            <p className={'mt-6 max-w-2xl text-lg text-muted-foreground'}>
              {series.description}
            </p>

            <div className={'mt-8 flex flex-wrap gap-2'}>
              {series.tags.map((tag) => (
                <Badge key={tag} variant={'secondary'}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className={'container mx-auto px-4 py-16'}>
          <div className={'flex flex-col gap-8'}>
            {series.projects.map(({ project, partNumber }) => (
              <div key={project.slug} className={'flex flex-col gap-2'}>
                {partNumber !== null && (
                  <span className={'text-sm font-medium text-muted-foreground'}>
                    {t('partLabel', { number: partNumber })}
                  </span>
                )}
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
