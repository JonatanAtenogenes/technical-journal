import {
  Project,
  ProjectLink,
  ProjectStatus,
  Series,
  SeriesDetail,
  SeriesProjectEntry,
} from '@/lib/types/project';
import { Locale } from 'next-intl';
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
    .is('series_id', null)
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

// Fetches all visible series for the home page, each annotated with how
// many active parts it has and the start_year of part 1 — the anchor
// Jonatan chose for ordering series among themselves, since series.start_year
// doesn't exist (start_year lives on projects, per the schema).
export async function getSeriesFromDb(
  supabase: SupabaseClient,
  locale: Locale,
): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select(
      `
      slug,
      tags,
      series_i18n ( locale, title, description ),
      projects ( part_number, start_year, deleted_at )
    `,
    )
    .is('deleted_at', null);

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const i18n = row.series_i18n.find((r) => r.locale === locale);

      if (!i18n) {
        return null;
      }

      const activeProjects = (row.projects ?? []).filter(
        (p) => p.deleted_at === null,
      );

      // Anchor is part 1's start_year. If part 1 happens to be
      // individually hidden, fall back to the earliest start_year still
      // active, rather than letting the series vanish from ordering.
      const partOne = activeProjects.find((p) => p.part_number === 1);
      const fallbackYear = activeProjects.length
        ? Math.min(...activeProjects.map((p) => p.start_year ?? Infinity))
        : new Date().getFullYear();
      const startYear = partOne?.start_year ?? fallbackYear;

      const series: Series = {
        slug: row.slug,
        tags: row.tags ?? [],
        title: i18n.title,
        description: i18n.description,
        partCount: activeProjects.length,
        startYear,
      };

      return series;
    })
    .filter((s): s is Series => s !== null)
    .sort((a, b) => b.startYear - a.startYear);
}

// Fetches one series by slug plus its active projects, ordered by
// part_number — reuses the same Project shape as getProjectFromDb so
// ProjectCard works unchanged inside the series detail page.
export async function getSeriesBySlug(
  supabase: SupabaseClient,
  locale: Locale,
  slug: string,
): Promise<SeriesDetail | null> {
  const { data, error } = await supabase
    .from('series')
    .select(
      `
      slug,
      tags,
      series_i18n ( locale, title, description ),
      projects (
        slug,
        status,
        start_year,
        end_year,
        tags,
        links,
        part_number,
        deleted_at,
        cover:cover_image_id ( storage_path ),
        project_i18n ( locale, title, description, category )
      )
    `,
    )
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return null;
  }

  const i18n = data.series_i18n.find((r) => r.locale === locale);

  if (!i18n) {
    return null;
  }

  const projects = (data.projects ?? [])
    .filter((row) => row.deleted_at === null)
    .map((row) => {
      const projectI18n = row.project_i18n.find((r) => r.locale === locale);

      if (!projectI18n) {
        return null;
      }

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
        title: projectI18n.title ?? '',
        category: projectI18n.category ?? '',
        description: projectI18n.description,
      };

      return { project, partNumber: row.part_number };
    })
    .filter((p): p is SeriesProjectEntry => p !== null)
    .sort((a, b) => (a.partNumber ?? 0) - (b.partNumber ?? 0));

  return {
    slug: data.slug,
    tags: data.tags ?? [],
    title: i18n.title,
    description: i18n.description,
    projects,
  };
}

// Used by generateStaticParams on the series detail route — only
// pre-renders series that actually exist and aren't hidden.
export async function getSeriesSlugsFromDb(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data } = await supabase
    .from('series')
    .select('slug')
    .is('deleted_at', null);

  return (data ?? []).map((row) => row.slug);
}
