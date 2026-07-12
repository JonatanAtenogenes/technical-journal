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

type ProjectPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
};

// Pre-renders one static route per locale × registered project at build
// time — consistent with the "fully static" architecture from the
// project vision, now extended across both languages.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProjects(locale).map((project) => ({
      locale,
      slug: project.slug,
    })),
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(locale, slug);

  if (!project) {
    notFound();
  }

  const content = await getProjectContent(locale, slug);

  if (!content) {
    notFound();
  }

  const tableOfContents = getTableOfContents(content);

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
            <div
              className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
              <TableOfContents items={tableOfContents} />
            </div>
          </aside>

          <article className="prose dark:prose-invert max-w-3xl">
            <MDXRemote
              source={content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [rehypeExpressiveCode, expressiveCodeOptions],
                    rehypeSlug],
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
