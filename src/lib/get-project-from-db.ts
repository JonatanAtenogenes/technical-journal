import { Project, ProjectLink, ProjectStatus } from '@/lib/types/project';
import { Locale } from 'next-intl';
import { createClient } from '@/lib/supabase/server';
import { getImagePublicUrl } from '@/lib/supabase/storage';

export type DbProjectResult = {
  project: Project;
  mdxContent: string;
  projectId: string;
};

// Fetches one project by slug, already shaped into the public site's
// `Project` type — so ProjectPage and its child components (CaseStudyHero,
// etc.) don't need to know or care that the data now comes from Supabase
// instead of meta.ts/metadata.ts files.
export async function getProjectFromDb(
  locale: Locale,
  slug: string,
): Promise<DbProjectResult | null> {
  const supabase = await createClient();

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
export async function getProjectSlugFromDb(): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select('slug')
    .is('deleted_at', null);

  return (data ?? []).map((row) => row.slug);
}
