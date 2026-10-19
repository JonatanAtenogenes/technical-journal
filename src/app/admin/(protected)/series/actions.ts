'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createSeriesSchema, type CreateSeriesInput } from './schema';

type ActionResult = { success: true } | { success: false; error: string };

export async function createSeries(
  input: CreateSeriesInput,
): Promise<ActionResult> {
  const parsed = createSeriesSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: `${issue.path.join('.')}: ${issue.message}`,
    };
  }

  const { meta, en, es } = parsed.data;
  const supabase = await createClient();

  const { data: series, error: seriesError } = await supabase
    .from('series')
    .insert({ slug: meta.slug, tags: meta.tags })
    .select('id')
    .single();

  if (seriesError) {
    if (seriesError.code === '23505') {
      return {
        success: false,
        error: 'A series with this slug already exists.',
      };
    }
    return { success: false, error: seriesError.message };
  }

  const { error: i18nError } = await supabase.from('series_i18n').insert([
    { series_id: series.id, locale: 'en', ...en },
    { series_id: series.id, locale: 'es', ...es },
  ]);

  if (i18nError) {
    // Manual rollback, same reasoning as projects: no cross-table
    // transaction, so remove the orphaned series row on failure.
    await supabase.from('series').delete().eq('id', series.id);
    return { success: false, error: i18nError.message };
  }

  redirect(`/admin/series/${meta.slug}`);
}

export async function updateSeries(
  seriesId: string,
  input: CreateSeriesInput,
): Promise<ActionResult> {
  const parsed = createSeriesSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: `${issue.path.join('.')}: ${issue.message}`,
    };
  }

  const { meta, en, es } = parsed.data;
  const supabase = await createClient();

  const { error: seriesError } = await supabase
    .from('series')
    .update({ slug: meta.slug, tags: meta.tags })
    .eq('id', seriesId);

  if (seriesError) {
    if (seriesError.code === '23505') {
      return {
        success: false,
        error: 'A series with this slug already exists.',
      };
    }
    return { success: false, error: seriesError.message };
  }

  const { error: i18nError } = await supabase.from('series_i18n').upsert(
    [
      { series_id: seriesId, locale: 'en', ...en },
      { series_id: seriesId, locale: 'es', ...es },
    ],
    { onConflict: 'series_id,locale' },
  );

  if (i18nError) {
    return { success: false, error: i18nError.message };
  }

  redirect(`/admin/series/${meta.slug}`);
}

export async function softDeleteSeries(
  seriesId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('series')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', seriesId);

  if (error) {
    return { success: false, error: error.message };
  }

  // No app-side cascade needed here: trg_cascade_series_soft_delete
  // (see Database Schema doc) hides every currently-active project in
  // this series automatically when its deleted_at goes NULL -> value.
  redirect('/admin/series');
}
