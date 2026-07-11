export type ProjectStatus = 'completed' | 'in-progress' | 'paused' | 'archived';

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  cover: string;
  tags: string[];
  status: ProjectStatus;
  startYear: number;
  endYear?: number;
};
