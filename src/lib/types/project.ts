export type ProjectStatus = 'completed' | 'in-progress' | 'paused' | 'archived';

export type ProjectMeta = {
  slug: string;
  cover: string;
  tags: string[];
  status: ProjectStatus;
  startYear: number;
  endYear?: number;
};

export type ProjectTranslation = {
  title: string;
  category: string;
  description: string;
};

export type Project = ProjectMeta & ProjectTranslation;
