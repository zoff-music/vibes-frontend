import { classNames } from '@vibes/shared';
import { Link, useLocation } from 'react-router';
import { useExperience } from '../../hooks/useExperience';
import { canUseViewTransition } from '../../utils/viewTransition';

export function ExperienceSwitch() {
  const experience = useExperience();
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';
  const isLandingPage =
    path === '/' || path === '/features/music' || path === '/features/watch';

  return (
    <nav
      aria-label="Choose your Zoff experience"
      className="experience-selector relative inline-grid grid-cols-2 rounded-full border border-theme bg-theme-surface p-1 shadow-sm"
    >
      <span
        aria-hidden="true"
        className={classNames(
          'experience-pill pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full border border-secondary bg-theme transition-transform duration-500 ease-out motion-reduce:transition-none',
          experience === 'WATCH' && 'translate-x-full',
        )}
      />
      {experiences.map((item) => (
        <Link
          key={item.type}
          to={item.href}
          prefetch="intent"
          viewTransition={isLandingPage && canUseViewTransition()}
          aria-current={experience === item.type ? 'page' : false}
          className={classNames(
            'relative flex min-h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 font-pixel text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
            experience === item.type
              ? 'border-transparent text-theme'
              : 'border-transparent text-theme-muted hover:text-theme',
          )}
        >
          <span
            className={classNames(
              'relative flex items-center gap-2',
              item.type === 'WATCH'
                ? 'experience-watch-label'
                : 'experience-music-label',
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                'h-1.5 w-1.5 rounded-full transition-colors',
                experience === item.type ? 'bg-secondary' : 'bg-theme-muted/30',
              )}
            />
            {item.label}
          </span>
          {item.type === 'WATCH' && (
            <span className="experience-new pointer-events-none absolute -top-2 -right-1 z-10 rotate-12 rounded-md border border-primary/50 bg-theme-surface px-1.5 py-0.5 text-2xs text-pink-800 leading-none shadow-sm dark:text-primary">
              NEW
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

const experiences = [
  { type: 'MUSIC', label: 'Music', href: '/features/music' },
  { type: 'WATCH', label: 'Watch', href: '/features/watch' },
];
