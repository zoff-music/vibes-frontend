import { terminalButtonClassName } from '@vibes/ui/konami';
import { lazy, type ReactNode, Suspense } from 'react';
import { Link } from 'react-router';
import { useKonamiMode } from '../konami/KonamiModeContext';

const LazyTerminalShell = lazy(() =>
  import('@vibes/ui/konami').then((module) => ({
    default: module.TerminalShell,
  })),
);

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

interface LegalSubsectionProps {
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
  const terminalMode = useKonamiMode();

  if (terminalMode) {
    return (
      <Suspense fallback={null}>
        <LazyTerminalShell channel="SYSTEM MANUAL" title={title.toUpperCase()}>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#71f5ad]/30 bg-[#071b12] p-3">
              <Link className={terminalButtonClassName()} to="/">
                [ESC] DIRECTORY
              </Link>
              <span className="text-[#71f5ad]/55 text-[0.62rem] uppercase tracking-[0.14em]">
                REVISION {updatedAt}
              </span>
            </div>
            <article className="border border-[#71f5ad]/30 bg-[#020e09]/80 p-4 sm:p-6">
              <header className="border-[#71f5ad]/30 border-b pb-5">
                <p className="text-[#71f5ad]/60 text-[0.62rem] uppercase tracking-[0.18em]">
                  ZOFF SYSTEM DOCUMENT
                </p>
                <h1 className="mt-3 font-bold font-mono text-2xl text-[#e0ffef] uppercase sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-3xl text-[#b9ffda]/75 text-sm leading-6">
                  {description}
                </p>
              </header>
              <div className="mt-6 space-y-8">{children}</div>
            </article>
          </div>
        </LazyTerminalShell>
      </Suspense>
    );
  }

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
  const terminalMode = useKonamiMode();

  if (terminalMode) {
    return (
      <section className="border border-[#71f5ad]/20">
        <h2 className="border-[#71f5ad]/20 border-b bg-[#071b12] px-3 py-2 font-bold font-mono text-[#a6ffd0] text-sm uppercase tracking-[0.1em]">
          &gt; {title}
        </h2>
        <div className="space-y-4 p-3 text-[#b9ffda]/75 text-sm leading-6 sm:p-4">
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-pixel text-lg text-theme tracking-display">
        {title}
      </h2>
      <div className="space-y-4 text-theme-muted leading-7">{children}</div>
    </section>
  );
}

export function LegalSubsection({ children, title }: LegalSubsectionProps) {
  const terminalMode = useKonamiMode();

  if (terminalMode) {
    return (
      <section className="space-y-3 border-[#71f5ad]/15 border-l-2 pl-3">
        <h3 className="font-bold font-mono text-[#a6ffd0] text-xs uppercase tracking-[0.1em]">
          :: {title}
        </h3>
        <div className="space-y-4">{children}</div>
      </section>
    );
  }

  return (
    <section className="space-y-3 pt-2">
      <h3 className="font-pixel text-base text-theme tracking-display">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function LegalLink({ children, href }: LegalLinkProps) {
  const terminalMode = useKonamiMode();

  return (
    <a
      className={
        terminalMode
          ? 'text-[#a6ffd0] underline decoration-[#71f5ad]/40 underline-offset-4 hover:text-white'
          : 'text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-theme'
      }
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
