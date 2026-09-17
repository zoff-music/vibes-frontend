import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { classNames, showToast } from '@vibes/shared';
import { Button, SparklesIcon, Tooltip } from '@vibes/ui/web';
import { type ChangeEvent, type KeyboardEvent, useEffect } from 'react';
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
  const isGenerating = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.error) {
      showToast(fetcher.data.error, 'error');
    }
  }, [fetcher.data]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onPromptChange(event.target.value);
  };

  const handleGenerateRoom = () => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt || isGenerating) {
      return;
    }

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
    <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end">
      <div
        className={classNames(
          'min-w-0 rounded-2xl transition-shadow duration-500',
          isGenerating &&
            'animate-pulse border-secondary/70 shadow-secondary-panel',
        )}
      >
        <div className="mb-2 flex h-5 items-center justify-between gap-3">
          <label
            htmlFor="playlist-prompt"
            className="font-pixel text-sm text-theme-muted"
          >
            Playlist idea
          </label>
          <span className="shrink-0 text-theme-subtle text-xs tabular-nums">
            {prompt.length}/{generatedPlaylistPromptMaxLength}
          </span>
        </div>
        <div className="relative">
          <input
            id="playlist-prompt"
            type="text"
            placeholder={placeholder}
            value={prompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="h-14 w-full rounded-2xl border border-theme bg-theme-surface pr-14 pl-4 font-mono text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>

      <Button
        onClick={handleGenerateRoom}
        disabled={!prompt.trim() || isGenerating}
        variant="primary"
        size="large"
        contentAlignment="between"
        className={classNames(
          'relative h-14 w-full gap-3 overflow-hidden font-pixel',
          isGenerating && 'animate-ai-button-glow disabled:opacity-100',
        )}
      >
        {isGenerating && (
          <span className="absolute inset-y-0 w-1/3 animate-ai-button-shimmer bg-linear-to-r from-transparent via-white/35 to-transparent" />
        )}
        <span className="relative" aria-live="polite">
          {isGenerating ? 'Generating…' : 'Generate room'}
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
