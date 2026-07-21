import { Button, Toggle } from '@vibes/ui';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';

interface RoomSharePanelProps {
  url: string;
  roomId: string;
  embedBasePath: string;
  onCopy: () => void;
}

export const RoomSharePanel = ({
  url,
  roomId,
  embedBasePath,
  onCopy,
}: RoomSharePanelProps) => {
  const [autoplay, setAutoplay] = useState(false);
  const [playlist, setPlaylist] = useState(true);
  const [vote, setVote] = useState(true);

  const embedScript = useMemo(() => {
    const embedUrl = new URL(
      `${embedBasePath}/${encodeURIComponent(roomId)}`,
      url || 'https://zoff.me',
    );
    embedUrl.searchParams.set('autoplay', String(autoplay));
    embedUrl.searchParams.set('playlist', String(playlist));
    embedUrl.searchParams.set('vote', String(vote));

    return `<iframe src="${embedUrl.toString()}" title="Zoff room ${roomId}" width="100%" height="480" loading="lazy" allow="autoplay" style="border:0;border-radius:16px" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }, [autoplay, embedBasePath, playlist, roomId, url, vote]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // We could trigger a toast here if we had access to the toast system,
    // but for now we follow the existing pattern.
  };

  const handleCopyEmbedScript = () => {
    navigator.clipboard.writeText(embedScript);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="inline-block rounded-2xl border border-theme bg-theme-surface p-4">
        <QRCodeSVG
          value={url}
          size={180}
          bgColor="#ffffff"
          fgColor="#2a1840"
          level="H"
        />
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 font-display text-[10px] text-theme-muted tracking-[0.2em]">
            Room Code
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-surface p-2">
            <code className="flex-1 text-left font-mono text-theme text-xs">
              {roomId}
            </code>
            <Button onClick={handleCopyRoomId} variant="copy-small">
              Copy
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 font-display text-[10px] text-theme-muted tracking-[0.2em]">
            Invite Link
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-surface p-2">
            <p className="flex-1 truncate text-left font-mono text-[10px] text-theme-muted">
              {url}
            </p>
            <Button onClick={onCopy} variant="copy-small">
              Copy
            </Button>
          </div>
        </div>

        <div className="border-theme border-t pt-4 text-left">
          <p className="mb-3 font-display text-[10px] text-theme-muted tracking-[0.2em]">
            Embed Player
          </p>
          <div className="mb-3 grid grid-cols-3 gap-2">
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
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-surface p-2">
            <code className="max-h-20 flex-1 overflow-auto whitespace-pre-wrap break-all font-mono text-[9px] text-theme-muted">
              {embedScript}
            </code>
            <Button onClick={handleCopyEmbedScript} variant="copy-small">
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
