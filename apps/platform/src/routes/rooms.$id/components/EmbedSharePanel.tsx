import { safeWrap, safeWrapAsync } from '@vibes/shared';
import {
  Button,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  Modal,
  Toggle,
} from '@vibes/ui';
import { useMemo, useRef, useState } from 'react';

interface Props {
  url: string;
  roomId: string;
  embedBasePath: string;
}

export function EmbedSharePanel({ url, roomId, embedBasePath }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [playlist, setPlaylist] = useState(true);
  const [skip, setSkip] = useState(true);
  const [vote, setVote] = useState(true);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const embedScript = useMemo(() => {
    const [err, embedUrl] = safeWrap(
      () => new URL(`${embedBasePath}/${encodeURIComponent(roomId)}`, url),
    );
    if (err || !embedUrl) return '';

    embedUrl.searchParams.set('autoplay', String(autoplay));
    embedUrl.searchParams.set('playlist', String(playlist));
    embedUrl.searchParams.set('skip', String(skip));
    embedUrl.searchParams.set('vote', String(vote));

    return `<iframe src="${embedUrl.toString()}" title="Zoff room ${roomId}" width="100%" height="480" loading="lazy" allow="autoplay" frameborder="0" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }, [autoplay, embedBasePath, playlist, roomId, skip, url, vote]);

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
      <Button onClick={handleOpen} variant="primary">
        Embed player
      </Button>

      <Modal
        ariaLabelledBy="embed-player-title"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="embed-player-title" className="text-base text-theme">
              Embed player
            </h2>
            <p className="mt-1 text-sm text-theme-muted">
              Choose what visitors can do in the embedded room.
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

        <div className="mb-6 grid grid-cols-2 gap-2">
          <Toggle
            checked={autoplay}
            onChange={(enabled) => {
              setAutoplay(enabled);
              setCopied(false);
            }}
            label="Autoplay"
            variant="plain-full"
          />
          <Toggle
            checked={playlist}
            onChange={(enabled) => {
              setPlaylist(enabled);
              setCopied(false);
            }}
            label="Playlist"
            variant="plain-full"
          />
          <Toggle
            checked={vote}
            onChange={(enabled) => {
              setVote(enabled);
              setCopied(false);
            }}
            label="Voting"
            variant="plain-full"
          />
          <Toggle
            checked={skip}
            onChange={(enabled) => {
              setSkip(enabled);
              setCopied(false);
            }}
            label="Skipping"
            variant="plain-full"
          />
        </div>

        <p className="mb-2 text-[10px] text-theme-muted tracking-[0.2em]">
          Embed code
        </p>
        <button
          type="button"
          onClick={handleCopyEmbedScript}
          className="group w-full cursor-copy rounded-2xl border border-theme bg-theme-surface p-5 text-left transition-colors hover:border-theme-strong"
          aria-label="Select and copy embed code"
        >
          <code
            ref={codeRef}
            className="block max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-theme-muted text-xs selection:bg-primary/40"
          >
            {embedScript}
          </code>
          <span className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-theme-muted group-hover:text-theme">
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied' : 'Click to select and copy'}
          </span>
        </button>
      </Modal>
    </>
  );
}
