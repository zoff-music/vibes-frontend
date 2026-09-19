import { classNames } from '@vibes/shared';
import { type ChangeEvent, useId } from 'react';

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  name?: string;
  value: string;
  options: readonly SegmentedControlOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SegmentedControl({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
}: SegmentedControlProps) {
  const id = useId();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="sr-only">{label}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl border border-theme bg-theme-surface p-1">
        {options.map((option) => (
          <label key={option.value} className="relative min-w-0">
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              className="peer sr-only"
            />
            <span
              className={classNames(
                'flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-center text-sm transition-colors',
                'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-theme',
                'peer-disabled:cursor-wait peer-disabled:opacity-60',
                value === option.value
                  ? 'bg-secondary text-on-secondary shadow-secondary-soft'
                  : 'text-theme-muted hover:bg-theme-hover hover:text-theme',
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
