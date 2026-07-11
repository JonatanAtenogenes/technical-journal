export type TableOfContentsItem = {
  id: string;
  title: string;
  subitems?: { id: string; title: string }[];
};

type TableOfContentsProps = {
  items: TableOfContentsItem[];
};

export default function TableOfContents({ items }: TableOfContentsProps) {
  return (
    <nav aria-label="Table of contents">
      <p className="mt-4 space-y-4">Contents</p>

      <ol className="mt-4 space-y-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex gap-3 text-sm leading-snug"
            >
              <span className="tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-foreground transition-colors group-hover:text-primary">
                {item.title}
              </span>
            </a>

            {item.subitems && item.subitems.length > 0 && (
              <ul className="mt-2 ml-8 space-y-2">
                {item.subitems.map((subItem) => (
                  <li key={subItem.id}>
                    <a
                      href={`#${subItem.id}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {subItem.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
