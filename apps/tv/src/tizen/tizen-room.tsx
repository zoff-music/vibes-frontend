import type { useTvSession } from '@/hooks/use-tv-session';
import { QrCode } from '@/tizen/qr-code';

interface TizenRoomProps {
  session: ReturnType<typeof useTvSession>;
}

export function TizenRoom({ session }: TizenRoomProps) {
  const current = session.playback.currentSong;
  const queued = current
    ? session.songs.filter((song) => song.id !== current.id)
    : session.songs;
  const joinUrl = `https://zoff.me/${encodeURIComponent(session.roomId)}`;
  let player = (
    <div className="flex h-full items-center justify-center bg-black text-4xl text-tv-muted">
      Add songs from your phone to begin
    </div>
  );
  if (current?.sourceType === 'youtube') {
    const src = `https://www.youtube.com/embed/${encodeURIComponent(current.sourceId)}?autoplay=1&enablejsapi=1&playsinline=1&rel=0`;
    player = (
      <iframe
        allow="autoplay; encrypted-media"
        className="h-full w-full border-0"
        src={src}
        title={current.title}
      />
    );
  }
  if (current?.sourceType === 'soundcloud' && current.providerUrl) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(current.providerUrl)}&auto_play=${String(session.playback.isPlaying)}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
    player = (
      <iframe
        allow="autoplay"
        className="h-full w-full border-0"
        src={src}
        title={current.title}
      />
    );
  }
  if (current?.sourceType === 'spotify') {
    const src = `https://open.spotify.com/embed/track/${encodeURIComponent(current.sourceId)}?utm_source=zoff`;
    player = (
      <iframe
        allow="autoplay; encrypted-media"
        className="h-full w-full border-0"
        src={src}
        title={current.title}
      />
    );
  }
  if (
    current &&
    current.sourceType !== 'youtube' &&
    current.sourceType !== 'soundcloud' &&
    current.sourceType !== 'spotify'
  ) {
    player = (
      <div className="relative flex h-full items-center justify-center overflow-hidden bg-black">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src={current.thumbnailUrl}
        />
        <img
          alt=""
          className="relative size-80 rounded-3xl object-cover"
          src={current.thumbnailUrl}
        />
      </div>
    );
  }
  return (
    <div className="relative grid h-full grid-cols-[1.65fr_1fr] gap-8 p-8">
      <section className="flex min-w-0 flex-col gap-5">
        <header className="flex items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="text-accent text-xl">NOW PLAYING</div>
            <h1 className="truncate text-4xl">
              {current?.title ?? 'Waiting for music'}
            </h1>
          </div>
          <button
            className="rounded-2xl border-2 border-tv-border bg-tv-surface px-8 py-4 text-xl"
            onClick={session.leaveRoom}
            type="button"
          >
            ← Leave
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden rounded-[2rem] border-2 border-tv-border bg-black">
          {player}
        </div>
        <div className="flex items-center gap-5 rounded-3xl border-2 border-tv-border bg-tv-card p-5">
          {current?.thumbnailUrl && (
            <img
              alt=""
              className="size-24 rounded-2xl object-cover"
              src={current.thumbnailUrl}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-3xl">
              {current?.title ?? 'Add songs to play'}
            </div>
            <div className="text-tv-muted text-xl">
              {current?.artist ?? session.room?.name}
            </div>
          </div>
        </div>
      </section>
      <aside className="flex min-w-0 flex-col gap-5">
        <header>
          <h2 className="text-4xl">Up next ({queued.length})</h2>
          <p className="text-tv-muted text-xl">
            {session.listenerCount || session.room?.userCount || 0} listening
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden rounded-[2rem] border-2 border-tv-border bg-tv-card p-5">
          <div className="space-y-3">
            {queued.slice(0, 5).map((song, index) => (
              <div
                className="flex items-center gap-4 rounded-2xl border border-tv-border bg-tv-surface p-4"
                key={song.id}
              >
                <span className="w-8 text-tv-muted text-xl">{index + 1}</span>
                <img
                  alt=""
                  className="size-16 rounded-xl object-cover"
                  src={song.thumbnailUrl}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xl">{song.title}</div>
                  <div className="truncate text-lg text-tv-muted">
                    {song.artist ?? song.sourceType} · {song.voteCount ?? 0}{' '}
                    votes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-[2rem] border-2 border-primary/60 bg-tv-card p-5">
          <QrCode value={joinUrl} />
          <div className="min-w-0">
            <div className="text-accent text-xl">SCAN TO JOIN</div>
            <div className="truncate text-4xl">{session.room?.name}</div>
            <div className="text-lg text-tv-muted">
              Add songs and vote from your phone
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
