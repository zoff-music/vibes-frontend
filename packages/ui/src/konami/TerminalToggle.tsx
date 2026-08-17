import { classNames } from '@vibes/shared';
import { type ReactNode, useId } from 'react';

interface TerminalToggleProps {
  checked: boolean;
  className?: string;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  label: ReactNode;
  name?: string;
  onChange: (checked: boolean) => void;
}

export function TerminalToggle({
  checked,
  className,
  description,
  disabled = false,
  id,
  label,
  name,
  onChange,
}: TerminalToggleProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      className={classNames(
        'flex w-full items-center justify-between gap-3 border-[#71f5ad]/20 border-b px-1 py-2.5 font-mono text-[#b9ffda] text-xs uppercase hover:bg-[#071b12] has-focus-visible:ring-1 has-focus-visible:ring-[#71f5ad]',
        disabled ? 'cursor-not-allowed opacity-35' : 'cursor-pointer',
        className,
      )}
      htmlFor={inputId}
    >
      <span>
        <span className="block">{label}</span>
        {description && (
          <span className="mt-1 block text-[#a6ffd0]/45 text-[0.58rem]">
            {description}
          </span>
        )}
      </span>
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        id={inputId}
        {...(name && { name })}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={classNames(
          checked && 'text-[#71f5ad]',
          !checked && 'text-[#a6ffd0]/40',
        )}
      >
        [{checked ? 'ON ' : 'OFF'}]
      </span>
    </label>
  );
}
