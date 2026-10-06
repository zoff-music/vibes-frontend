import { classNames } from '@vibes/shared';
import { useId } from 'react';

interface RetroSunProps {
  paused: boolean;
  watch?: boolean;
  animate?: boolean;
}

interface OrbitArtworkProps {
  watch: boolean;
  className: string;
}

const sunBands = [
  { top: 48, height: 6, delay: 'motion-safe:[animation-delay:-3s]' },
  { top: 56, height: 6, delay: 'motion-safe:[animation-delay:-2.4s]' },
  { top: 65, height: 6, delay: 'motion-safe:[animation-delay:-1.8s]' },
  { top: 75, height: 5, delay: 'motion-safe:[animation-delay:-1.2s]' },
  { top: 85, height: 5, delay: 'motion-safe:[animation-delay:-0.6s]' },
  { top: 95, height: 5, delay: 'motion-safe:[animation-delay:0s]' },
];

export function RetroSun({
  paused,
  watch = false,
  animate = false,
}: RetroSunProps) {
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
      {animate && (
        <OrbitArtwork watch={!watch} className="experience-orbit-outgoing" />
      )}
      <OrbitArtwork
        watch={watch}
        className={animate ? 'experience-orbit-incoming' : ''}
      />
    </div>
  );
}

function OrbitArtwork({ watch, className }: OrbitArtworkProps) {
  const id = useId();
  const gradientId = `${id}-sun-gradient`;
  const maskId = `${id}-sun-bands`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      className={classNames(
        'retro-orbit-art absolute inset-0 h-full w-full opacity-85',
        className,
      )}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={watch ? '#c4c8ff' : '#ffe8a3'}
            className={classNames(
              watch && '[stop-color:#7964b5] dark:[stop-color:#c4c8ff]',
            )}
          />
          <stop
            offset="24%"
            stopColor={watch ? '#78d4f5' : '#ffb574'}
            className={classNames(
              watch && '[stop-color:#3486b2] dark:[stop-color:#78d4f5]',
            )}
          />
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
      {watch && (
        <circle
          cx="46"
          cy="45"
          r="42"
          className="fill-[#e8dcf4] dark:fill-[#171125]"
        />
      )}
      {watch && (
        <ellipse
          cx="50"
          cy="50"
          rx="49"
          ry="18"
          fill="none"
          className="stroke-[#7653a5] dark:stroke-[#c4b5fd]"
          strokeWidth="0.35"
          transform="rotate(-32 50 50)"
          opacity=".6"
        />
      )}
    </svg>
  );
}
