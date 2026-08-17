import type { PublicRoom } from '@vibes/models';
import { chunkItems } from '@vibes/ui/shared';
import { useState } from 'react';
import { useGenerationMessage } from '@/hooks/use-generation-message';

interface TizenLandingProps {
  error: string;
  isAIMode: boolean;
  loading: boolean;
  onGenerateRoom: (value: string) => void;
  onJoinOrCreateRoom: (value: string) => void;
  onToggleAIMode: () => void;
  publicRooms: PublicRoom[];
}

export function TizenLanding({
  error,
  isAIMode,
  loading,
  onGenerateRoom,
  onJoinOrCreateRoom,
  onToggleAIMode,
  publicRooms,
}: TizenLandingProps) {
  const [value, setValue] = useState('');
  const publicRoomRows = chunkItems(
    publicRooms.slice(0, publicRoomLimit),
    publicRoomColumns,
  );
  const generationMessage = useGenerationMessage(isAIMode && loading);
  const submit = () => {
    if (isAIMode) {
      onGenerateRoom(value);
      return;
    }
    onJoinOrCreateRoom(value);
  };
  let placeholder = 'Room name';
  let submitLabel = 'Join or create room';
  if (isAIMode) {
    placeholder = 'Late-night synthwave for a rainy drive';
    submitLabel = 'Generate playlist';
  }
  if (loading && isAIMode) submitLabel = generationMessage;
  return (
    <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center gap-10 px-20 py-12">
      <header className="text-center">
        <div className="text-8xl text-primary">ゾフ</div>
        <p className="mt-2 text-2xl text-tv-muted">
          Shared music rooms, made for the biggest screen.
        </p>
      </header>
      <section className="rounded-[2rem] border-2 border-tv-border bg-tv-card/95 p-10">
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex gap-5">
            <input
              autoFocus
              className="min-h-20 min-w-0 flex-1 rounded-2xl border-2 border-tv-border bg-tv-surface px-7 text-3xl"
              onChange={(event) => setValue(event.target.value)}
              placeholder={placeholder}
              value={value}
            />
            <button
              className="min-w-24 rounded-2xl border-2 border-tv-border bg-tv-surface px-7 text-4xl"
              onClick={onToggleAIMode}
              type="button"
            >
              ✦
            </button>
          </div>
          <button
            className="min-h-20 w-full rounded-2xl border-2 border-primary bg-primary px-10 text-2xl disabled:opacity-40"
            disabled={loading || !value.trim()}
            type="submit"
          >
            {submitLabel}
          </button>
          {isAIMode && loading && (
            <p className="animate-pulse text-center text-accent text-xl">
              {generationMessage}
            </p>
          )}
        </form>
        {error && <p className="mt-4 text-primary text-xl">{error}</p>}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl">Live now</h2>
          <span className="text-tv-muted text-xl">
            {publicRooms.length} public rooms
          </span>
        </div>
        <div className="flex flex-col gap-5">
          {publicRoomRows.map((rooms) => (
            <div
              className="flex gap-5"
              key={rooms.map((room) => room.id).join(':')}
            >
              {rooms.map((room) => (
                <button
                  className="flex min-h-28 min-w-0 flex-1 items-center justify-between gap-6 rounded-2xl border-2 border-tv-border bg-tv-card p-6 text-left focus:border-accent focus:bg-accent focus:text-tv-background focus:outline-none"
                  key={room.id}
                  onClick={() => onJoinOrCreateRoom(room.id)}
                  type="button"
                >
                  <span className="min-w-0">
                    <strong className="block truncate text-2xl">
                      {room.name}
                    </strong>
                    <span className="mt-1 block truncate text-lg text-tv-muted">
                      {room.listenerCount} listening · {room.songCount} songs
                    </span>
                  </span>
                  <span className="shrink-0 text-accent text-lg">Join →</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const publicRoomLimit = 6;

const publicRoomColumns = 3;
