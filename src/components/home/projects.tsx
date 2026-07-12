import { getProjects } from '@/lib/projects';
import ProjectCard from '@/components/home/project-card';
import { useTranslations, useLocale } from 'next-intl';

export default function Projects() {
  const locale = useLocale();
  const t = useTranslations('projects');
  const projects = getProjects(locale);

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {t('sectionTitle')}
      </h2>

      <div className="mt-0 flex flex-col gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
