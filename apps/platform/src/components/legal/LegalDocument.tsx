import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface LegalDocumentProps {
  children: ReactNode;
  description: string;
  title: string;
  updatedAt: string;
}

interface LegalSectionProps {
  children: ReactNode;
  title: string;
}

interface LegalLinkProps {
  children: ReactNode;
  href: string;
}

export function LegalDocument({
  children,
  description,
  title,
  updatedAt,
}: LegalDocumentProps) {
  return (
    <main className="relative z-10 min-h-screen px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <Link
          className="font-pixel text-theme-muted text-xs tracking-label transition-colors hover:text-theme"
          to="/"
        >
          ← Back to Zoff
        </Link>

        <article className="crt-frame mt-8 rounded-frame p-6 sm:p-10">
          <header className="border-theme border-b pb-8">
            <p className="font-pixel text-secondary text-xs tracking-label">
              ZOFF LEGAL
            </p>
            <h1 className="mt-4 font-pixel text-3xl text-theme sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-theme-muted leading-7">
              {description}
            </p>
            <p className="mt-4 text-theme-subtle text-xs">
              Last updated: {updatedAt}
            </p>
          </header>

          <div className="mt-8 space-y-10">{children}</div>
        </article>
      </div>
    </main>
  );
}

export function LegalSection({ children, title }: LegalSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-pixel text-lg text-theme tracking-display">
        {title}
      </h2>
      <div className="space-y-4 text-theme-muted leading-7">{children}</div>
    </section>
  );
}

export function LegalLink({ children, href }: LegalLinkProps) {
  return (
    <a
      className="text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-theme"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
