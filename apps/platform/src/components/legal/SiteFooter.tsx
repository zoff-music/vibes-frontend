import { classNames } from '@vibes/shared';
import { ExternalLinkIcon } from '@vibes/ui/web';
import { NavLink } from 'react-router';

export function SiteFooter() {
  return (
    <footer className="site-footer relative z-10 mx-auto w-full max-w-6xl shrink-0 px-5 pt-8 pb-4 sm:px-6 sm:pb-6">
      <nav
        aria-label="Site links"
        className="panel-surface grid w-full grid-cols-4 gap-1 rounded-3xl border border-theme p-1.5 backdrop-blur sm:grid-cols-5"
      >
        <a
          className={footerLinkClassName}
          href="https://github.com/zoff-music"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
          <ExternalLinkIcon className="h-3 w-3 shrink-0" />
        </a>
        <a
          className={classNames(footerLinkClassName, 'hidden sm:flex')}
          href="https://zoff.me/api/swagger/index.html"
        >
          API docs
        </a>
        <NavLink className={footerLinkClassName} to="/security">
          Security
        </NavLink>
        <NavLink className={footerLinkClassName} to="/privacy-policy">
          Privacy
        </NavLink>
        <NavLink className={footerLinkClassName} to="/terms-of-service">
          Terms
        </NavLink>
      </nav>
    </footer>
  );
}

const footerLinkClassName =
  'flex min-h-14 w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-2 py-4 font-pixel text-xs text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-[current=page]:bg-theme-surface aria-[current=page]:text-theme sm:text-sm';
