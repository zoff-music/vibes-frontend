import { NavLink } from '@kasperrt/smolter/preact';
import { SiteFooter as SharedSiteFooter, siteFooterLinks } from '@vibes/ui/web';

const links = [
  ...siteFooterLinks.slice(0, 3),
  { href: '/faq', label: 'FAQ' },
  ...siteFooterLinks.slice(3),
];

export function SiteFooter() {
  return (
    <SharedSiteFooter
      links={links}
      renderLocalLink={(link, className) => {
        if (link.href.startsWith('/api/'))
          return (
            <a href={link.href} className={className}>
              {link.label}
            </a>
          );

        return (
          <NavLink to={link.href} prefetch="intent" className={className}>
            {link.label}
          </NavLink>
        );
      }}
    />
  );
}
