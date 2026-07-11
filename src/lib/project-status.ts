import { ProjectStatus } from './types/project';

export const projectStatusLabels: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  paused: 'Paused',
  archived: 'Archived',
};

export function formatProjectYears(
  startYear: number,
  endYear?: number,
): string {
  if (!endYear || endYear === startYear) {
    return `${startYear}`;
  }
  return `${startYear}-${endYear}`;
}
