'use server';

import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import type { ReactNode } from 'react';

type PreviewResult =
  | { content: ReactNode; error?: undefined }
  | { content?: undefined; error: string };

// Reuses the same remark/rehype pipeline as the public site's MDX
// rendering (see Database Schema doc: next-mdx-remote/rsc, remark-gfm,
// rehype-slug). rehype-expressive-code is intentionally left out here —
// it needs its theme CSS loaded on the page to render correctly, which
// the admin panel doesn't load. Code blocks preview as plain <pre><code>
// instead of the site's syntax-highlighted version. Everything else
// (headings, lists, tables, links, blockquotes) renders exactly as it
// will on the public site.
//
// Returns the compiled JSX directly instead of a rendered HTML string:
// Next.js doesn't allow react-dom/server in a module reachable from a
// Client Component (see the "importing a component that imports
// react-dom/server" build error), and Server Actions can return React
// elements natively over the RSC protocol, so there's no need for it.
export async function renderMdxPreview(
  mdxContent: string,
): Promise<PreviewResult> {
  if (!mdxContent.trim()) {
    return { content: null };
  }

  try {
    const { content } = await compileMDX({
      source: mdxContent,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      },
    });

    return { content };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : 'Failed to render MDX preview.',
    };
  }
}
