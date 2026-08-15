import { z } from 'zod';

// Mirrors the `projects` table shape (locale-independent fields).
export const projectMetaSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use lowercase kebab-case, e.g. my-project',
    ),
  status: z.enum(['draft', 'in-progress', 'published']),
  start_year: z.coerce.number().int().min(1990).max(2100).optional(),
  series_id: z.string().uuid().optional().or(z.literal('')),
  part_number: z.coerce.number().int().min(1).optional(),
  // Comma-separated in the UI, split into an array before validation.
  tags: z.array(z.string()).default([]),
  // icon is free text for now — matches the schema's deliberately
  // unconstrained `links[].icon` (known values: github, globe; a third
  // value is expected later but not finalized).
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
        icon: z.string().optional(),
      }),
    )
    .default([]),
});

// Mirrors `project_i18n`, one instance per locale.
export const projectI18nSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  part_tags: z.array(z.string()).default([]),
  mdx_content: z.string().default(''),
});

export const createProjectSchema = z.object({
  meta: projectMetaSchema,
  en: projectI18nSchema,
  es: projectI18nSchema,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
