import { NavLink } from 'react-router';

export function SiteFooter() {
  return (
    <footer className="site-footer relative z-10 mx-auto w-full max-w-6xl shrink-0 px-5 pt-8 pb-4 sm:px-6 sm:pb-6">
      <nav
        aria-label="Site links"
        className="flex w-full items-center justify-between gap-1 border-theme border-t pt-3 sm:justify-center sm:gap-6"
      >
        <a
          className={footerLinkClassName}
          href="https://github.com/zoff-music"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>
        <a
          className={footerLinkClassName}
          href="https://x.com/zoffmusic"
          rel="noreferrer"
          target="_blank"
        >
          X
        </a>
        <a
          className={footerLinkClassName}
          href="https://zoff.me/api/swagger/index.html"
        >
          API docs
        </a>
        <NavLink
          className={footerLinkClassName}
          to="/security"
          prefetch="intent"
        >
          Security
        </NavLink>
        <NavLink
          className={footerLinkClassName}
          to="/privacy-policy"
          prefetch="intent"
        >
          Privacy
        </NavLink>
        <NavLink
          className={footerLinkClassName}
          to="/terms-of-service"
          prefetch="intent"
        >
          Terms
        </NavLink>
      </nav>
    </footer>
  );
}

const footerLinkClassName =
  'flex min-h-11 min-w-6 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-1 font-pixel text-xs text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-[current=page]:text-theme sm:px-3 sm:text-sm';
