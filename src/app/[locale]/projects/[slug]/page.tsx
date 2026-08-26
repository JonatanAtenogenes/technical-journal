import CaseStudyHeader from '@/components/case-study/case-study-header';
import CaseStudyHero from '@/components/case-study/case-study-hero';
import TableOfContents from '@/components/case-study/table-of-contents';
import { getProjectContent } from '@/lib/get-project-content';
import { getProjectBySlug, getProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { expressiveCodeOptions } from '@/lib/mdx/expressive-code-config';
import { getTableOfContents } from '@/lib/get-table-of-contents';
import ReadingProgress from '@/components/case-study/reading-progress';
import type { Locale } from 'next-intl';
import { routing } from '@/i18n/routing';
import {
  getProjectFromDb,
  getProjectSlugFromDb,
} from '@/lib/get-project-from-db';
import { createClient } from '@/lib/supabase/server';
import { createMdxComponents } from '@/components/mdx/project-image';

type ProjectPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

// Pre-renders one static route per locale × project that actually exists
// in the database (and isn't hidden) — replaces the old hardcoded
// 5-project list from lib/projects.ts now that content lives in Supabase.
// dynamicParams stays at its default (true), so a project created after
// the last build still renders on first visit instead of 404ing.
export async function generateStaticParams() {
  const slugs = await getProjectSlugFromDb();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  const result = await getProjectFromDb(locale, slug);

  if (!result) {
    notFound();
  }

  const { project, mdxContent, projectId } = result;

  // Content images referenced inside this project's MDX via
  // <ProjectImage slot="..." /> — fetched once, resolved in-memory by
  // the components factory (see components/mdx/project-image.tsx).
  const supabase = await createClient();
  const { data: contentImages } = await supabase
    .from('images')
    .select('slot_key, storage_path, width, height, alt, caption')
    .eq('project_id', projectId)
    .eq('kind', 'content');

  const tableOfContents = getTableOfContents(mdxContent);

  return (
    <>
      <CaseStudyHeader />
      <main>
        <div className="border-b">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <CaseStudyHero project={project} />
          </div>
        </div>

        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-[1fr_240px]">
          <aside className="lg:order-last">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
              <TableOfContents items={tableOfContents} />
            </div>
          </aside>

          <article className="prose dark:prose-invert max-w-3xl">
            <MDXRemote
              source={mdxContent}
              components={createMdxComponents(
                contentImages ?? [],
                locale as 'en' | 'es',
              )}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [rehypeExpressiveCode, expressiveCodeOptions],
                    rehypeSlug,
                  ],
                },
              }}
            />
          </article>
        </div>

        <ReadingProgress items={tableOfContents} />
      </main>
    </>
  );
}
