import path from 'path';
import { promises as fs } from 'fs';
import type { Locale } from 'next-intl';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'projects');

export async function getProjectContent(
  locale: Locale,
  slug: string,
): Promise<string | null> {
  const filePath = path.join(CONTENT_DIR, slug, locale, 'index.mdx');

  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}
