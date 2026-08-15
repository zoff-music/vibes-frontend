import { Button, CastIcon, ShareIcon } from '@vibes/ui/web';
import { QRCodeSVG } from 'qrcode.react';
import { useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '../../../root';
import { EmbedSharePanel } from './EmbedSharePanel';

interface Props {
  url: string;
  roomId: string;
  onShare: () => void;
  onOpenPartyScreen: () => void;
}

export const RoomSharePanel = ({
  url,
  roomId,
  onShare,
  onOpenPartyScreen,
}: Props) => {
  const rootLoaderData = useRouteLoaderData('root') as
    | RootLoaderData
    | undefined;

  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex rounded-xl border border-theme bg-white p-2">
        <QRCodeSVG
          value={url}
          size={180}
          bgColor="#ffffff"
          fgColor="#2a1840"
          level="H"
          marginSize={4}
          title={`Join ${roomId}`}
          imageSettings={{
            src: platformLogoUrl,
            height: 32,
            width: 32,
            excavate: true,
          }}
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
        <Button
          className="col-span-2 w-full gap-2 font-pixel text-xs"
          onClick={onOpenPartyScreen}
          variant="tertiary"
        >
          <CastIcon className="h-4 w-4" />
          Party Screen
        </Button>
      </div>
    </div>
  );
};

const platformLogoUrl = `${import.meta.env.BASE_URL}logo.png`;
