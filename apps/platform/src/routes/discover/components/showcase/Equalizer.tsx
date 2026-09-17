import { classNames } from '@vibes/shared';

const bars = [
  { id: 'sub', height: 'h-2/5' },
  { id: 'bass', height: 'h-4/5' },
  { id: 'low', height: 'h-3/5' },
  { id: 'low-mid', height: 'h-full' },
  { id: 'mid', height: 'h-1/2' },
  { id: 'high-mid', height: 'h-4/5' },
  { id: 'presence', height: 'h-full' },
  { id: 'treble', height: 'h-3/5' },
  { id: 'air', height: 'h-2/5' },
];

interface EqualizerProps {
  className?: string;
}

export function Equalizer({ className }: EqualizerProps) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        'scene-equalizer flex items-end justify-center gap-1.5',
        className,
      )}
    >
      {bars.map(({ id, height }) => (
        <span
          key={id}
          className={classNames(
            'w-1.5 origin-bottom rounded-t-sm bg-secondary',
            height,
          )}
        />
      ))}
    </div>
  );
}
