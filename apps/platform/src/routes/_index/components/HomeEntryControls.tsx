import { useFetcher } from '@kasperrt/smolter/preact';
import {
  generatedPlaylistPromptMaxLength,
  roomNameMaxLength,
} from '@vibes/models/limits';
import { classNames, showToast } from '@vibes/shared';
import {
  ArrowRightIcon,
  Button,
  GenerativeInput,
  SparklesIcon,
} from '@vibes/ui/web';
import { type RefObject, useEffect } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import type { HomeActionData } from '../utils/actions/clientAction';

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
}

export function HomeEntryControls({
  active,
  enabled,
  inputRef,
  value,
  placeholder,
  onChange,
  onToggle,
  onJoinRoom,
  onStartSession,
}: HomeEntryControlsProps) {
  const fetcher = useFetcher<HomeActionData>();
  const roomType = useExperience();
  const generating = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.error) showToast(fetcher.data.error, 'error');
  }, [fetcher.data]);

  const submit = () => {
    if (generating) return;
    if (!active) {
      if (value.trim()) onJoinRoom();
      else onStartSession();
      return;
    }
    if (!value.trim()) return;
    fetcher.submit(
      { intent: 'generateRoom', prompt: value.trim(), roomType },
      { method: 'post' },
    );
  };
  const label = active
    ? 'Generate room'
    : value.trim()
      ? 'Join room'
      : 'Start a room';

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
        onClick={submit}
        disabled={generating || (active && !value.trim())}
        variant="primary"
        size="large"
        contentAlignment="between"
        className={classNames(
          'relative h-14 w-full gap-3 overflow-hidden font-pixel',
          generating &&
            'disabled:opacity-100 motion-safe:animate-ai-button-glow',
        )}
      >
        {generating && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/35 to-transparent motion-safe:animate-ai-button-shimmer"
          />
        )}
        <span className="relative" aria-live="polite">
          {generating ? 'Generating…' : label}
        </span>
        {active && (
          <SparklesIcon
            aria-hidden="true"
            className="relative h-5 w-5 shrink-0"
          />
        )}
        {!active && (
          <ArrowRightIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
        )}
      </Button>
    </section>
  );
}
