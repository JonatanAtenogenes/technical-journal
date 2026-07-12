export type ProjectStatus = 'completed' | 'in-progress' | 'paused' | 'archived';

export type ProjectLink = {
  label: string;
  url: string;
  icon?: 'github' | 'external-link' | 'globe';
}

export type ProjectMeta = {
  slug: string;
  cover: string;
  tags: string[];
  status: ProjectStatus;
  startYear: number;
  endYear?: number;
  links?: ProjectLink[];
};

export type ProjectTranslation = {
  title: string;
  category: string;
  description: string;
};

export type Project = ProjectMeta & ProjectTranslation;
