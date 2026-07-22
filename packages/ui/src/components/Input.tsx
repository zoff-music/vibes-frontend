import React from 'react';

interface Props
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'className' | 'style'
  > {
  label?: string;
  error?: string;
}

export const Input: React.FC<Props> = ({ label, error, id, ...props }) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 ml-1 block font-medium text-sm text-text-muted"
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
        className={`w-full rounded-lg border bg-surface px-4 py-3 text-base text-text placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-primary ${
          error ? 'border-error' : 'border-surfaceElevated'
        }`}
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
