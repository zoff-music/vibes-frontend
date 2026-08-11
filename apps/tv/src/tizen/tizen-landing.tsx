import { useState } from 'react';
import type { useTvSession } from '@/hooks/use-tv-session';

interface TizenLandingProps {
  isAIMode: boolean;
  onToggleAIMode: () => void;
  session: ReturnType<typeof useTvSession>;
}

export function TizenLanding({
  isAIMode,
  onToggleAIMode,
  session,
}: TizenLandingProps) {
  const [value, setValue] = useState('');
  const submit = () => {
    if (isAIMode) {
      void session.generateRoom(value);
      return;
    }
    const joinOrCreate = async () => {
      const result = await session.loadRoom(value);
      if (result === 'notFound') await session.createRoom(value);
    };
    void joinOrCreate();
  };
  let placeholder = 'Room name';
  let submitLabel = 'Join or create room';
  if (isAIMode) {
    placeholder = 'Late-night synthwave for a rainy drive';
    submitLabel = 'Generate playlist';
  }
  return (
    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center gap-10 px-20 py-12">
      <header className="text-center">
        <div className="text-8xl text-primary">ゾフ</div>
        <h1 className="mt-2 text-6xl">Zoff TV</h1>
        <p className="mt-2 text-2xl text-tv-muted">
          Shared music rooms, made for the biggest screen.
        </p>
      </header>
      <section className="rounded-[2rem] border-2 border-tv-border bg-tv-card/95 p-10">
        <form
          className="flex gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
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
          <button
            className="rounded-2xl border-2 border-primary bg-primary px-10 text-2xl disabled:opacity-40"
            disabled={session.loading || !value.trim()}
            type="submit"
          >
            {submitLabel}
          </button>
        </form>
        {session.error && (
          <p className="mt-4 text-primary text-xl">{session.error}</p>
        )}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl">Live now</h2>
          <span className="text-tv-muted text-xl">
            {session.publicRooms.length} public rooms
          </span>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {session.publicRooms.slice(0, 6).map((room) => (
            <button
              className="rounded-2xl border-2 border-tv-border bg-tv-card p-6 text-left"
              key={room.id}
              onClick={() => void session.loadRoom(room.id)}
              type="button"
            >
              <strong className="block truncate text-2xl">{room.name}</strong>
              <span className="text-lg text-tv-muted">
                {room.listenerCount} listening · {room.songCount} songs
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
