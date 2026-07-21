import { safeWrap, safeWrapAsync } from '@vibes/shared';
import { Button, Toggle } from '@vibes/ui';
import { useMemo, useState } from 'react';

interface Props {
  url: string;
  roomId: string;
  embedBasePath: string;
}

export function EmbedSharePanel({ url, roomId, embedBasePath }: Props) {
  const [autoplay, setAutoplay] = useState(false);
  const [playlist, setPlaylist] = useState(true);
  const [skip, setSkip] = useState(true);
  const [vote, setVote] = useState(true);

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
    const [err] = await safeWrapAsync(
      navigator.clipboard.writeText(embedScript),
    );
    if (err) {
      console.error('Failed to copy embed script', err);
    }
  };

  return (
    <div className="border-theme border-t pt-4 text-left">
      <p className="mb-3 font-display text-theme-muted text-xs tracking-widest">
        Embed Player
      </p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Toggle
          checked={autoplay}
          onChange={setAutoplay}
          label="Auto"
          variant="plain-full"
        />
        <Toggle
          checked={playlist}
          onChange={setPlaylist}
          label="List"
          variant="plain-full"
        />
        <Toggle
          checked={vote}
          onChange={setVote}
          label="Vote"
          variant="plain-full"
        />
        <Toggle
          checked={skip}
          onChange={setSkip}
          label="Skip"
          variant="plain-full"
        />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-surface p-2">
        <code className="max-h-20 flex-1 overflow-auto whitespace-pre-wrap break-all font-mono text-theme-muted text-xs">
          {embedScript}
        </code>
        <Button onClick={handleCopyEmbedScript} variant="copy-small">
          Copy
        </Button>
      </div>
    </div>
  );
}
