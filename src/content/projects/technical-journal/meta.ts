import type { ProjectMeta } from '@/lib/types/project';
import { LINKS } from '@/lib/constants/secret-keys';

export const meta: ProjectMeta = {
  slug: 'technical-journal',
  cover: '/projects/technical-journal/cover.webp',
  tags: [
    'Next.js',
    'TypeScript',
    'MDX',
    'Tailwind CSS',
    'Base UI',
    'Shadcn',
    'Content Collections',
  ],
  status: 'in-progress',
  startYear: 2026,
  links: [
    {
      label: LINKS.repository,
      url: 'https://github.com/JonatanAtenogenes/technical-journal',
      icon: 'github',
    },
    {
      label: LINKS.demo,
      url: 'https://technical-journal.onrender.com',
      icon: 'globe',
    },
  ],
};
