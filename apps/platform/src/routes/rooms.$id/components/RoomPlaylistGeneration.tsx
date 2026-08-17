import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { AlertCircleIcon, Button, SparklesIcon } from '@vibes/ui/web';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import type { RoomActionData } from '../action';

interface RoomPlaylistGenerationProps {
  onGenerationStarted: () => void;
}

export function RoomPlaylistGeneration({
  onGenerationStarted,
}: RoomPlaylistGenerationProps) {
  const fetcher = useFetcher<RoomActionData>();
  const [prompt, setPrompt] = useState('');
  const isSubmitting = fetcher.state !== 'idle';

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
    if (!normalizedPrompt || isSubmitting) {
      return;
    }

    fetcher.submit(
      { intent: 'generatePlaylist', prompt: normalizedPrompt },
      { encType: 'application/json', method: 'post' },
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGenerate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-secondary" />
        <h5
          id="room-generation-title"
          className="font-pixel text-2xs text-theme-muted tracking-label"
        >
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
        disabled={isSubmitting}
        placeholder="Late-night synthwave drive"
        className="w-full rounded-xl border border-theme bg-theme-surface px-3 py-2 text-sm text-theme outline-hidden transition-all placeholder:text-theme-subtle focus:border-secondary/60 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-2 flex justify-between gap-3 text-theme-subtle text-xs">
        <span>Generates a playlist based on your suggestion.</span>
        <span className="shrink-0 tabular-nums">
          {prompt.length}/{generatedPlaylistPromptMaxLength}
        </span>
      </div>

      {fetcher.data?.intent === 'generatePlaylist' && fetcher.data.error && (
        <div
          aria-live="polite"
          className="mt-3 flex items-start gap-2 text-error text-xs"
          role="alert"
        >
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{fetcher.data.error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !prompt.trim()}
        variant="secondary"
        className="mt-3 w-full gap-2 font-pixel text-xs"
      >
        <SparklesIcon className="h-4 w-4" />
        {isSubmitting ? 'Starting...' : 'Fill Playlist'}
      </Button>
    </form>
  );
}
