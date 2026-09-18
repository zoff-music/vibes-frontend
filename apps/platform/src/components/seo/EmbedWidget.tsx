import { classNames } from '@vibes/shared';
import {
  Button,
  EmbedQueueSong,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  SegmentedToggle,
  SkipIcon,
} from '@vibes/ui/web';
import { MotionConfig, motion } from 'framer-motion';
import { useEmbedPreview } from './hooks/useEmbedPreview';

export function EmbedWidget() {
  const { state, actions } = useEmbedPreview();
  const { ref, options, song, songs, playing, position } = state;

  return (
    <div className="w-full min-w-0">
      <div className="grid items-stretch gap-5 md:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
        <div className="flex min-h-104 flex-col rounded-2xl border border-theme bg-theme-surface p-4">
          <h3 className="mb-5 font-pixel text-sm text-theme">Embed settings</h3>
          <div className="space-y-4">
            <SegmentedToggle
              label="Player"
              checked={options.player}
              onChange={(value) => actions.changeOption('player', value)}
              variant="plain-full"
            />
            <SegmentedToggle
              label="Playlist"
              checked={options.playlist}
              onChange={(value) => actions.changeOption('playlist', value)}
              variant="plain-full"
            />
            <div className="border-theme border-t" />
            <SegmentedToggle
              label="Voting"
              checked={options.vote}
              disabled={!options.playlist}
              onChange={(value) => actions.changeOption('vote', value)}
              variant="plain-full"
            />
            <SegmentedToggle
              label="Skipping"
              checked={options.skip}
              onChange={(value) => actions.changeOption('skip', value)}
              variant="plain-full"
            />
            <div className="border-theme border-t" />
            <SegmentedToggle
              label="Autoplay"
              checked={options.player && options.autoplay}
              disabled={!options.player}
              onChange={(value) => actions.changeOption('autoplay', value)}
              variant="plain-full"
            />
          </div>
          <p className="mt-auto pt-4 text-theme-muted text-xs leading-relaxed">
            Autoplay is off by default. Browsers may still require a click to
            play sound.
          </p>
        </div>
        <MotionConfig reducedMotion="user">
          <div className="relative h-104 min-w-0 md:h-auto">
            <section
              ref={ref}
              aria-label="Electro embed preview"
              className="@container absolute inset-0 flex min-w-0 flex-col overflow-hidden rounded-2xl border border-theme bg-theme"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-theme border-b bg-theme-elevated px-3 py-2">
                <span className="font-pixel text-sm text-theme">electro</span>
                <div className="flex items-center gap-2">
                  {options.player && (
                    <Button
                      variant="tertiary"
                      size="icon"
                      aria-label={
                        playing ? 'Pause embed preview' : 'Play embed preview'
                      }
                      onClick={actions.togglePlayback}
                    >
                      {playing && <PauseIcon className="h-5 w-5" />}
                      {!playing && <PlayIcon className="h-5 w-5" />}
                    </Button>
                  )}
                  {options.skip && (
                    <Button
                      variant="tertiary"
                      size="icon"
                      aria-label="Skip embed preview song"
                      onClick={actions.skip}
                    >
                      <SkipIcon className="h-5 w-5" />
                    </Button>
                  )}
                  <img
                    src="/logo.png"
                    alt="Zoff"
                    width={1024}
                    height={1024}
                    className="h-8 w-8 rounded-full"
                  />
                </div>
              </div>
              <div
                className={classNames(
                  'grid min-h-0 flex-1 content-center items-center gap-4 p-4',
                  options.player &&
                    options.playlist &&
                    '@min-[32rem]:grid-cols-2',
                )}
              >
                {options.player && (
                  <section className="min-w-0" aria-label="Player">
                    <div className="flex min-w-0 @min-[32rem]:flex-col items-center @min-[32rem]:items-stretch gap-3">
                      <div
                        role="img"
                        aria-label="Video player"
                        className="@min-[32rem]:mx-auto flex @min-[32rem]:h-32 h-20 @min-[32rem]:w-full w-32 @min-[32rem]:max-w-56 shrink-0 items-center justify-center rounded-lg bg-black"
                      >
                        <img
                          src={song.thumbnailUrl}
                          width={48}
                          height={48}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-pixel text-sm text-theme">
                          {song.title}
                        </h4>
                        <p className="mt-1 text-theme-muted text-xs">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <PlaybackProgress
                        durationMs={song.duration * 1000}
                        positionMs={position}
                      />
                    </div>
                  </section>
                )}
                {options.playlist && (
                  <section className="min-h-0 min-w-0" aria-label="Playlist">
                    <div className="mb-3 flex min-h-4 flex-wrap items-center justify-between gap-2">
                      <span className="font-pixel text-theme-muted text-xs tracking-widest">
                        Up next
                      </span>
                      {options.vote && (
                        <span className="text-theme-subtle text-xs">
                          Tap a track to vote
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {songs.map((track) => (
                        <motion.div
                          key={track.id}
                          layout="position"
                          transition={{
                            type: 'spring',
                            stiffness: 240,
                            damping: 28,
                          }}
                        >
                          <EmbedQueueSong
                            song={track}
                            votingEnabled={options.vote}
                            onVote={actions.vote}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
                {!options.player && !options.playlist && (
                  <p className="flex items-center justify-center text-center text-sm text-theme-muted">
                    This embed has no visible player or playlist.
                  </p>
                )}
              </div>
            </section>
          </div>
        </MotionConfig>
      </div>
    </div>
  );
}
