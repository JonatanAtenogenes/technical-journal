import type { ProjectMeta } from '@/lib/types/project';
import { LINKS } from '@/lib/constants/secret-keys';

export const meta: ProjectMeta = {
  slug: 'employee-attrition',
  cover: '/projects/employee-attrition/cover.webp',
  tags: [
    'Python',
    'Pandas',
    'SQL',
    'SQLite',
    'SQLAlchemy',
    'Matplotlib',
    'Plotly',
    'Jupyter',
  ],
  status: 'in-progress',
  startYear: 2026,
  links: [
    {
      label: LINKS.repository,
      url: 'https://github.com/JonatanAtenogenes/HR-IBM-ATTRITION',
      icon: 'github',
    },
  ],
};
