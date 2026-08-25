import { classNames } from '@vibes/shared';
import {
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
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
  wheelStep?: number;
}

export function TerminalSlider({
  className,
  end,
  max = 100,
  min = 0,
  onValueChange,
  start,
  value,
  wheelStep,
  ...props
}: TerminalSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    onValueChange(Number(event.currentTarget.value));
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !wheelStep || props.disabled) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;

      event.preventDefault();
      const adjustment = event.deltaY < 0 ? wheelStep : -wheelStep;
      const nextValue = Math.min(
        Number(max),
        Math.max(Number(min), value + adjustment),
      );
      onValueChange(nextValue);
    };

    input.addEventListener('wheel', handleWheel, { passive: false });
    return () => input.removeEventListener('wheel', handleWheel);
  }, [max, min, onValueChange, props.disabled, value, wheelStep]);

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
          ref={inputRef}
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
