import { SiteFooter as SharedSiteFooter } from '@vibes/ui/web';
import { NavLink } from 'react-router';

export function SiteFooter() {
  return (
    <SharedSiteFooter
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
