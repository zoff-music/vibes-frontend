import { classNames } from '@vibes/shared';
import { type ReactNode, type RefObject, useId } from 'preact/compat';
import { useGenerativeDiscovery } from '../hooks/useGenerativeDiscovery';
import { SparklesIcon } from '../icons';
import { GenerativeParticles } from './GenerativeParticles';
import { IconButton } from './IconButton';

interface GenerativeInputProps {
  active: boolean;
  enabled: boolean;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  placeholder: string;
  maxLength?: number;
  label?: string;
  hideLabel?: boolean;
  prefix?: ReactNode;
  showToggle?: boolean;
  trailingContent?: ReactNode;
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
  label,
  hideLabel = false,
  prefix = 'zoff.me/',
  showToggle = true,
  trailingContent,
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

  return (
    <div className="min-w-0">
      <div
        className={
          hideLabel
            ? 'sr-only'
            : 'mb-2 flex h-5 items-center justify-between gap-3'
        }
      >
        <label htmlFor={id} className="font-pixel text-sm text-theme-muted">
          {label ?? (active ? 'What’s the vibe?' : 'Room name')}
        </label>
        {active && maxLength && (
          <span className="text-theme-subtle text-xs tabular-nums">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <div
        className={classNames(
          'generative-field relative isolate flex h-14 min-w-0 items-center rounded-full border bg-theme-surface transition-[box-shadow,border-color] duration-500 focus-within:ring-2 focus-within:ring-secondary/30 motion-reduce:transition-none',
          active
            ? 'border-primary shadow-generative-field motion-safe:animate-generative-ignition'
            : 'border-theme',
        )}
        data-powered={active}
        data-animate={discovery.animate}
      >
        {active && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
          >
            <span className="absolute -inset-2 origin-right rounded-full bg-radial-[at_100%_50%] from-secondary/45 via-primary/20 to-transparent opacity-0 blur-lg motion-safe:animate-generative-charge" />
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 origin-right bg-radial-[at_100%_50%] from-secondary/35 via-primary/15 to-transparent opacity-0 [mask-image:linear-gradient(to_left,black_40%,transparent)] motion-safe:animate-generative-charge" />
              <span className="absolute inset-x-0 top-0 h-px origin-right bg-linear-to-l from-secondary via-white to-primary opacity-0 shadow-secondary-strong motion-safe:animate-generative-rail" />
              <span className="absolute inset-x-0 bottom-0 h-px origin-right bg-linear-to-l from-secondary via-white to-primary opacity-0 shadow-secondary-strong motion-safe:animate-generative-rail" />
              <span className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-r from-transparent via-secondary/35 to-transparent opacity-0 motion-safe:animate-generative-sweep" />
            </span>
          </span>
        )}
        <span
          aria-hidden="true"
          hidden={active}
          className="shrink-0 pl-6 text-sm text-theme-muted"
        >
          {prefix}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          {...(maxLength !== undefined && { maxLength })}
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
            active ? 'pr-1 pl-6' : 'px-1',
          )}
        />
        {trailingContent}
        {showToggle && (
          <span className="relative z-20 shrink-0 px-1">
            <IconButton
              aria-label="Toggle AI playlist generation"
              aria-pressed={active}
              {...(discovery.hint && { 'aria-describedby': hintId })}
              disabled={disabled}
              variant={active ? 'secondary' : 'ghost'}
              className={classNames(
                'relative before:pointer-events-none before:absolute before:inset-0.5 before:rounded-full before:bg-radial before:from-primary/40 before:via-secondary/20 before:to-transparent before:opacity-0',
                active &&
                  'shadow-secondary-strong motion-safe:animate-generative-switch',
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
                  active && 'motion-safe:animate-generative-spark',
                  discovery.inviting &&
                    discovery.animate &&
                    'motion-safe:animate-generative-wiggle',
                )}
              />
            </IconButton>
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
        )}
        <svg
          aria-hidden="true"
          className={classNames(
            'pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-opacity duration-500 motion-reduce:transition-none',
            active
              ? 'opacity-100 motion-safe:animate-generative-ready'
              : 'opacity-0',
          )}
        >
          <rect
            width="100%"
            height="100%"
            rx="28"
            pathLength="100"
            className={classNames(orbitClass, 'stroke-secondary')}
          />
          <rect
            width="100%"
            height="100%"
            rx="28"
            pathLength="100"
            className={classNames(
              orbitClass,
              'stroke-primary [animation-delay:-1.9s]',
            )}
          />
        </svg>
        <GenerativeParticles enabled={active && discovery.animate} />
      </div>
    </div>
  );
}
