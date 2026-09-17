import { classNames } from '@vibes/shared';
import {
  terminalButtonClassName,
  useTerminalShortcuts,
} from '@vibes/ui/konami';
import {
  Children,
  isValidElement,
  lazy,
  type ReactNode,
  Suspense,
} from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useKonamiMode } from '../konami/KonamiModeContext';
import { SiteHero } from '../layout/SiteHero';
import { SitePage } from '../layout/SitePage';

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
  const navigate = useNavigate();

  useTerminalShortcuts([{ key: 'Escape', onTrigger: () => navigate('/') }], {
    enabled: terminalMode,
  });

  if (terminalMode) {
    return (
      <Suspense fallback={null}>
        <LazyTerminalShell channel="SYSTEM MANUAL" title={title.toUpperCase()}>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#71f5ad]/30 bg-[#071b12] p-3">
              <Link
                aria-keyshortcuts="Escape"
                className={terminalButtonClassName()}
                to="/"
              >
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

  const sections = Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<LegalSectionProps>(child) ||
      child.type !== LegalSection
    ) {
      return [];
    }
    return [child.props.title];
  });

  return (
    <SitePage>
      <SiteHero
        id="policy-heading"
        eyebrow="POLICIES"
        title={title}
        description={description}
        footer={
          <>
            <nav
              aria-label="Zoff policies"
              className="grid w-full grid-cols-3 gap-2 sm:w-auto"
            >
              {policyLinks.map((policy) => (
                <NavLink
                  key={policy.path}
                  to={policy.path}
                  className={({ isActive }) =>
                    classNames(
                      'flex min-h-12 items-center justify-center rounded-xl border px-3 py-3 font-pixel text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-5',
                      isActive
                        ? 'border-secondary/50 bg-secondary/10 text-theme'
                        : 'border-theme bg-theme-surface text-theme-muted hover:border-secondary/50 hover:text-theme',
                    )
                  }
                >
                  {policy.label}
                </NavLink>
              ))}
            </nav>
            <p className="text-theme-subtle text-xs">
              Last updated: {updatedAt}
            </p>
          </>
        }
      />
      <div className="grid items-start gap-6 pt-10 sm:pt-16 lg:grid-cols-4 lg:gap-10">
        <aside className="hidden lg:sticky lg:top-6 lg:block">
          <nav aria-label="On this page" className="mt-8 hidden lg:block">
            <p className="mb-3 px-3 font-pixel text-theme-subtle text-xs">
              On this page
            </p>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section}>
                  <a
                    href={`#${sectionId(section)}`}
                    className="block rounded-xl px-3 py-3 text-sm text-theme-muted leading-relaxed transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    {section}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article
          aria-label={title}
          className="panel-surface min-w-0 space-y-8 rounded-frame border border-theme p-6 sm:p-8 lg:col-span-3 lg:p-10"
        >
          {children}
        </article>
      </div>
    </SitePage>
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
    <section
      id={sectionId(title)}
      className="scroll-mt-8 space-y-4 border-theme border-b pb-8 last:border-b-0 last:pb-0"
    >
      <h2 className="font-pixel text-theme text-xl normal-case tracking-normal">
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
      <h3 className="font-pixel text-lg text-theme normal-case tracking-normal">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const policyLinks = [
  { path: '/security', label: 'Security' },
  { path: '/privacy-policy', label: 'Privacy' },
  { path: '/terms-of-service', label: 'Terms' },
];

function sectionId(title: string) {
  return `policy-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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
