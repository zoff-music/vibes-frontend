import { classNames } from '@vibes/shared';
import { useId } from 'react';

interface RetroSunProps {
  paused: boolean;
  watch?: boolean;
}

const sunBands = [
  { top: 48, height: 6, delay: 'motion-safe:[animation-delay:-3s]' },
  { top: 56, height: 6, delay: 'motion-safe:[animation-delay:-2.4s]' },
  { top: 65, height: 6, delay: 'motion-safe:[animation-delay:-1.8s]' },
  { top: 75, height: 5, delay: 'motion-safe:[animation-delay:-1.2s]' },
  { top: 85, height: 5, delay: 'motion-safe:[animation-delay:-0.6s]' },
  { top: 95, height: 5, delay: 'motion-safe:[animation-delay:0s]' },
];

export function RetroSun({ paused, watch = false }: RetroSunProps) {
  const id = useId();
  const gradientId = `${id}-sun-gradient`;
  const maskId = `${id}-sun-bands`;
  const moonGradientId = `${id}-moon-gradient`;
  const discId = `${id}-disc`;

  return (
    <div
      aria-hidden="true"
      data-paused={paused}
      className="group/sun relative aspect-square w-full"
    >
      <div
        className={classNames(
          'absolute -inset-1/2 rounded-full',
          watch
            ? 'bg-[radial-gradient(circle,rgba(108,155,235,0.24)_0%,rgba(125,92,205,0.15)_30%,rgba(159,66,196,0.06)_50%,transparent_70%)]'
            : 'bg-[radial-gradient(circle,rgba(255,94,156,0.28)_0%,rgba(230,58,160,0.16)_30%,rgba(159,66,196,0.07)_50%,transparent_70%)]',
          'motion-safe:animate-sunset-glow group-data-[paused=true]/sun:[animation-play-state:paused]',
        )}
      />
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <clipPath id={discId}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
          <radialGradient id={moonGradientId} cx="32%" cy="22%" r="78%">
            <stop
              offset="0%"
              className="[stop-color:#edf2ff] dark:[stop-color:#e0edff]"
            />
            <stop
              offset="55%"
              className="[stop-color:#b5b8ed] dark:[stop-color:#919dde]"
            />
            <stop
              offset="85%"
              className="[stop-color:#777bbb] dark:[stop-color:#585193]"
            />
            <stop
              offset="100%"
              className="[stop-color:#524d86] dark:[stop-color:#363354]"
            />
          </radialGradient>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe8a3" />
            <stop offset="24%" stopColor="#ffb574" />
            <stop offset="48%" stopColor="#ff6b9b" />
            <stop offset="70%" stopColor="#f336a4" />
            <stop offset="100%" stopColor="#ac42d5" />
          </linearGradient>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100"
            height="100"
          >
            <rect width="100" height="47" className="fill-white" />
            {sunBands.map((band) => (
              <rect
                key={band.top}
                y={band.top}
                width="100"
                height={band.height}
                className={classNames(
                  'origin-center fill-white [transform-box:fill-box]',
                  'motion-safe:animate-sun-ripple',
                  'group-data-[paused=true]/sun:[animation-play-state:paused]',
                  band.delay,
                )}
              />
            ))}
          </mask>
        </defs>
        <g mask={`url(#${maskId})`} clipPath={`url(#${discId})`}>
          <circle
            cx="50"
            cy="50"
            r="50"
            fill={`url(#${watch ? moonGradientId : gradientId})`}
            className={classNames(!watch && 'opacity-85')}
          />
          {watch && (
            <>
              <g
                className="fill-indigo-900/10 stroke-white/30 dark:fill-indigo-950/15 dark:stroke-white/20"
                strokeWidth="0.5"
              >
                <circle cx="30" cy="18" r="6" />
                <circle cx="65" cy="27" r="9" />
                <circle cx="43" cy="36" r="3" />
                <circle cx="22" cy="40" r="2" />
              </g>
              <circle
                cx="50"
                cy="50"
                r="49.6"
                fill="none"
                className="stroke-indigo-700/25 dark:stroke-indigo-100/35"
                strokeWidth="0.6"
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
