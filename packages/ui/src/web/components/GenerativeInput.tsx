import { classNames } from '@vibes/shared';
import { type RefObject, useId } from 'preact/compat';
import { useGenerativeDiscovery } from '../hooks/useGenerativeDiscovery';
import { SparklesIcon } from '../icons';
import { Button } from './Button';

interface GenerativeInputProps {
  active: boolean;
  enabled: boolean;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
  onToggle: () => void;
  onSubmit: () => void;
}

export function GenerativeInput({
  active,
  enabled,
  disabled,
  inputRef,
  value,
  placeholder,
  maxLength,
  onChange,
  onToggle,
  onSubmit,
}: GenerativeInputProps) {
  const id = useId();
  const discovery = useGenerativeDiscovery(active, enabled);
  const hintId = `${id}-hint`;
  const animationState =
    active && discovery.animate
      ? '[animation-play-state:running]'
      : '[animation-play-state:paused]';
  const orbitClass = classNames(
    'fill-none stroke-3 [stroke-dasharray:15_85] [stroke-linecap:round] [vector-effect:non-scaling-stroke] motion-safe:animate-generative-orbit',
    animationState,
  );
  const particleClass = classNames(
    'absolute -bottom-4 size-4 opacity-0 motion-safe:animate-generative-particle',
    animationState,
  );

  return (
    <div className="min-w-0">
      <div className="mb-2 flex h-5 items-center justify-between gap-3">
        <label htmlFor={id} className="font-pixel text-sm text-theme-muted">
          {active ? 'AI playlist prompt' : 'Room name'}
        </label>
        {active && (
          <span className="text-theme-subtle text-xs tabular-nums">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <div
        className={classNames(
          'generative-field relative isolate flex h-14 min-w-0 items-center rounded-2xl border bg-theme-surface transition-[box-shadow,border-color] duration-500 focus-within:ring-2 focus-within:ring-secondary/30 motion-reduce:transition-none',
          active ? 'border-primary shadow-generative-field' : 'border-theme',
        )}
        data-powered={active}
        data-animate={discovery.animate}
      >
        <span
          aria-hidden="true"
          hidden={active}
          className="shrink-0 pl-4 text-sm text-theme-muted"
        >
          zoff.me/
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoCapitalize="none"
          autoComplete="off"
          spellcheck={false}
          onFocus={discovery.dismiss}
          onInput={(event) => onChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') discovery.dismiss();
            if (event.key !== 'Enter' || event.isComposing) return;
            event.preventDefault();
            onSubmit();
          }}
          className={classNames(
            'relative z-10 h-full min-w-0 flex-1 bg-transparent font-mono text-base text-theme placeholder:text-theme-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
            active ? 'pr-1 pl-4' : 'px-1',
          )}
        />
        <span className="relative z-20 shrink-0 border-theme border-l px-1">
          <Button
            aria-label="Toggle AI playlist generation"
            aria-pressed={active}
            {...(discovery.hint && { 'aria-describedby': hintId })}
            disabled={disabled}
            size="icon"
            variant={active ? 'secondary' : 'ghost'}
            className={classNames(
              'relative before:pointer-events-none before:absolute before:inset-0.5 before:rounded-full before:bg-radial before:from-primary/40 before:via-secondary/20 before:to-transparent before:opacity-0',
              active && 'shadow-secondary-strong',
              discovery.inviting &&
                discovery.animate &&
                'motion-safe:before:animate-generative-invitation motion-reduce:before:opacity-50',
            )}
            data-inviting={discovery.inviting}
            onClick={() => {
              discovery.discover();
              onToggle();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') discovery.dismiss();
            }}
          >
            <SparklesIcon
              aria-hidden="true"
              className={classNames(
                'relative h-5 w-5',
                discovery.inviting &&
                  discovery.animate &&
                  'motion-safe:animate-generative-wiggle',
              )}
            />
          </Button>
          {discovery.hint && (
            <span
              id={hintId}
              role="tooltip"
              className="pointer-events-none absolute right-0 bottom-full mb-3 w-64 max-w-[calc(100vw-4rem)] rounded-xl border border-theme bg-theme-surface p-3 font-pixel text-sm text-theme shadow-xl"
            >
              Got a mood? Turn it into a playlist with AI.
            </span>
          )}
        </span>
        <svg
          aria-hidden="true"
          className={classNames(
            'pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-opacity duration-500 motion-reduce:transition-none',
            active ? 'opacity-100' : 'opacity-0',
          )}
        >
          <rect
            width="100%"
            height="100%"
            rx="16"
            pathLength="100"
            className={classNames(orbitClass, 'stroke-secondary')}
          />
          <rect
            width="100%"
            height="100%"
            rx="16"
            pathLength="100"
            className={classNames(
              orbitClass,
              'stroke-primary [animation-delay:-1.9s]',
            )}
          />
        </svg>
        <span
          aria-hidden="true"
          className={classNames(
            'generative-particles pointer-events-none absolute inset-x-0 bottom-full mb-px h-8 overflow-hidden transition-opacity duration-300 motion-reduce:transition-none',
            active ? 'opacity-100' : 'opacity-0',
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={classNames(
              particleClass,
              'left-[36%] text-primary [animation-delay:-0.3s]',
            )}
          >
            <path d="M10 2h4v5h3v3h5v4h-5v3h-3v5h-4v-5H7v-3H2v-4h5V7h3z" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={classNames(
              particleClass,
              'left-[53%] text-secondary [animation-delay:-1.2s]',
            )}
          >
            <path d="M12 2h4v2h4v4h-4v10h-2v2H8v-2H6v-4h2v-2h4z" />
          </svg>
          <SparklesIcon
            className={classNames(
              particleClass,
              'left-[70%] text-primary [animation-delay:-2.1s]',
            )}
          />
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={classNames(
              particleClass,
              'left-[87%] text-secondary [animation-delay:-3s]',
            )}
          >
            <path d="M8 4h12v14h-2v2h-4v-2h-2v-4h2v-2h2V8h-4v12h-2v2H6v-2H4v-4h2v-2h2z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
