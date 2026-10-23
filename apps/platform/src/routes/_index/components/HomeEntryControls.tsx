import {
  generatedPlaylistPromptMaxLength,
  roomNameMaxLength,
} from '@vibes/models/limits';
import { classNames } from '@vibes/shared';
import {
  ArrowRightIcon,
  Button,
  GenerativeInput,
  SparklesIcon,
} from '@vibes/ui/web';
import type { RefObject } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import { useHomeGeneration } from '../../../hooks/useHomeGeneration';

interface HomeEntryControlsProps {
  active: boolean;
  enabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  onJoinRoom: () => void;
  onStartSession: () => void;
  onRestoreGeneration: (prompt: string) => void;
}

export function HomeEntryControls({
  active: inputActive,
  enabled,
  inputRef,
  value,
  placeholder,
  onChange,
  onToggle,
  onJoinRoom,
  onStartSession,
  onRestoreGeneration,
}: HomeEntryControlsProps) {
  const roomType = useExperience();
  const generation = useHomeGeneration(roomType, onRestoreGeneration);
  const generating = generation.generating;
  const active = inputActive || generating;

  const submit = () => {
    if (generating) return;
    if (!active) {
      if (value.trim()) onJoinRoom();
      else onStartSession();
      return;
    }
    if (!value.trim()) return;
    generation.submit(value.trim());
  };
  const roomLabel = value.trim() ? 'Join room' : 'Start a room';
  const label = active ? 'Generate room' : roomLabel;

  return (
    <section
      aria-label={active ? 'Generate a playlist' : 'Join a room'}
      className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end"
    >
      <GenerativeInput
        active={active}
        enabled={enabled}
        disabled={generating}
        inputRef={inputRef}
        value={value}
        placeholder={placeholder}
        maxLength={
          active ? generatedPlaylistPromptMaxLength : roomNameMaxLength
        }
        onChange={(next) => onChange(active ? next : next.toLowerCase())}
        onToggle={onToggle}
        onSubmit={submit}
      />
      <Button
        aria-label={generating ? 'Generating…' : label}
        onClick={submit}
        disabled={generating || (active && !value.trim())}
        variant="primary"
        size="large"
        contentAlignment="between"
        className={classNames(
          'relative h-14 w-full gap-3 overflow-hidden font-pixel',
          active && !generating && 'motion-safe:animate-generative-action',
          generating &&
            'disabled:opacity-100 motion-safe:animate-ai-button-glow',
        )}
      >
        {active && !generating && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 motion-safe:animate-generative-action-sweep"
          />
        )}
        {generating && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/35 to-transparent motion-safe:animate-ai-button-shimmer"
          />
        )}
        <span className="sr-only" aria-live="polite">
          {generating ? 'Generating…' : label}
        </span>
        <span
          aria-hidden="true"
          className="relative block h-5 min-w-0 flex-1 whitespace-nowrap text-left leading-5"
        >
          <span
            className={classNames(
              'absolute inset-0 transition-opacity duration-150 motion-reduce:transition-none',
              active ? 'opacity-0' : 'opacity-100 delay-150',
            )}
          >
            {roomLabel}
          </span>
          <span
            className={classNames(
              'absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none',
              active ? 'opacity-100 delay-150' : 'opacity-0',
            )}
          >
            {generating ? 'Generating…' : 'Generate room'}
          </span>
        </span>
        <span aria-hidden="true" className="relative grid size-5 shrink-0">
          <SparklesIcon
            className={classNames(
              'col-start-1 row-start-1 size-5 transition-[opacity,transform] duration-700 motion-reduce:transition-none',
              active
                ? 'rotate-0 scale-100 opacity-100 delay-150'
                : '-rotate-90 scale-50 opacity-0',
            )}
          />
          <ArrowRightIcon
            className={classNames(
              'col-start-1 row-start-1 size-5 transition-[opacity,transform] duration-300 motion-reduce:transition-none',
              active
                ? 'translate-x-3 scale-75 opacity-0'
                : 'translate-x-0 scale-100 opacity-100',
            )}
          />
        </span>
      </Button>
    </section>
  );
}
