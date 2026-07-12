import { formatProjectYears } from '@/lib/project-status';
import { Project } from '@/lib/types/project';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function CaseStudyHero({ project }: { project: Project }) {
  const t = useTranslations('projectStatus');

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
        {project.title}
      </h1>
      <p className="mt-2 text-sm font-medium text-muted-foreground">
        {project.category}
      </p>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag} variant={'secondary'}>
            {tag}
          </Badge>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t(project.status)} .{' '}
        {formatProjectYears(project.startYear, project.endYear)}
      </p>
    </div>
  );
}
