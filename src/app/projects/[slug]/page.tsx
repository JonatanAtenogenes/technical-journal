import { getProjectBySlug, getProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

// Pre-renders one static route per registered project at build time —
// consistent with the "fully static" architecture from the project vision.
export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
      {/* Hero: title, description, tags — built in the next step */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-20">
          {/* <CaseStudyHero project={project} /> */}
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-[1fr_240px]">
        {/* Main content — mock sections come in step 6, real MDX in step 8 */}
        <article className="max-w-3xl">
          {/* Case study content goes here */}
        </article>

        {/* Table of contents — always visible on desktop, hidden on mobile
            (mobile gets the reading progress line instead, step 5) */}

        <aside className="hidden lg:block">
          <div className="sticky top-20">{/* <TableOfContents /> */}</div>
        </aside>
      </div>

      {/* Reading progress — desktop: fixed footer, mobile: thin line under header. Step 5. */}
      {/* <ReadingProgress /> */}
    </main>
  );
}
