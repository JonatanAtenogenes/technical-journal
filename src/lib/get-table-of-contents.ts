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

// h1 (top-level, numbered), h2 (nested under the current h1), and h3
// (nested under the current h2) are all shown, each at its own level —
// deeper levels are parsed but intentionally ignored.
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
    } else if (node.depth === 3 && items.length > 0) {
      const lastItem = items[items.length - 1];
      const subitems = lastItem.subitems ?? [];
      const lastSubitems = subitems[subitems.length - 1];

      // An h3 only makes sense nested under the most recent h2 within
      // the current h1 — if there's no h2 yet, it's dropped rather
      // than silently attached to the wrong parent.
      if (lastSubitems) {
        lastSubitems.subitems = [
          ...(lastSubitems.subitems ?? []),
          { id, title },
        ];
      }
    }
  }

  return items;
}
