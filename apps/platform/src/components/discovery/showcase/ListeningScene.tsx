import type { PlaylistItem } from '@vibes/models';
import {
  ListenerCount,
  NowPlayingPlaylistItem,
  PlaybackProgress,
} from '@vibes/ui/web';
import { AnimatePresence, m as motion } from 'framer-motion';
import { useEffect, useState } from 'preact/compat';
import { usePlaybackPreview } from '../../../hooks/discovery/usePlaybackPreview';
import { LiveRoomStage } from '../../seo/live/LiveRoomStage';
import {
  queueDemoPlaylistItems,
  watchDemoPlaylistItems,
} from '../../seo/preview';

interface ListeningSceneProps {
  playing: boolean;
  watch?: boolean;
}

// Mira opens the link a little later and lands at the same point in the song.
export function ListeningScene({
  playing,
  watch = false,
}: ListeningSceneProps) {
  const { state } = usePlaybackPreview(false, playing);
  const joined = useJoinLoop(playing);
  const source = watch ? watchDemoPlaylistItems : queueDemoPlaylistItems;
  const playlistItem = source[state.track % source.length];
  const listeners = joined ? 2 : 1;

  return (
    <div
      inert
      className="flex min-w-0 items-end justify-center gap-3 px-3 pt-6 pb-2 sm:gap-5 sm:px-6"
    >
      <section aria-label="Your laptop" className="min-w-0 flex-[1.7]">
        <div className="border-theme bg-theme @container rounded-2xl border p-2 shadow-lg sm:p-3">
          <div className="grid min-w-0 gap-2 @md:grid-cols-2 @md:gap-3">
            <div className="crt-frame rounded-player relative aspect-video overflow-hidden bg-black @md:aspect-square">
              <LiveRoomStage
                playlistItem={playlistItem}
                playing={playing}
                watch={watch}
              />
            </div>
            <div className="min-w-0 self-center">
              <MiniNowPlaying
                playlistItem={playlistItem}
                positionMs={state.position}
                durationMs={state.durationMs}
                listeners={listeners}
                watch={watch}
              />
            </div>
          </div>
        </div>
        <div className="mx-auto h-2 w-[110%] -translate-x-[4.5%] rounded-b-xl bg-white/10" />
        <p className="text-theme-muted mt-3 text-center text-xs">You</p>
      </section>

      <section aria-label="Mira’s phone" className="w-32 shrink-0 sm:w-40">
        <div className="border-theme bg-theme relative aspect-[9/17] overflow-hidden rounded-[1.75rem] border-4 p-2 shadow-lg">
          <span className="absolute top-1.5 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-black/60" />
          <AnimatePresence initial={false} mode="wait">
            {!joined && (
              <motion.div
                key="link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col items-center justify-center gap-3 text-center"
              >
                <span className="border-theme bg-theme-surface text-theme rounded-full border px-3 py-1.5 text-xs">
                  {watch ? 'zoff.me/afterhours' : 'zoff.me/electro'}
                </span>
                <span className="border-theme border-t-primary size-5 animate-spin rounded-full border-2" />
              </motion.div>
            )}
            {joined && (
              <motion.div
                key="room"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full flex-col gap-2 pt-3"
              >
                <div className="crt-frame relative aspect-square overflow-hidden rounded-2xl bg-black">
                  <LiveRoomStage
                    playlistItem={playlistItem}
                    playing={playing}
                    watch={watch}
                  />
                </div>
                <MiniNowPlaying
                  playlistItem={playlistItem}
                  positionMs={state.position}
                  durationMs={state.durationMs}
                  listeners={listeners}
                  watch={watch}
                  compact
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-theme-muted mt-3 text-center text-xs">
          Mira, across town
        </p>
      </section>
    </div>
  );
}

interface MiniNowPlayingProps {
  playlistItem: PlaylistItem;
  positionMs: number;
  durationMs: number;
  listeners: number;
  compact?: boolean;
  watch: boolean;
}

function MiniNowPlaying({
  playlistItem,
  positionMs,
  durationMs,
  listeners,
  compact = false,
  watch,
}: MiniNowPlayingProps) {
  return (
    <div className="min-w-0">
      {!compact && (
        <div className="mb-2 hidden items-center justify-between gap-2 @md:flex">
          <span className="font-display text-2xs text-theme-muted tracking-label flex items-center gap-1.5 whitespace-nowrap">
            <span className="bg-secondary shadow-secondary-strong size-1.5 rounded-full" />
            Now Playing
          </span>
          <ListenerCount
            count={listeners}
            variant="inline"
            roomType={watch ? 'WATCH' : 'MUSIC'}
            className="whitespace-nowrap"
          />
        </div>
      )}
      {!compact && (
        <NowPlayingPlaylistItem
          playlistItem={playlistItem}
          isPlaying
          providerLink={false}
          animate={false}
          showStatus={false}
          density="compact"
        />
      )}
      {compact && (
        <div className="min-w-0 px-1">
          <p className="font-display text-theme text-2xs truncate uppercase">
            {playlistItem.title}
          </p>
          <p className="text-theme-muted text-2xs mt-0.5 truncate">
            {listeners} {watch ? 'watching' : 'listening'}
          </p>
        </div>
      )}
      <div className="mt-2">
        <PlaybackProgress
          durationMs={durationMs}
          positionMs={positionMs}
          showTimes={!compact}
        />
      </div>
    </div>
  );
}

function useJoinLoop(playing: boolean) {
  const [joined, setJoined] = useState(true);

  useEffect(() => {
    if (!playing) {
      setJoined(true);

      return;
    }

    let timeout = 0;
    const loop = (next: boolean) => {
      setJoined(next);
      timeout = window.setTimeout(() => loop(!next), next ? 9000 : 2200);
    };

    loop(false);

    return () => window.clearTimeout(timeout);
  }, [playing]);

  return joined;
}
