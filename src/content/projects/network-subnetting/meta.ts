import type { ProjectMeta } from '@/lib/types/project';
import { LINKS } from '@/lib/constants/secret-keys';

export const meta: ProjectMeta = {
  slug: 'network-subnetting',
  cover: '/projects/network-subnetting/cover.webp',
  tags: [
    'HTML',
    'CSS',
    'JavaScript',
    'Networking',
    'Responsive Design',
    'Unit Testing',
  ],
  status: 'completed',
  startYear: 2023,
  links: [
    {
      label: LINKS.repository,
      url: 'https://github.com/JonatanAtenogenes/Network-Subnetting',
      icon: 'github',
    },
    {
      label: LINKS.demo,
      url: 'https://network-subnetting.onrender.com/',
      icon: 'globe',
    },
  ],
};
