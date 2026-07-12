import { Project } from '@/lib/types/project';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations('projectCard');

  return (
    <article className="flex flex-col gap-4 border-b pb-8 last:border-b-0 last:pb-0 md:flex-row md:gap-8">
      <div className="md:w-64 md:shrink-0">
        <AspectRatio
          ratio={16 / 9}
          className="overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={project.cover}
            alt={project.title}
            fill
            preload
            sizes="(min-width: 768px) 256px, 100vw"
            className="object-cover"
          />
        </AspectRatio>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            {project.title}
          </h3>
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant={'secondary'}>
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          variant={'default'}
          className={'w-fit px-4 py-2 text-foreground'}
        >
          <Link
            href={`/projects/${project.slug}`}
            className="flex justify-center items-center gap-4"
          >
            {t('readCaseStudy')}
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
