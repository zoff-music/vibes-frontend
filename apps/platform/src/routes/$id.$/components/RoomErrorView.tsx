import { useNavigate } from '@kasperrt/smolter/preact';
import { AlertCircleIcon, Button } from '@vibes/ui/web';

interface RoomErrorViewProps {
  isRoomNotFound: boolean;
  message: string;
  roomId: string;
  onRetry: () => void;
}

export function RoomErrorView({
  isRoomNotFound,
  message,
  roomId,
  onRetry,
}: RoomErrorViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="panel-surface animate-scale-in rounded-player w-full max-w-md p-8 text-center">
        <div className="border-error/50 bg-error/10 mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border">
          <AlertCircleIcon className="text-error h-10 w-10" />
        </div>
        <h2 className="font-display text-theme mb-2 text-lg">
          Connection Failed
        </h2>
        <p className="text-theme-muted mb-6 text-sm">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onRetry} variant="tertiary">
            Try Again
          </Button>
          {isRoomNotFound && (
            <Button
              onClick={() =>
                navigate(`/rooms/create?name=${encodeURIComponent(roomId)}`, {})
              }
              variant="primary"
            >
              Create Room
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
