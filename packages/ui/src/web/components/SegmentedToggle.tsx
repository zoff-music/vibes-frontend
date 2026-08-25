import { classNames } from '@vibes/shared';
import React from 'react';

interface SegmentedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  variant?: 'card' | 'plain-full' | 'inline';
  id?: string;
  name?: string;
}

export function SegmentedToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  variant = 'card',
  id,
  name,
}: SegmentedToggleProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    onChange(event.target.checked);
  };

  const control = (
    <div className="relative inline-flex shrink-0 items-center">
      <input
        id={inputId}
        {...(name && { name })}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="peer sr-only"
      />
      <span className="grid h-9 w-28 grid-cols-2 rounded-xl border border-theme bg-black/5 p-1 font-pixel text-2xs tracking-label transition-colors peer-focus-visible:outline-hidden peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-theme dark:bg-white/5">
        <span
          className={classNames(
            'flex items-center justify-center rounded-lg transition-all',
            !checked
              ? 'bg-ink text-text-inverse shadow-soft'
              : 'text-theme-muted',
          )}
        >
          OFF
        </span>
        <span
          className={classNames(
            'flex items-center justify-center rounded-lg transition-all',
            checked
              ? 'bg-secondary text-ink shadow-neon-cyan'
              : 'text-theme-muted',
          )}
        >
          ON
        </span>
      </span>
    </div>
  );

  if (label || description) {
    const labelClass =
      variant === 'plain-full'
        ? 'group flex w-full items-center justify-between border-0 bg-transparent p-0 transition-all'
        : 'group flex items-center justify-between rounded-2xl border border-theme bg-theme-surface p-5 transition-all';

    return (
      <label
        htmlFor={inputId}
        className={classNames(
          labelClass,
          !disabled
            ? 'cursor-pointer hover:border-theme-strong'
            : 'cursor-not-allowed opacity-60',
        )}
      >
        <div className="mr-4 flex-1">
          {label && (
            <div className="font-pixel text-theme text-xs tracking-display">
              {label}
            </div>
          )}
          {description && (
            <div className="mt-1 text-theme-muted text-xs">{description}</div>
          )}
        </div>
        {control}
      </label>
    );
  }

  return (
    <label
      htmlFor={inputId}
      className={classNames(
        'relative inline-flex items-center',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        variant === 'plain-full' && 'w-full',
      )}
    >
      {control}
    </label>
  );
}
