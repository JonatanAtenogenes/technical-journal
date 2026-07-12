import { useTranslations } from 'next-intl';

export type TableOfContentsSubItem = {
  id: string;
  title: string;
  subitems?: { id: string; title: string }[];
};

export type TableOfContentsItem = {
  id: string;
  title: string;
  subitems?: TableOfContentsSubItem[];
};

type TableOfContentsProps = {
  items: TableOfContentsItem[];
};

export default function TableOfContents({ items }: TableOfContentsProps) {
  const t = useTranslations('tableOfContents');

  return (
    <nav aria-label={t('ariaLabel')}>
      <p className="mt-4 space-y-4">{t('title')}</p>

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

                    {subItem.subitems && subItem.subitems.length > 0 && (
                      <ul className={'mt-1.5 ml-4 space-y-1.5 border-l pl-3'}>
                        {subItem.subitems.map((subSubItem) => (
                          <li key={subSubItem.id}>
                            <a
                              href={`#${subSubItem.id}`}
                              className={
                                'text-xs text-muted-foreground/70 transition-colors hover:text-foreground'
                              }
                            >
                              {subSubItem.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
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
