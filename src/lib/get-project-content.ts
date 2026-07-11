import path from 'path';
import { promises as fs } from 'fs';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'projects');

export async function getProjectContent(slug: string): Promise<string | null> {
  const filePath = path.join(CONTENT_DIR, slug, 'index.mdx');

  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}
