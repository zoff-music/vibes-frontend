import { Button, ShareIcon } from '@vibes/ui';
import { QRCodeSVG } from 'qrcode.react';
import { useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '../../../root';
import { EmbedSharePanel } from './EmbedSharePanel';

interface Props {
  url: string;
  roomId: string;
  onShare: () => void;
}

export const RoomSharePanel = ({ url, roomId, onShare }: Props) => {
  const rootLoaderData = useRouteLoaderData('root') as
    | RootLoaderData
    | undefined;

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

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onShare}
          variant="secondary"
          className="w-full gap-2 font-pixel text-xs"
        >
          <ShareIcon className="h-4 w-4" />
          Share Room
        </Button>

        <EmbedSharePanel
          url={url}
          roomId={roomId}
          embedBasePath={rootLoaderData?.embedBasePath ?? '/embed'}
        />
      </div>
    </div>
  );
};
