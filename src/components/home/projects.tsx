import { getProjects } from '@/lib/projects';
import ProjectCard from '@components/home/project-card';

export default function Projects() {
  const projects = getProjects();

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Projects
      </h2>

      <div className="mt-0 flex flex-col gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
