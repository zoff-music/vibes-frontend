import { Button, CloseIcon } from '@vibes/ui/web';
import { QRCodeSVG } from 'qrcode.react';
import { UserCount } from './UserCount';

interface PartyScreenJoinCardProps {
  initialListenerCount: number;
  onExit: () => void;
  roomId: string;
  roomName: string;
  url: string;
}

export function PartyScreenJoinCard({
  initialListenerCount,
  onExit,
  roomId,
  roomName,
  url,
}: PartyScreenJoinCardProps) {
  return (
    <div className="panel-strong mt-5 flex shrink-0 items-center gap-5 rounded-3xl border border-primary/30 p-4">
      <div className="inline-flex shrink-0 rounded-2xl bg-white p-2">
        <QRCodeSVG
          className="h-36 w-36 xl:h-44 xl:w-44"
          value={url}
          size={176}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          marginSize={4}
          title={`Join ${roomName}`}
          imageSettings={{
            src: platformLogoUrl,
            height: 30,
            width: 30,
            excavate: true,
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-pixel text-2xs text-secondary tracking-label">
            Scan to join
          </p>
          <UserCount initialCount={initialListenerCount} roomId={roomId} />
        </div>
        <p className="mt-3 truncate font-display text-theme text-xl">
          {roomName}
        </p>
        <p className="mt-2 text-theme-subtle text-xs">
          Add songs and vote from your phone
        </p>
        <Button
          className="mt-4 gap-2"
          onClick={onExit}
          size="small"
          variant="ghost"
        >
          <CloseIcon className="h-4 w-4" />
          Exit Party Screen
        </Button>
      </div>
    </div>
  );
}

const platformLogoUrl = `${import.meta.env.BASE_URL}logo.png`;
