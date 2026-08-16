import type { HTMLAttributes, ReactNode } from 'react';

interface TerminalProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  decorative?: boolean;
  end?: ReactNode;
  max: number;
  min?: number;
  showHandle?: boolean;
  start?: ReactNode;
  value: number;
}

export function TerminalProgress({
  className,
  decorative = false,
  end,
  max,
  min = 0,
  showHandle = false,
  start,
  value,
  ...props
}: TerminalProgressProps) {
  const range = max - min;
  const progress = range > 0 ? ((value - min) / range) * 100 : 0;
  const boundedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      {...(decorative
        ? { 'aria-hidden': true }
        : {
            'aria-valuemax': max,
            'aria-valuemin': min,
            'aria-valuenow': Math.round(value),
            role: 'progressbar',
          })}
      className={className}
      {...props}
    >
      {(start || end) && (
        <div className="mb-1 flex justify-between font-mono text-[#a6ffd0]/65 text-[0.6rem] tabular-nums">
          <span>{start}</span>
          <span>{end}</span>
        </div>
      )}
      <div className="relative h-3 border border-[#71f5ad]/45 bg-black p-0.5 peer-focus-visible:ring-1 peer-focus-visible:ring-[#a6ffd0] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#020e09] peer-disabled:opacity-35">
        <div
          className="h-full bg-[repeating-linear-gradient(90deg,#71f5ad_0_9px,transparent_9px_12px)]"
          style={{ width: `${boundedProgress}%` }}
        />
        {showHandle && (
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 border-2 border-[#020e09] bg-[#a6ffd0] shadow-[0_0_0.75rem_rgba(113,245,173,0.65)] outline outline-[#71f5ad]/75"
            style={{
              left: `calc(${boundedProgress}% + ${10 - boundedProgress * 0.2}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
