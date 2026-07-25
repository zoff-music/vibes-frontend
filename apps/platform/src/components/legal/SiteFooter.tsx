import { ExternalLinkIcon } from '@vibes/ui';
import { Link } from 'react-router';

export function SiteFooter() {
  return (
    <footer className="relative z-30 flex shrink-0 justify-center px-4 pb-3">
      <nav
        aria-label="Site links"
        className="panel-surface flex items-center gap-1 rounded-full border border-theme p-1.5 shadow-lg backdrop-blur"
      >
        <a
          className="group flex items-center gap-1.5 rounded-full px-3 py-2 font-pixel text-2xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          href="https://github.com/zoff-music"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
          <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px" />
        </a>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-theme" />
        <Link
          className="rounded-full px-3 py-2 font-pixel text-2xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          to="/privacy-policy"
        >
          Privacy
        </Link>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-theme" />
        <Link
          className="rounded-full px-3 py-2 font-pixel text-2xs text-theme-subtle tracking-label transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          to="/terms-of-service"
        >
          Terms
        </Link>
      </nav>
    </footer>
  );
}
