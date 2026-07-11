import CaseStudyHeader from '@/components/case-study/case-study-header';
import CaseStudyHero from '@/components/case-study/case-study-hero';
import TableOfContents, {
  TableOfContentsItem,
} from '@/components/case-study/table-of-contents';
import { getProjectBySlug, getProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

// Temporary mock — replaced in a later step by headings generated
// automatically from the MDX content.
const mockTableOfContents: TableOfContentsItem[] = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'business-understanding', title: 'Business Understanding' },
  {
    id: 'data-understanding',
    title: 'Data Understanding',
    subitems: [
      { id: 'dataset-overview', title: 'Dataset Overview' },
      { id: 'data-quality', title: 'Data Quality' },
    ],
  },
  { id: 'data-preparation', title: 'Data Preparation' },
  { id: 'exploratory-data-analysis', title: 'Exploratory Data Analysis' },
  { id: 'key-findings', title: 'Key Findings' },
  { id: 'conclusions', title: 'Conclusions' },
];

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
    <>
      <CaseStudyHeader />
      <main>
        <div className="border-b">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <CaseStudyHero project={project} />
          </div>
        </div>

        <aside className="lg:block">
          <div className="lg:sticky lg:top-20">
            <TableOfContents items={mockTableOfContents} />
          </div>
        </aside>

        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-[1fr_240px]">
          {/* Main content — mock sections come in step 6, real MDX in step 8 */}
          <article className="max-w-3xl">
            {/* Case study content goes here */}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-20">{/* <TableOfContents /> */}</div>
          </aside>
        </div>

        {/* Reading progress — desktop: fixed footer, mobile: thin line under header. Step 5. */}
        {/* <ReadingProgress /> */}
      </main>
    </>
  );
}
