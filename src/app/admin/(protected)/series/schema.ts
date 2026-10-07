import z from 'zod';

export const seriesMetaSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use lowercase kebab-case, e.g. home-server',
    ),
  tags: z.array(z.string()).default([]),
});

export const seriesI18nSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

export const createSeriesSchema = z.object({
  meta: seriesMetaSchema,
  en: seriesI18nSchema,
  es: seriesI18nSchema,
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
