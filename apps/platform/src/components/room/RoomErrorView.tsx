import { getHttpError } from '@vibes/api';
import { AlertCircleIcon, Button } from '@vibes/ui';
import React from 'react';
import { useNavigate } from 'react-router';

interface RoomErrorViewProps {
  error: Error;
  roomId: string;
  onRetry: () => void;
}

export const RoomErrorView: React.FC<RoomErrorViewProps> = ({
  error,
  roomId,
  onRetry,
}) => {
  const navigate = useNavigate();

  const httpError = getHttpError(error);
  const isRoomNotFound =
    httpError?.response?.status === 404 ||
    error.message.includes('not found') ||
    error.message.includes('404') ||
    error.message.includes('Room does not exist') ||
    error.message.toLowerCase().includes('room not found');

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="panel-surface w-full max-w-md animate-scale-in rounded-[28px] p-8 text-center">
        <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-error/50 bg-error/10">
          <AlertCircleIcon className="h-10 w-10 text-error" />
        </div>
        <h2 className="mb-2 font-display text-lg text-theme">
          Connection Failed
        </h2>
        <p className="mb-6 text-sm text-theme-muted">{error.message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onRetry} variant="error-retry">
            Try Again
          </Button>
          {isRoomNotFound && (
            <Button
              onClick={() =>
                navigate(`/rooms/create?name=${encodeURIComponent(roomId)}`)
              }
              variant="error-create"
            >
              Create Room
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
