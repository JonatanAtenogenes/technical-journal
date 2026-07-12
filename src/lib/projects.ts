import { Locale } from 'next-intl';
import { Project, ProjectMeta, ProjectTranslation } from '@/lib/types/project';
/*
import { meta as homeServerMeta } from '@/content/projects/home-server/meta';
import { metadata as homeServerEn } from '@/content/projects/home-server/en/metadata';
import { metadata as homeServerEs } from '@/content/projects/home-server/es/metadata';
*/
/*
import { meta as employeeAttritionMeta } from '@/content/projects/employee-attrition/meta';
import { metadata as employeeAttritionEn } from '@/content/projects/employee-attrition/en/metadata';
import { metadata as employeeAttritionEs } from '@/content/projects/employee-attrition/es/metadata';
*/

import { meta as technicalJournalMeta } from '@/content/projects/technical-journal/meta';
import { metadata as technicalJournalEn } from '@/content/projects/technical-journal/en/metadata';
import { metadata as technicalJournalEs } from '@/content/projects/technical-journal/es/metadata';
/*
import { meta as networkSubnettingMeta } from '@/content/projects/network-subnetting/meta';
import { metadata as networkSubnettingEn } from '@/content/projects/network-subnetting/en/metadata';
import { metadata as networkSubnettingEs } from '@/content/projects/network-subnetting/es/metadata';
*/

// Structural data: one entry per project, locale-independent.
const projectMetas: ProjectMeta[] = [technicalJournalMeta];

// Translations: keyed by locale, then by slug.
const translations: Record<Locale, Record<string, ProjectTranslation>> = {
  en: {
    'technical-journal': technicalJournalEn,
  },
  es: {
    'technical-journal': technicalJournalEs,
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
