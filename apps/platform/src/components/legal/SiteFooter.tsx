import { ExternalLinkIcon } from '@vibes/ui/web';
import { Link } from 'react-router';

export function SiteFooter() {
  return (
    <footer className="relative z-30 flex shrink-0 justify-center px-4 pb-3">
      <nav
        aria-label="Site links"
        className="panel-surface flex max-w-full items-center justify-center rounded-full border border-theme p-1 shadow-lg backdrop-blur"
      >
        <a
          className="group flex min-h-11 items-center gap-1 rounded-full px-2 py-2 font-pixel text-3xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:gap-1.5 sm:px-3 sm:text-2xs"
          href="https://github.com/zoff-music"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
          <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px" />
        </a>
        <Link
          className="flex min-h-11 items-center rounded-full px-2 py-2 font-pixel text-3xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-3 sm:text-2xs"
          to="/security"
        >
          Security
        </Link>
        <Link
          className="flex min-h-11 items-center rounded-full px-2 py-2 font-pixel text-3xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-3 sm:text-2xs"
          to="/privacy-policy"
        >
          Privacy
        </Link>
        <Link
          className="flex min-h-11 items-center rounded-full px-2 py-2 font-pixel text-3xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-3 sm:text-2xs"
          to="/terms-of-service"
        >
          Terms
        </Link>
      </nav>
    </footer>
  );
}
