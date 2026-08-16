import { classNames } from '@vibes/shared';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { TerminalProgress } from './TerminalProgress';

interface TerminalSliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'onChange' | 'onInput' | 'style' | 'type' | 'value'
  > {
  className?: string;
  end?: ReactNode;
  onValueChange: (value: number) => void;
  start?: ReactNode;
  value: number;
}

export function TerminalSlider({
  className,
  end,
  max = 100,
  min = 0,
  onValueChange,
  start,
  value,
  ...props
}: TerminalSliderProps) {
  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    onValueChange(Number(event.currentTarget.value));
  };

  return (
    <div
      className={classNames(
        'grid items-center gap-3 sm:grid-cols-[auto_1fr_auto]',
        className,
      )}
    >
      {start && <div>{start}</div>}
      <div className="relative">
        <input
          className="peer absolute inset-x-0 -inset-y-2 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          max={max}
          min={min}
          onInput={handleInput}
          type="range"
          value={value}
          {...props}
        />
        <TerminalProgress
          className="pointer-events-none"
          decorative
          max={Number(max)}
          min={Number(min)}
          showHandle
          value={value}
        />
      </div>
      {end && <div>{end}</div>}
    </div>
  );
}
