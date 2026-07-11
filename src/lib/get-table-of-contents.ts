import { TableOfContentsItem } from '@/components/case-study/table-of-contents';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import GithubSlugger from 'github-slugger';
import { toString as mdastToString } from 'mdast-util-to-string';

type HeadingNode = {
  type: 'heading';
  depth: number;
  children: unknown[];
};

function isHeading(node: { type: string }): node is HeadingNode {
  return node.type === 'heading';
}

// Only h1 (numbered, top-level) and h2 (nested subitems) are shown —
// deeper levels are parsed but intentionally ignored, same call we made
// for the mock version: not every heading level adds navigation value.
export function getTableOfContents(source: string): TableOfContentsItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source) as {
    children: Array<{ type: string; depth?: number; children?: unknown[] }>;
  };

  const slugger = new GithubSlugger();
  const items: TableOfContentsItem[] = [];

  for (const node of tree.children) {
    if (!isHeading(node)) continue;

    const title = mdastToString(node);
    const id = slugger.slug(title);

    if (node.depth === 1) {
      items.push({ id, title });
    } else if (node.depth === 2 && items.length > 0) {
      const lastItem = items[items.length - 1];
      lastItem.subitems = [...(lastItem.subitems ?? []), { id, title }];
    }
  }

  return items;
}
