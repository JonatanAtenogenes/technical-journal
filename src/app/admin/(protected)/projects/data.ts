import { createClient } from '@/lib/supabase/server';

export async function getSeriesOptions() {
  const supabase = await createClient();

  const { data: series } = await supabase
    .from('series')
    .select('id, slug, series_i18n!inner ( title )')
    .is('deleted_at', null)
    .eq('series_i18n.locale', 'en')
    .order('slug');

  return (series ?? []).map((s) => ({
    id: s.id,
    label: s.series_i18n[0]?.title ?? s.slug,
  }));
}
