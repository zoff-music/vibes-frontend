import { classNames } from '@vibes/shared';
import React from 'react';

interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'className' | 'style'
  > {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<Props> = ({
  label,
  error,
  id,
  containerClassName = '',
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={classNames('mb-4 w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 ml-1 block font-medium text-sm text-theme-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...(error && {
          'aria-describedby': errorId,
          'aria-invalid': true,
        })}
        className={classNames(
          'w-full rounded-lg border bg-theme-surface px-4 py-3 text-base text-theme placeholder:text-theme-subtle focus:outline-hidden focus:ring-2 focus:ring-primary',
          error ? 'border-error' : 'border-theme',
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 ml-1 text-error text-xs">
          {error}
        </p>
      )}
    </div>
  );
};
export const GlassInput = Input;
