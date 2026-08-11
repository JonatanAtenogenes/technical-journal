import { createClient } from '@/lib/supabase/server';
import { ProjectForm } from '@/app/admin/(protected)/_components/project-form';

export default async function NewProjectPage() {
  const supabase = await createClient();

  // Only active series, only what the <select> needs.
  const { data: series } = await supabase
    .from('series')
    .select('id, slug, series_i18n!inner ( title )')
    .is('deleted_at', null)
    .eq('series_i18n.locale', 'en')
    .order('slug');

  const seriesOptions = (series ?? []).map((s) => ({
    id: s.id,
    label: s.series_i18n[0]?.title ?? s.slug,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <ProjectForm seriesOptions={seriesOptions} />
    </div>
  );
}
