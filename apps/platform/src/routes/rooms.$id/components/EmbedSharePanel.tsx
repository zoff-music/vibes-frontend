import {
  type ColorScheme,
  parseColorScheme,
  safeWrap,
  safeWrapAsync,
} from '@vibes/shared';
import {
  Button,
  CheckIcon,
  CircleHalfIcon,
  CloseIcon,
  CopyIcon,
  Modal,
  MoonIcon,
  SunIcon,
  Toggle,
} from '@vibes/ui';
import { type MouseEvent, useMemo, useRef, useState } from 'react';

interface Props {
  url: string;
  roomId: string;
  embedBasePath: string;
}

export function EmbedSharePanel({ url, roomId, embedBasePath }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [player, setPlayer] = useState(true);
  const [playlist, setPlaylist] = useState(true);
  const [skip, setSkip] = useState(true);
  const [vote, setVote] = useState(true);
  const [theme, setTheme] = useState<ColorScheme>('auto');
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const embedScript = useMemo(() => {
    const [err, embedUrl] = safeWrap(
      () => new URL(`${embedBasePath}/${encodeURIComponent(roomId)}`, url),
    );
    if (err || !embedUrl) return '';

    embedUrl.searchParams.set('player', String(player));
    embedUrl.searchParams.set('playlist', String(playlist));
    embedUrl.searchParams.set('skip', String(skip));
    embedUrl.searchParams.set('vote', String(vote));
    embedUrl.searchParams.set('theme', theme);

    return `<iframe src="${embedUrl.toString()}" title="Zoff room ${roomId}" width="100%" height="480" loading="lazy" frameborder="0" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }, [embedBasePath, player, playlist, roomId, skip, theme, url, vote]);

  const handleThemeChange = (event: MouseEvent<HTMLButtonElement>) => {
    setTheme(parseColorScheme(event.currentTarget.value));
    setCopied(false);
  };

  const handleCopyEmbedScript = async () => {
    const selection = window.getSelection();
    if (selection && codeRef.current) {
      const range = document.createRange();
      range.selectNodeContents(codeRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const [err] = await safeWrapAsync(
      navigator.clipboard.writeText(embedScript),
    );
    if (err) {
      console.error('Failed to copy embed script', err);
      return;
    }

    setCopied(true);
  };

  const handleOpen = () => {
    setCopied(false);
    setIsOpen(true);
  };

  return (
    <>
      <div className="hidden sm:block">
        <Button className="w-full" onClick={handleOpen} variant="primary">
          Embed player
        </Button>
      </div>

      <Modal
        alignment="center"
        ariaLabelledBy="embed-player-title"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="embed-player-title" className="text-base text-theme">
              Embed player
            </h2>
            <p className="mt-1 text-sm text-theme-muted">
              Choose what the embed displays and which actions visitors can
              take.
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="tertiary"
            size="icon"
            aria-label="Close embed settings"
          >
            <CloseIcon className="h-5 w-5 text-theme-muted" />
          </Button>
        </div>

        <div className="mb-6 space-y-6">
          <section aria-labelledby="embed-layout-title">
            <div className="mb-3">
              <h3
                id="embed-layout-title"
                className="font-pixel text-2xs text-theme tracking-display"
              >
                Layout
              </h3>
              <p className="mt-1 text-theme-muted text-xs">
                Choose which room content appears inside the iframe.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={player}
                onChange={(enabled) => {
                  setPlayer(enabled);
                  setCopied(false);
                }}
                label="Player"
                description="Show the current track, artwork, and playback progress."
              />
              <Toggle
                checked={playlist}
                onChange={(enabled) => {
                  setPlaylist(enabled);
                  setCopied(false);
                }}
                label="Playlist"
                description="Show upcoming songs from the room queue."
              />
            </div>
          </section>

          <section aria-labelledby="embed-controls-title">
            <div className="mb-3">
              <h3
                id="embed-controls-title"
                className="font-pixel text-2xs text-theme tracking-display"
              >
                Visitor controls
              </h3>
              <p className="mt-1 text-theme-muted text-xs">
                Room permissions still decide whether each action is allowed.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={vote}
                onChange={(enabled) => {
                  setVote(enabled);
                  setCopied(false);
                }}
                label="Voting"
                description="Show vote controls for songs in the playlist."
              />
              <Toggle
                checked={skip}
                onChange={(enabled) => {
                  setSkip(enabled);
                  setCopied(false);
                }}
                label="Skipping"
                description="Show the skip control when the room allows skipping."
              />
            </div>
          </section>

          <section aria-labelledby="embed-appearance-title">
            <div className="mb-3">
              <h3
                id="embed-appearance-title"
                className="font-pixel text-2xs text-theme tracking-display"
              >
                Appearance
              </h3>
              <p className="mt-1 text-theme-muted text-xs">
                Auto follows the visitor&apos;s device theme.
              </p>
            </div>
            <div
              className="grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-label="Embed color scheme"
            >
              <Button
                aria-checked={theme === 'auto'}
                onClick={handleThemeChange}
                role="radio"
                size="small"
                value="auto"
                className="gap-2"
                variant={theme === 'auto' ? 'tertiary-active' : 'tertiary'}
              >
                <CircleHalfIcon className="h-4 w-4" />
                Auto
              </Button>
              <Button
                aria-checked={theme === 'light'}
                onClick={handleThemeChange}
                role="radio"
                size="small"
                value="light"
                className="gap-2"
                variant={theme === 'light' ? 'tertiary-active' : 'tertiary'}
              >
                <SunIcon className="h-4 w-4" />
                Light
              </Button>
              <Button
                aria-checked={theme === 'dark'}
                onClick={handleThemeChange}
                role="radio"
                size="small"
                value="dark"
                className="gap-2"
                variant={theme === 'dark' ? 'tertiary-active' : 'tertiary'}
              >
                <MoonIcon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </section>
        </div>

        <div className="mb-2">
          <p className="text-2xs text-theme tracking-display">Embed code</p>
          <p className="mt-1 text-theme-muted text-xs">
            This code updates automatically as you change the settings.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyEmbedScript}
          className="group w-full cursor-copy rounded-2xl border border-theme bg-theme-surface p-5 text-left transition-colors hover:border-theme-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme"
          aria-label="Select and copy embed code"
        >
          <code
            ref={codeRef}
            className="block max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-theme-muted text-xs selection:bg-primary/40"
          >
            {embedScript}
          </code>
          <span className="mt-3 flex items-center justify-end gap-1.5 text-2xs text-theme-muted group-hover:text-theme">
            {copied && <CheckIcon className="h-3.5 w-3.5" />}
            {!copied && <CopyIcon className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Click to select and copy'}
          </span>
        </button>
      </Modal>
    </>
  );
}
