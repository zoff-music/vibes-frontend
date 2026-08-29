import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { classNames, usePageVisibility } from '@vibes/shared';
import {
  playlistGenerationMessageIntervalMs,
  playlistGenerationMessages,
} from '@vibes/ui/shared';
import { AlertCircleIcon, Button, SparklesIcon, Tooltip } from '@vibes/ui/web';
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from 'react';
import { useFetcher } from 'react-router';
import type { HomeActionData } from '../action';

interface PlaylistGenerationControlsProps {
  onPromptChange: (value: string) => void;
  onToggleAIMode: () => void;
  placeholder: string;
  prompt: string;
}

export function PlaylistGenerationControls({
  onPromptChange,
  onToggleAIMode,
  placeholder,
  prompt,
}: PlaylistGenerationControlsProps) {
  const fetcher = useFetcher<HomeActionData>();
  const isTabVisible = usePageVisibility();
  const isGenerating = fetcher.state !== 'idle';
  const [generationMessageIndex, setGenerationMessageIndex] = useState(0);
  const generationMessage = playlistGenerationMessages[generationMessageIndex];

  useEffect(() => {
    if (!isGenerating || !isTabVisible) {
      return;
    }

    const interval = window.setInterval(() => {
      setGenerationMessageIndex(
        (current) => (current + 1) % playlistGenerationMessages.length,
      );
    }, playlistGenerationMessageIntervalMs);

    return () => window.clearInterval(interval);
  }, [isGenerating, isTabVisible]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onPromptChange(event.target.value);
  };

  const handleGenerateRoom = () => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt || isGenerating) {
      return;
    }

    setGenerationMessageIndex(0);
    fetcher.submit(
      { intent: 'generateRoom', prompt: normalizedPrompt },
      { method: 'post' },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGenerateRoom();
    }
  };

  return (
    <div className="mt-8 space-y-5">
      <div
        className={classNames(
          'panel-surface rounded-3xl p-6 transition-all duration-500',
          isGenerating &&
            'animate-pulse border-secondary/70 shadow-secondary-panel',
        )}
      >
        <label
          htmlFor="playlist-prompt"
          className="mb-3 block font-pixel text-2xs text-theme-muted tracking-label"
        >
          PLAYLIST PROMPT
        </label>
        <div className="relative">
          <input
            id="playlist-prompt"
            type="text"
            placeholder={placeholder}
            value={prompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-14 pl-4 font-mono text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-60"
            maxLength={generatedPlaylistPromptMaxLength}
            disabled={isGenerating}
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2">
            <Tooltip
              align="end"
              className="inline-flex"
              content="Use a room name instead"
            >
              <Button
                aria-label="Toggle AI playlist generation"
                aria-pressed
                disabled={isGenerating}
                onClick={onToggleAIMode}
                size="icon"
                variant="tertiary-active"
              >
                <SparklesIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </span>
        </div>
        <div className="mt-3 flex justify-between gap-4 text-theme-subtle text-xs">
          <span aria-live="polite">
            {isGenerating
              ? generationMessage
              : 'Generates a playlist based on your suggestion'}
          </span>
          <span className="tabular-nums">
            {prompt.length}/{generatedPlaylistPromptMaxLength}
          </span>
        </div>
        {fetcher.data?.error && (
          <div
            aria-live="polite"
            className="mt-3 flex items-start gap-2 text-error text-sm"
            role="alert"
          >
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{fetcher.data.error}</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleGenerateRoom}
        disabled={!prompt.trim() || isGenerating}
        variant="secondary"
        size="large"
        className={classNames(
          'relative w-full justify-between gap-3 overflow-hidden text-left font-pixel',
          isGenerating && 'animate-ai-button-glow disabled:opacity-100',
        )}
      >
        {isGenerating && (
          <span className="absolute inset-y-0 w-1/3 animate-ai-button-shimmer bg-linear-to-r from-transparent via-white/35 to-transparent" />
        )}
        <span className="relative">
          {isGenerating ? generationMessage : 'Generate Room'}
        </span>
        <span
          className={classNames(
            'relative shrink-0',
            isGenerating && 'animate-ai-sparkles',
          )}
        >
          <SparklesIcon className="h-5 w-5" />
        </span>
      </Button>
    </div>
  );
}
