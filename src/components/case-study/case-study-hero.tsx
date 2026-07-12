import { formatProjectYears } from '@/lib/project-status';
import { Project } from '@/lib/types/project';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Terminal, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap = {
  github: Terminal,
  'external-link': ExternalLink,
  globe: Globe,
};

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
      {
        project.links && project.links.length > 0 && (
          <div className={'flex gap-2 mt-4'}>
            {project.links.map((link) => {
              const Icon = link.icon ? iconMap[link.icon] : ExternalLink;
              return (
                <Button key={link.url} variant={'outline'} size={'sm'}>
                  <a
                    href={link.url}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                    className={'flex items-center justify-center gap-2'}
                  >
                    <Icon className={'size-4'} />
                    {link.label}
                  </a>
                </Button>
              );
            })}
          </div>
        )
      }
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
