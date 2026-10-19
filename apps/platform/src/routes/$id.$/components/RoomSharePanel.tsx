import { Button, CastIcon, LinkButton, ShareIcon } from '@vibes/ui/web';
import { QRCodeSVG } from 'qrcode.react';
import { useRoomPanel } from '../hooks/useRoomPanel';

interface Props {
  url: string;
  roomId: string;
  roomType: RoomType;
  onShare: () => void;
  onOpenPartyScreen: () => void;
}

export const RoomSharePanel = ({
  url,
  roomId,
  roomType,
  onShare,
  onOpenPartyScreen,
}: Props) => {
  const { href } = useRoomPanel();

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
          className="h-12 w-full gap-2"
        >
          <ShareIcon className="h-4 w-4" />
          Share Room
        </Button>

        <LinkButton
          className="hidden h-12 w-full gap-2 sm:flex"
          to={href('share/embed')}
          replace
          preventScrollReset
          viewTransition={false}
          prefetch="intent"
          prefetchData
          variant="primary"
        >
          Embed player
        </LinkButton>
        <Button
          className="col-span-2 h-12 w-full gap-2"
          onClick={onOpenPartyScreen}
          variant="tertiary"
        >
          <CastIcon className="h-4 w-4" />
          {getRoomLabels(roomType).presentation}
        </Button>
      </div>
    </div>
  );
};

const platformLogoUrl = `${import.meta.env.BASE_URL}logo.png`;

import type { RoomType } from '@vibes/models';
import { getRoomLabels } from '@vibes/ui/shared';
