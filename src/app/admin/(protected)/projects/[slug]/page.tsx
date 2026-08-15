import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSeriesOptions } from '@/app/admin/(protected)/projects/data';
import { ProjectForm } from '@/app/admin/(protected)/projects/_components/project-form';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: project, error }, seriesOptions] = await Promise.all([
    supabase
      .from('projects')
      .select(
        `
        id,
        slug,
        status,
        start_year,
        series_id,
        part_number,
        tags,
        links,
        project_i18n ( locale, title, description, category, part_tags, mdx_content )
      `,
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .single(),
    getSeriesOptions(),
  ]);

  if (error || !project) {
    notFound();
  }

  const en = project.project_i18n.find((row) => row.locale === 'en');
  const es = project.project_i18n.find((row) => row.locale === 'es');

  const emptyContent = {
    title: '',
    description: '',
    category: '',
    part_tags: [] as string[],
    mdx_content: '',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit project</h1>
      <ProjectForm
        seriesOptions={seriesOptions}
        initialData={{
          id: project.id,
          meta: {
            slug: project.slug,
            status: project.status,
            start_year: project.start_year ?? undefined,
            series_id: project.series_id ?? undefined,
            part_number: project.part_number ?? undefined,
            tags: project.tags ?? [],
            links: project.links ?? [],
          },
          en: en ?? emptyContent,
          es: es ?? emptyContent,
        }}
      />
    </div>
  );
}
