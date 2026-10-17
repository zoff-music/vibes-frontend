import { NavLink, useNavigate } from '@kasperrt/smolter/preact';
import { classNames } from '@vibes/shared';
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from 'preact/compat';
import { SiteHero } from '../layout/SiteHero';
import { SitePage } from '../layout/SitePage';

interface LegalDocumentProps {
  children: ReactNode;
  description: string;
  title: string;
  updatedAt: string;
}

interface LegalSectionProps {
  children: ReactNode;
  title: string;
  number?: number;
  id?: string;
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
  const navigate = useNavigate();

  const sections = Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== LegalSection) {
      return [];
    }

    return [child as import('preact').VNode<LegalSectionProps>];
  });
  const content = sections.map((section, index) =>
    cloneElement(section, {
      number: index + 1,
    }),
  );

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
              {sections.map((section, index) => (
                <li key={section.props.title}>
                  <a
                    href={`#${section.props.id ?? sectionId(section.props.title)}`}
                    onClick={(event) => {
                      if (
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      ) {
                        return;
                      }

                      const id =
                        section.props.id ?? sectionId(section.props.title);
                      const target = document.getElementById(id);

                      if (!target) return;

                      event.preventDefault();
                      navigate(
                        {
                          hash: `#${id}`,
                        },
                        {
                          preventScrollReset: true,
                        },
                      );
                      target.scrollIntoView({
                        behavior: 'instant',
                        block: 'start',
                      });
                      target.focus({
                        preventScroll: true,
                      });
                    }}
                    className="block rounded-xl px-3 py-3 text-sm text-theme-muted leading-relaxed transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    {index + 1}. {section.props.title}
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
          {content}
        </article>
      </div>
    </SitePage>
  );
}

export function LegalSection({
  children,
  title,
  number,
  id,
}: LegalSectionProps) {
  const heading = number ? `${number}. ${title}` : title;

  return (
    <section
      id={id ?? sectionId(title)}
      tabIndex={-1}
      className="scroll-mt-8 space-y-4 border-theme border-b pb-8 last:border-b-0 last:pb-0 focus:outline-none"
    >
      <h2 className="font-pixel text-theme text-xl normal-case tracking-normal">
        {heading}
      </h2>
      <div className="space-y-4 text-theme-muted leading-7">{children}</div>
    </section>
  );
}

export function LegalSubsection({ children, title }: LegalSubsectionProps) {
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
  {
    path: '/security',
    label: 'Security',
  },
  {
    path: '/privacy-policy',
    label: 'Privacy',
  },
  {
    path: '/terms-of-service',
    label: 'Terms',
  },
];

function sectionId(title: string) {
  return `policy-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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
