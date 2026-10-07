import { Series } from '@/lib/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, LayersIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function SeriesCard({ series }: { series: Series }) {
  const t = useTranslations('seriesCard');

  return (
    <article className="flex flex-col gap-3 border-b pb-8 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <LayersIcon className="size-4" />
        {t('partsCount', { count: series.partCount })}
      </div>

      <div>
        <h3 className="text-xl font-semibold tracking-tight">{series.title}</h3>
        <p className="mt-2 text-muted-foreground">{series.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {series.tags.map((tag) => (
          <Badge key={tag} variant={'secondary'}>
            {tag}
          </Badge>
        ))}
      </div>

      <Button variant={'default'} className={'w-fit px-4 py-2 text-foreground'}>
        <Link
          href={`/series/${series.slug}`}
          className="flex justify-center items-center gap-4"
        >
          {t('viewSeries')}
          <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
    </article>
  );
}
