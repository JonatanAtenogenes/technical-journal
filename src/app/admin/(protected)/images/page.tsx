import { createClient } from '@/lib/supabase/server';
import { ContentImageRow } from './_components/content-images-manager';
import { ImagesPageClient } from './_components/images-page-client';

export default async function AdminImagesPage() {
  const supabase = await createClient();

  // Fetch everything up front (projects + all their content images) so
  // switching the project dropdown is instant, no extra round trip.
  // Fine at this scale (single-author portfolio, a handful of projects).
  const [{ data: projectsData }, { data: imagesData }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, slug, created_at, project_i18n!inner ( title )')
      .is('deleted_at', null)
      .eq('project_i18n.locale', 'en')
      .order('created_at', { ascending: false }),
    supabase
      .from('images')
      .select('id, storage_path, slot_key, width, height, alt, project_id')
      .eq('kind', 'content')
      .order('position', { ascending: true, nullsFirst: false }),
  ]);

  const projects = (projectsData ?? []).map((p) => ({
    id: p.id,
    label: p.project_i18n[0]?.title ?? p.slug,
  }));

  // Most recently created project is first (order by created_at desc
  // above), so it's the natural default selection.
  const defaultProjectId = projectsData?.[0]?.id ?? null;

  const imagesByProject: Record<string, ContentImageRow[]> = {};
  for (const image of imagesData ?? []) {
    if (!image.project_id) continue;
    if (!imagesByProject[image.project_id])
      imagesByProject[image.project_id] = [];
    imagesByProject[image.project_id].push(image);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Images</h1>
      <ImagesPageClient
        projects={projects}
        defaultProjectId={defaultProjectId}
        imagesByProject={imagesByProject}
      />
    </div>
  );
}
