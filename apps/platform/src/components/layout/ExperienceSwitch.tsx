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
          preventScrollReset
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
        </Link>
      ))}
    </nav>
  );
}

const experiences = [
  { type: 'MUSIC', label: 'Music', href: '/' },
  { type: 'WATCH', label: 'Watch', href: '/?type=watch' },
];
