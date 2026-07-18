import { Locale } from 'next-intl';
import { Project, ProjectMeta, ProjectTranslation } from '@/lib/types/project';

import { meta as homeServerMeta } from '@/content/projects/home-server/meta';
import { metadata as homeServerEn } from '@/content/projects/home-server/en/metadata';
import { metadata as homeServerEs } from '@/content/projects/home-server/es/metadata';
import { meta as employeeAttritionMeta } from '@/content/projects/employee-attrition/meta';
import { metadata as employeeAttritionEn } from '@/content/projects/employee-attrition/en/metadata';
import { metadata as employeeAttritionEs } from '@/content/projects/employee-attrition/es/metadata';
import { meta as technicalJournalMeta } from '@/content/projects/technical-journal/meta';
import { metadata as technicalJournalEn } from '@/content/projects/technical-journal/en/metadata';
import { metadata as technicalJournalEs } from '@/content/projects/technical-journal/es/metadata';
import { meta as networkSubnettingMeta } from '@/content/projects/network-subnetting/meta';
import { metadata as networkSubnettingEn } from '@/content/projects/network-subnetting/en/metadata';
import { metadata as networkSubnettingEs } from '@/content/projects/network-subnetting/es/metadata';
import { meta as opsTerminalMeta } from '@/content/projects/ops-terminal/meta';
import { metadata as opsTerminalEn } from '@/content/projects/ops-terminal/en/metadata';
import { metadata as opsTerminalEs } from '@/content/projects/ops-terminal/es/metadata';

// Structural data: one entry per project, locale-independent.
const projectMetas: ProjectMeta[] = [
  technicalJournalMeta,
  networkSubnettingMeta,
  homeServerMeta,
  employeeAttritionMeta,
  opsTerminalMeta,
];

// Translations: keyed by locale, then by slug.
const translations: Record<Locale, Record<string, ProjectTranslation>> = {
  en: {
    'technical-journal': technicalJournalEn,
    'network-subnetting': networkSubnettingEn,
    'home-server': homeServerEn,
    'employee-attrition': employeeAttritionEn,
    'ops-terminal': opsTerminalEn,
  },
  es: {
    'technical-journal': technicalJournalEs,
    'network-subnetting': networkSubnettingEs,
    'home-server': homeServerEs,
    'employee-attrition': employeeAttritionEs,
    'ops-terminal': opsTerminalEs,
  },
};

export function getProjects(locale: Locale): Project[] {
  return projectMetas.map((meta) => ({
    ...meta,
    ...translations[locale][meta.slug],
  }));
}

export function getProjectBySlug(
  locale: Locale,
  slug: string,
): Project | undefined {
  return getProjects(locale).find((project) => project.slug === slug);
}
