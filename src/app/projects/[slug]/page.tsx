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

  // Placeholder content — just enough to confirm the route resolves
  // correctly for a real project and 404s for an unknown one.
  // Hero, table of contents, reading progress, and real content come next.
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
      <p className="mt-4 text-muted-foreground">{project.description}</p>
    </main>
  );
}
