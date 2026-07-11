import Link from 'next/link';
import ThemeToggle from '@/components/shared/theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col gap-3 py-4 md:h-16 md:flex-row md:items-center md:justify-between md:py-0">
        <Link
          href={'/'}
          className="text-xl font-semibold tracking-tight transition-colors hover:text-primary"
        >
          Technical Journal
        </Link>

        <nav>
          <ul className="flex items-center gap-1 text-sm">
            <li>
              <Link
                href={'https://github.com/JonatanAtenogenes'}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Github
              </Link>
            </li>
            <li>
              <Link
                href={'https://jonatan-portfolio.onrender.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Portafolio
              </Link>
            </li>
            <li className="ml-1 border-l pl-2">
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
