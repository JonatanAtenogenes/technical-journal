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
        end_year,
        series_id,
        part_number,
        tags,
        links,
        cover:cover_image_id (id, storage_path, width, height, alt),
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

  // Supabase's client (without generated Database types) can't always
  // tell this is a to-one relation (cover_image_id lives on `projects`),
  // so it sometimes infers/returns the embed as an array. Normalize
  // either shape to a single object or null.
  const cover = Array.isArray(project.cover)
    ? (project.cover[0] ?? null)
    : (project.cover ?? null);

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
            end_year: project.end_year ?? undefined,
            series_id: project.series_id ?? undefined,
            part_number: project.part_number ?? undefined,
            tags: project.tags ?? [],
            links: project.links ?? [],
          },
          en: en ?? emptyContent,
          es: es ?? emptyContent,
          cover: cover,
        }}
      />
    </div>
  );
}
