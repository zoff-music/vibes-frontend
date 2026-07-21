import { safeWrapAsync } from '@vibes/shared';
import { Button } from '@vibes/ui';
import { QRCodeSVG } from 'qrcode.react';
import { useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '../../../root';
import { EmbedSharePanel } from './EmbedSharePanel';

interface Props {
  url: string;
  roomId: string;
  onCopy: () => void;
}

export const RoomSharePanel = ({ url, roomId, onCopy }: Props) => {
  const rootLoaderData = useRouteLoaderData('root') as
    | RootLoaderData
    | undefined;

  const handleCopyRoomId = async () => {
    const [err] = await safeWrapAsync(navigator.clipboard.writeText(roomId));
    if (err) {
      console.error('Failed to copy room ID', err);
    }
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
            <Button
              onClick={handleCopyRoomId}
              variant="tertiary"
              className="px-3 py-1.5 text-[10px]"
            >
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
            <Button
              onClick={onCopy}
              variant="tertiary"
              className="px-3 py-1.5 text-[10px]"
            >
              Copy
            </Button>
          </div>
        </div>

        <EmbedSharePanel
          url={url}
          roomId={roomId}
          embedBasePath={rootLoaderData?.embedBasePath ?? '/embed'}
        />
      </div>
    </div>
  );
};
