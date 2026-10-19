'use server';

import { redirect } from 'next/navigation';
import { createProjectSchema, type CreateProjectInput } from './schema';
import { requireAdmin } from '@/lib/supabase/require-admin';

type ActionResult = { success: true } | { success: false; error: string };

export async function createProject(
  input: CreateProjectInput,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) {
    return { success: false, error: 'Not authorized.' };
  }
  const { supabase } = auth;

  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: `${issue.path.join('.')}: ${issue.message}`,
    };
  }

  const { meta, en, es } = parsed.data;

  // RLS is enabled: this insert only succeeds for the admin session
  // (see public.is_admin()), on top of the requireAdmin() check above.
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      slug: meta.slug,
      status: meta.status,
      start_year: meta.start_year ?? null,
      end_year: meta.end_year ?? null,
      series_id: meta.series_id || null,
      part_number: meta.part_number ?? null,
      tags: meta.tags,
      links: meta.links,
    })
    .select('id')
    .single();

  if (projectError) {
    // 23505 = unique_violation, most likely the slug already exists.
    if (projectError.code === '23505') {
      return {
        success: false,
        error: 'A project with this slug already exists.',
      };
    }
    return { success: false, error: projectError.message };
  }

  const { error: i18nError } = await supabase.from('project_i18n').insert([
    { project_id: project.id, locale: 'en', ...en },
    { project_id: project.id, locale: 'es', ...es },
  ]);

  if (i18nError) {
    // Manual rollback: no DB transaction spans both inserts, so if the
    // translations fail we remove the orphaned project row rather than
    // leaving a project with no content behind.
    await supabase.from('projects').delete().eq('id', project.id);
    return { success: false, error: i18nError.message };
  }

  redirect(`/admin/projects/${meta.slug}`);
}

export async function updateProject(
  projectId: string,
  input: CreateProjectInput,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) {
    return { success: false, error: 'Not authorized.' };
  }
  const { supabase } = auth;

  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: `${issue.path.join('.')}: ${issue.message}`,
    };
  }

  const { meta, en, es } = parsed.data;

  const { error: projectError } = await supabase
    .from('projects')
    .update({
      slug: meta.slug,
      status: meta.status,
      start_year: meta.start_year ?? null,
      end_year: meta.end_year ?? null,
      series_id: meta.series_id || null,
      part_number: meta.part_number ?? null,
      tags: meta.tags,
      links: meta.links,
      // updated_at is bumped automatically by trg_projects_updated_at,
      // no need to set it here.
    })
    .eq('id', projectId);

  if (projectError) {
    if (projectError.code === '23505') {
      return {
        success: false,
        error: 'A project with this slug already exists.',
      };
    }
    return { success: false, error: projectError.message };
  }

  // Upsert on (project_id, locale): updates the existing row for each
  // locale rather than inserting a duplicate, relying on the
  // UNIQUE (project_id, locale) constraint from the schema.
  const { error: i18nError } = await supabase.from('project_i18n').upsert(
    [
      { project_id: projectId, locale: 'en', ...en },
      { project_id: projectId, locale: 'es', ...es },
    ],
    { onConflict: 'project_id,locale' },
  );

  if (i18nError) {
    return { success: false, error: i18nError.message };
  }

  redirect(`/admin/projects/${meta.slug}`);
}

export async function softDeleteProject(
  projectId: string,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) {
    return { success: false, error: 'Not authorized.' };
  }
  const { supabase } = auth;

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  redirect('/admin');
}
