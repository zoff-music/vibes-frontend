import { classNames } from '@vibes/shared';
import { Link } from 'react-router';
import { useExperience } from '../../hooks/useExperience';

export function ExperienceSwitch() {
  const experience = useExperience();

  return (
    <nav
      aria-label="Choose your Zoff experience"
      className="inline-flex rounded-full border border-theme bg-theme-surface p-1 shadow-sm"
    >
      {experiences.map((item) => (
        <Link
          key={item.type}
          to={item.href}
          prefetch="intent"
          aria-current={experience === item.type ? 'page' : false}
          className={classNames(
            'relative flex min-h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 font-pixel text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
            experience === item.type
              ? 'border-secondary bg-theme text-theme'
              : 'border-transparent text-theme-muted hover:text-theme',
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
          {item.type === 'WATCH' && (
            <span className="pointer-events-none absolute -top-2 -right-1 rotate-12 rounded-md border border-primary/50 bg-theme-surface px-1.5 py-0.5 text-2xs text-pink-800 leading-none shadow-sm dark:text-primary">
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
