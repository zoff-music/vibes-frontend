import type { ReactNode } from 'react';
import { SkipLink } from './SkipLink';

interface SiteLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer: ReactNode;
}

export function SiteLayout({ children, header, footer }: SiteLayoutProps) {
  return (
    <div className="site-layout relative flex min-h-dvh flex-col">
      <SkipLink href="#page-content" />
      {header}
      <div
        id="page-content"
        tabIndex={-1}
        className="min-w-0 flex-1 focus:outline-none"
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
