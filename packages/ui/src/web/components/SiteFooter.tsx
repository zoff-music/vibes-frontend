import { Fragment, type ReactNode } from 'react';

export interface SiteFooterLink {
  href: string;
  label: string;
  external?: boolean;
}

interface SiteFooterProps {
  renderLocalLink?: (link: SiteFooterLink, className: string) => ReactNode;
}

export function SiteFooter({ renderLocalLink }: SiteFooterProps) {
  return (
    <footer className="site-footer relative z-10 mx-auto w-full max-w-6xl shrink-0 px-5 pt-8 pb-4 sm:px-6 sm:pb-6">
      <nav
        aria-label="Site links"
        className="panel-surface mx-auto flex w-fit max-w-full items-center rounded-2xl border border-theme p-1 sm:px-2"
      >
        {links.map((link, index) => (
          <Fragment key={link.href}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className="h-4 shrink-0 border-theme border-l"
              />
            )}
            {renderLocalLink &&
              link.href.startsWith('/') &&
              renderLocalLink(link, footerLinkClassName)}
            {(!renderLocalLink || !link.href.startsWith('/')) && (
              <a
                className={footerLinkClassName}
                href={link.href}
                {...(link.external
                  ? { rel: 'noreferrer', target: '_blank' }
                  : {})}
              >
                {link.label}
              </a>
            )}
          </Fragment>
        ))}
      </nav>
    </footer>
  );
}

const links: SiteFooterLink[] = [
  { href: 'https://github.com/zoff-music', label: 'GitHub', external: true },
  { href: 'https://x.com/zoffmusic', label: 'X', external: true },
  { href: '/api/swagger/index.html', label: 'API docs' },
  { href: '/security', label: 'Security' },
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/terms-of-service', label: 'Terms' },
];

const footerLinkClassName =
  'flex min-h-11 min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-1 font-pixel text-xs text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-[current=page]:text-theme sm:px-5 sm:text-sm';
