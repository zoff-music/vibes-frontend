import type { PublicRoom } from '@vibes/models';
import {
  generatedPlaylistPromptMaxLength,
  roomNameMaxLength,
} from '@vibes/models';
import { chunkItems } from '@vibes/ui/shared';
import { useState } from 'react';
import { useFetcher } from 'react-router';
import { useGenerationMessage } from '@/hooks/use-generation-message';
import type { PublicRoomsData } from '@/tizen/routes/public-rooms/loader';
import zoffLogo from '../../assets/icon.png';

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
  const [browsing, setBrowsing] = useState(false);
  const [query, setQuery] = useState('');
  const browser = useFetcher<PublicRoomsData>();
  const browseLoading = browser.state !== 'idle';
  const rooms = browsing ? (browser.data?.result?.rooms ?? []) : publicRooms;
  const result = browser.data?.result;
  const loadRooms = (from = 0) => {
    setBrowsing(true);
    void browser.load(
      `/rooms/public?${new URLSearchParams({ from: String(from), q: query })}`,
    );
  };
  const publicRoomRows = chunkItems(
    rooms.slice(0, browsing ? 12 : publicRoomLimit),
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
    <div className="relative mx-auto flex h-full max-w-7xl flex-col gap-10 overflow-y-auto px-16 py-12">
      <header className="flex items-center gap-6">
        <img src={zoffLogo} alt="Zoff" className="size-28 rounded-full" />
        <div>
          <h1 className="text-6xl">Zoff</h1>
          <p className="mt-2 text-2xl text-tv-muted">Rooms on your TV</p>
        </div>
      </header>
      <div className="grid grid-cols-2 items-start gap-10">
        <section className="relative mt-24 rounded-[2rem] border-2 border-tv-border bg-tv-card/95 p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-24 flex h-24 justify-center overflow-hidden"
          >
            <div className="size-56 rounded-full bg-linear-to-b from-[#ffe8a3] via-[#ff6b9b] to-[#ac42d5] opacity-80 [mask-image:linear-gradient(to_bottom,black_0%,black_22%,transparent_22%,transparent_24%,black_24%,black_30%,transparent_30%,transparent_33%,black_33%,black_38%,transparent_38%,transparent_42%,black_42%,black_46%,transparent_46%)]" />
          </div>
          <h2 className="mb-8 text-4xl">
            {isAIMode ? 'Set the ' : 'Listen to music '}
            <span className="text-primary">
              {isAIMode ? 'mood.' : 'together.'}
            </span>
          </h2>
          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="flex gap-5">
              <input
                aria-label={isAIMode ? 'Playlist prompt' : 'Room name'}
                autoFocus
                className="min-h-20 min-w-0 flex-1 rounded-2xl border-2 border-tv-border bg-tv-surface px-5 text-2xl"
                onChange={(event) => setValue(event.target.value)}
                placeholder={placeholder}
                maxLength={
                  isAIMode
                    ? generatedPlaylistPromptMaxLength
                    : roomNameMaxLength
                }
                value={value}
              />
              <button
                aria-label={isAIMode ? 'Disable AI mode' : 'Enable AI mode'}
                aria-pressed={isAIMode}
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
        <section className="mt-24 rounded-[2rem] border-2 border-tv-border bg-tv-card/95 p-8">
          <div className="mb-5 flex gap-4">
            <button
              type="button"
              aria-pressed={!browsing}
              className="min-h-16 flex-1 rounded-2xl border-2 border-tv-border bg-tv-card px-5 text-2xl aria-pressed:border-accent"
              onClick={() => setBrowsing(false)}
            >
              Live rooms
            </button>
            <button
              type="button"
              aria-pressed={browsing}
              className="min-h-16 flex-1 rounded-2xl border-2 border-tv-border bg-tv-card px-5 text-2xl aria-pressed:border-accent"
              onClick={() => loadRooms()}
            >
              Browse
            </button>
          </div>
          {browsing && (
            <form
              className="mb-5 flex gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                loadRooms();
              }}
            >
              <input
                aria-label="Search public rooms"
                placeholder="Search rooms"
                value={query}
                maxLength={100}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-16 min-w-0 flex-1 rounded-2xl border-2 border-tv-border bg-tv-surface px-5 text-2xl"
              />
              <button
                type="submit"
                disabled={browseLoading}
                className="rounded-2xl border-2 border-tv-border px-5 text-xl"
              >
                Search
              </button>
            </form>
          )}
          {browsing && browseLoading && (
            <p className="mb-4 text-tv-muted">Loading rooms…</p>
          )}
          {browsing && browser.data?.error && (
            <p className="mb-4 text-primary">{browser.data.error}</p>
          )}
          <div className="flex flex-col gap-5">
            {!browseLoading && rooms.length === 0 && (
              <p className="rounded-2xl border border-tv-border bg-tv-card p-6 text-tv-muted text-xl">
                {browsing
                  ? 'No rooms match your search.'
                  : 'No public rooms are active right now.'}
              </p>
            )}
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
                      <strong className="block truncate text-xl">
                        {room.name}
                      </strong>
                      <span className="mt-1 block truncate text-base text-tv-muted">
                        {room.listenerCount} listening · {room.songCount} songs
                      </span>
                    </span>
                    <span className="shrink-0 text-accent text-lg">Join →</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          {browsing && result && result.total > 0 && (
            <div className="mt-5 flex items-center justify-between gap-4 text-xl">
              <button
                type="button"
                className="min-h-16 rounded-2xl border-2 border-tv-border px-5 disabled:opacity-40"
                disabled={browseLoading || result.from === 0}
                onClick={() => loadRooms(Math.max(0, result.from - 12))}
              >
                Previous
              </button>
              <span>
                {Math.floor(result.from / 12) + 1} /{' '}
                {Math.ceil(result.total / 12)}
              </span>
              <button
                type="button"
                className="min-h-16 rounded-2xl border-2 border-tv-border px-5 disabled:opacity-40"
                disabled={browseLoading || result.from + 12 >= result.total}
                onClick={() => loadRooms(result.from + 12)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const publicRoomLimit = 6;

const publicRoomColumns = 2;
