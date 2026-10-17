import type { ReactNode } from 'preact/compat';

interface SitePageProps {
  children: ReactNode;
}

export function SitePage({ children }: SitePageProps) {
  return (
    <main className="product-content relative z-10 mx-auto w-full max-w-6xl px-5 pb-4 text-theme sm:px-6">
      {children}
    </main>
  );
}
