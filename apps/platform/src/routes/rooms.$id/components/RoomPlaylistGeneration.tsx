import {
  generatedPlaylistPromptMaxLength,
  roomGenerationMaxExistingSongs,
} from '@vibes/models';
import { classNames } from '@vibes/shared';
import { AlertCircleIcon, Button, SparklesIcon } from '@vibes/ui';
import { type ChangeEvent, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import type { RoomActionData } from '../action';

interface RoomPlaylistGenerationProps {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  songCount: number;
}

export function RoomPlaylistGeneration({
  canGenerate,
  isGenerating,
  onGenerationStarted,
  songCount,
}: RoomPlaylistGenerationProps) {
  const fetcher = useFetcher<RoomActionData>();
  const [prompt, setPrompt] = useState('');
  const isSubmitting = fetcher.state !== 'idle';
  const isAboveSongLimit = songCount > roomGenerationMaxExistingSongs;
  const isDisabled =
    !canGenerate || isGenerating || isSubmitting || isAboveSongLimit;

  useEffect(() => {
    if (
      fetcher.state !== 'idle' ||
      fetcher.data?.intent !== 'generatePlaylist' ||
      !fetcher.data.generation
    ) {
      return;
    }

    setPrompt('');
    onGenerationStarted();
  }, [fetcher.data, fetcher.state, onGenerationStarted]);

  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleGenerate = () => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt || isDisabled) {
      return;
    }

    fetcher.submit(
      { intent: 'generatePlaylist', prompt: normalizedPrompt },
      { encType: 'application/json', method: 'post' },
    );
  };

  if (isAboveSongLimit) {
    return (
      <div className="border-theme border-t pt-4">
        <div className="mb-3 flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-theme-subtle" />
          <h5 className="font-pixel text-2xs text-theme-muted tracking-label">
            Fill Playlist
          </h5>
        </div>
        <p className="text-theme-muted text-xs">
          Not available when the room has more than{' '}
          {roomGenerationMaxExistingSongs} songs.
        </p>
      </div>
    );
  }

  return (
    <div className="border-theme border-t pt-4">
      <div className="mb-3 flex items-center gap-2">
        <SparklesIcon
          className={classNames(
            'h-4 w-4 text-secondary',
            (isGenerating || isSubmitting) && 'animate-ai-sparkles',
          )}
        />
        <h5 className="font-pixel text-2xs text-theme-muted tracking-label">
          Fill Playlist
        </h5>
      </div>

      <p className="mb-3 text-theme-muted text-xs">
        Describe the music you want and AI will add matching songs.
      </p>

      <input
        type="text"
        value={prompt}
        onChange={handlePromptChange}
        maxLength={generatedPlaylistPromptMaxLength}
        disabled={isDisabled}
        placeholder="Late-night synthwave drive"
        className="w-full rounded-xl border border-theme bg-theme-surface px-3 py-2 text-sm text-theme outline-hidden transition-all placeholder:text-theme-subtle focus:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-2 flex justify-between gap-3 text-theme-subtle text-xs">
        <span>
          {isGenerating && 'A playlist is already being generated.'}
          {!isGenerating &&
            !canGenerate &&
            'Admin access is required for this room.'}
        </span>
        <span className="shrink-0 tabular-nums">
          {prompt.length}/{generatedPlaylistPromptMaxLength}
        </span>
      </div>

      {fetcher.data?.intent === 'generatePlaylist' && fetcher.data.error && (
        <div className="mt-3 flex items-start gap-2 text-error text-xs">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{fetcher.data.error}</span>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isDisabled || !prompt.trim()}
        variant="secondary"
        className="mt-3 w-full gap-2 font-pixel text-xs"
      >
        <SparklesIcon className="h-4 w-4" />
        {isSubmitting ? 'Starting...' : 'Fill Playlist'}
      </Button>
    </div>
  );
}
