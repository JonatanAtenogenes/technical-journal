import { Project, ProjectLink, ProjectStatus } from '@/lib/types/project';
import { Locale } from 'next-intl';
import { createClient } from '@/lib/supabase/server';
import { getImagePublicUrl } from '@/lib/supabase/storage';
import { SupabaseClient } from '@supabase/supabase-js';

export type DbProjectResult = {
  project: Project;
  mdxContent: string;
  projectId: string;
};

// Fetches one project by slug, already shaped into the public site's
// `Project` type — so ProjectPage and its child components (CaseStudyHero,
// etc.) don't need to know or care that the data now comes from Supabase
// instead of meta.ts/metadata.ts files.
//
// Takes the Supabase client as a parameter instead of creating one
// internally, since this function is used both from request-context
// pages (session-aware client) and from generateStaticParams (static,
// cookie-free client). The caller decides which one applies.
export async function getProjectFromDb(
  supabase: SupabaseClient,
  locale: Locale,
  slug: string,
): Promise<DbProjectResult | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      slug,
      status,
      start_year,
      end_year,
      tags,
      links,
      cover:cover_image_id ( storage_path ),
      project_i18n ( locale, title, description, category, mdx_content )
    `,
    )
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return null;
  }

  const i18n = data.project_i18n.find((row) => row.locale === locale);

  if (!i18n) {
    // No translation for this locale — treat as not found rather than
    // rendering an empty page.
    return null;
  }

  // Same normalization used throughout the admin: without generated
  // Database types, Supabase can't always tell this FK is a to-one
  // relation, so it may type/return the embed as an array.
  const cover = Array.isArray(data.cover)
    ? (data.cover[0] ?? null)
    : (data.cover ?? null);

  const project: Project = {
    slug: data.slug,
    cover: cover ? getImagePublicUrl(cover.storage_path) : '',
    tags: data.tags ?? [],
    status: data.status as ProjectStatus,
    startYear: data.start_year ?? new Date().getFullYear(),
    endYear: data.end_year ?? undefined,
    links: (data.links ?? []) as ProjectLink[],
    title: i18n.title ?? '',
    category: i18n.category ?? '',
    description: i18n.description,
  };

  return { project, mdxContent: i18n.mdx_content, projectId: data.id };
}

// Used by generateStaticParams — only pre-renders routes for projects
// that actually exist in the DB (and aren't hidden), instead of the old
// hardcoded 5-project list from lib/projects.ts.
//
// Always called with the static, cookie-free client, since
// generateStaticParams has no request context to read a session from.
export async function getProjectSlugFromDb(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .is('deleted_at', null);

  return (data ?? []).map((row) => row.slug);
}

// Fetches all visible projects for the home page listing, ordered by
// start_year descending (most recent first) and already shaped into the
// public site's `Project` type — same normalization logic as
// getProjectFromDb, but for the list instead of a single row.
//
// The database is the source of truth for status: drafts are excluded
// here since they aren't ready for the public listing.
export async function getProjectsFromDb(
  supabase: SupabaseClient,
  locale: Locale,
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      slug,
      status,
      start_year,
      end_year,
      tags,
      links,
      cover:cover_image_id ( storage_path ),
      project_i18n ( locale, title, description, category )
      `,
    )
    .is('deleted_at', null)
    .order('start_year', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const i18n = row.project_i18n.find((r) => r.locale === locale);

      if (!i18n) {
        // No translation for this locale — skip rather than render a
        // blank card.
        return null;
      }

      // Same array/object normalization as getProjectFromDb — without
      // generated Database types, Supabase can't always tell this FK
      // is a to-one relation.
      const cover = Array.isArray(row.cover)
        ? (row.cover[0] ?? null)
        : (row.cover ?? null);

      const project: Project = {
        slug: row.slug,
        cover: cover ? getImagePublicUrl(cover.storage_path) : '',
        tags: row.tags ?? [],
        status: row.status as ProjectStatus,
        startYear: row.start_year ?? new Date().getFullYear(),
        endYear: row.end_year ?? undefined,
        links: (row.links ?? []) as ProjectLink[],
        title: i18n.title ?? '',
        category: i18n.category ?? '',
        description: i18n.description,
      };

      return project;
    })
    .filter((p): p is Project => p !== null);
}
