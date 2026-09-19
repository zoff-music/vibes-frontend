import { classNames } from '@vibes/shared';
import { useId } from 'react';

interface RetroSunProps {
  paused: boolean;
}

const sunBands = [
  { top: 48, height: 6, delay: 'motion-safe:[animation-delay:-3s]' },
  { top: 56, height: 6, delay: 'motion-safe:[animation-delay:-2.4s]' },
  { top: 65, height: 6, delay: 'motion-safe:[animation-delay:-1.8s]' },
  { top: 75, height: 5, delay: 'motion-safe:[animation-delay:-1.2s]' },
  { top: 85, height: 5, delay: 'motion-safe:[animation-delay:-0.6s]' },
  { top: 95, height: 5, delay: 'motion-safe:[animation-delay:0s]' },
];

export function RetroSun({ paused }: RetroSunProps) {
  const id = useId();
  const gradientId = `${id}-sun-gradient`;
  const maskId = `${id}-sun-bands`;

  return (
    <div
      aria-hidden="true"
      data-paused={paused}
      className="group/sun relative aspect-square w-full"
    >
      <div
        className={classNames(
          'absolute -inset-1/2 rounded-full',
          'bg-[radial-gradient(circle,rgba(255,94,156,0.28)_0%,rgba(230,58,160,0.16)_30%,rgba(159,66,196,0.07)_50%,transparent_70%)]',
          'motion-safe:animate-sunset-glow group-data-[paused=true]/sun:[animation-play-state:paused]',
        )}
      />
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full opacity-85"
      >
        <defs>
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
        <circle
          cx="50"
          cy="50"
          r="50"
          fill={`url(#${gradientId})`}
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}
