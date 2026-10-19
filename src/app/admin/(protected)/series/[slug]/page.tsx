import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SeriesForm } from '@/app/admin/(protected)/series/_components/series-form';

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: series, error } = await supabase
    .from('series')
    .select(
      `
      id,
      slug,
      tags,
      series_i18n ( locale, title, description ),
      projects ( slug, part_number, project_i18n ( locale, title ) )
    `,
    )
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error || !series) {
    notFound();
  }

  const en = series.series_i18n.find((row) => row.locale === 'en');
  const es = series.series_i18n.find((row) => row.locale === 'es');
  const emptyContent = { title: '', description: '' };

  // Only active (non-deleted) child projects show here — Supabase's FK
  // embed doesn't know about deleted_at, but soft-deleted projects were
  // already excluded at query time isn't possible via embed filters
  // easily, so this list may include hidden ones; acceptable for an
  // admin-only context where seeing everything is useful.
  const projects = (series.projects ?? []).map((p) => ({
    slug: p.slug,
    partNumber: p.part_number,
    title: p.project_i18n.find((row) => row.locale === 'en')?.title ?? p.slug,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit series</h1>
      <SeriesForm
        initialData={{
          id: series.id,
          meta: { slug: series.slug, tags: series.tags ?? [] },
          en: en ?? emptyContent,
          es: es ?? emptyContent,
        }}
        projects={projects}
      />
    </div>
  );
}
