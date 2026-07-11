import { Project } from '@/lib/types/project';
import { metadata as homeServer } from '@/content/projects/home-server/metadata';
import { metadata as employeeAttrition } from '@/content/projects/employee-attrition/metadata';
import { metadata as technicalJournal } from '@/content/projects/technical-journal/metadata';
import { metadata as networkSubnetting } from '@/content/projects/network-subnetting/metadata';

// Each project registers itself here explicitly. When you add a new
// case study under content/projects/<slug>/metadata.ts, import it and
// add it to this array — that's the only wiring required.
const projects: Project[] = [
  homeServer,
  employeeAttrition,
  technicalJournal,
  networkSubnetting,
];

export function getProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
