import { AlertCircleIcon, Button } from '@vibes/ui/web';
import { useNavigate } from 'react-router';

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
      <div className="panel-surface w-full max-w-md animate-scale-in rounded-player p-8 text-center">
        <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-error/50 bg-error/10">
          <AlertCircleIcon className="h-10 w-10 text-error" />
        </div>
        <h2 className="mb-2 font-display text-lg text-theme">
          Connection Failed
        </h2>
        <p className="mb-6 text-sm text-theme-muted">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onRetry} variant="tertiary">
            Try Again
          </Button>
          {isRoomNotFound && (
            <Button
              onClick={() =>
                navigate(`/rooms/create?name=${encodeURIComponent(roomId)}`, {
                  viewTransition: true,
                })
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
