import { classNames } from '@vibes/shared';
import {
  Button,
  CheckIcon,
  NowPlayingSong,
  PlaybackProgress,
  PlusIcon,
  QueueItem,
  ResetIcon,
  SkipIcon,
} from '@vibes/ui/web';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomSetupId, RoomSetupSettings } from '../hooks/roomSetups';
import { useRoomSetupScene } from '../hooks/useRoomSetupScene';

interface RoomSetupSceneProps {
  setupId: RoomSetupId;
  settings: RoomSetupSettings;
  active: boolean;
  reducedMotion: boolean;
  announce: boolean;
}

export function RoomSetupScene({
  setupId,
  settings,
  active,
  reducedMotion,
  announce,
}: RoomSetupSceneProps) {
  const { state, actions } = useRoomSetupScene({
    setupId,
    settings,
    active,
    reducedMotion,
    manual: announce,
  });
  const repeat = setupId === 'repeat';
  const curated = setupId === 'curated';
  const adminAction =
    (curated && !settings.skipAllowed) ||
    (!curated && settings.onlyAdminAddSongs);

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-5 lg:items-center lg:gap-16">
      <div className="min-w-0 lg:col-span-2">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={state.currentSong.id}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
          >
            <NowPlayingSong
              song={state.currentSong}
              isPlaying
              providerLink={false}
              animate={false}
            />
            <div className="mt-4">
              <PlaybackProgress
                durationMs={state.currentSong.duration * 1000}
                positionMs={state.positionMs}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex min-h-20 items-start gap-3">
          <motion.span
            aria-hidden="true"
            key={`${setupId}-${state.complete}-${state.asAdmin}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={classNames(
              'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
              state.blocked
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-secondary/40 bg-secondary/10 text-secondary',
            )}
          >
            {state.complete && !state.blocked && (
              <CheckIcon className="h-3.5 w-3.5" />
            )}
            {(!state.complete || state.blocked) && curated && (
              <SkipIcon className="h-3.5 w-3.5" />
            )}
            {(!state.complete || state.blocked) && repeat && (
              <ResetIcon className="h-3.5 w-3.5" />
            )}
            {(!state.complete || state.blocked) && !curated && !repeat && (
              <PlusIcon className="h-3.5 w-3.5" />
            )}
          </motion.span>
          <p className="text-theme-muted leading-relaxed">{state.caption}</p>
        </div>

        <div className="mt-2 h-11">
          {!repeat && adminAction && (
            <Button
              variant="tertiary"
              size="small"
              onClick={() => {
                if (!state.asAdmin) actions.actAsAdmin();
              }}
              disabled={!state.complete}
              aria-disabled={state.asAdmin}
              className={classNames(
                'min-h-11 gap-2',
                state.asAdmin && 'opacity-50',
              )}
            >
              {curated && <SkipIcon aria-hidden="true" className="h-4 w-4" />}
              {!curated && <PlusIcon aria-hidden="true" className="h-4 w-4" />}
              {state.asAdmin ? 'Done as admin' : 'Try as an admin'}
            </Button>
          )}
        </div>
      </div>

      <div className="min-w-0 lg:col-span-3">
        <h3 className="mb-4 flex items-center justify-between font-pixel text-theme-muted text-xs tracking-label">
          <span>UP NEXT</span>
          <span className="text-theme-subtle">{state.songs.length} SONGS</span>
        </h3>
        <ol
          aria-label="Room setup queue"
          className="min-h-65 space-y-3 sm:min-h-71"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {state.songs.map((song, index) => (
              <motion.li
                key={song.id}
                layout="position"
                initial={{ opacity: 0, x: reducedMotion ? 0 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reducedMotion ? 0 : -24 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                <QueueItem
                  song={song}
                  position={index + 1}
                  providerLink={false}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
      {announce && (
        <p role="status" className="sr-only">
          {state.complete && state.caption}
        </p>
      )}
    </div>
  );
}
