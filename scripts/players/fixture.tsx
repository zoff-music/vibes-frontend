import type { PlaybackStateV2, PlaylistItem } from '@vibes/models';
import { usePlaybackStore } from '@vibes/shared';
import { SoundCloudPlayer } from '@vibes/ui/web/player/SoundCloudPlayer';
import { VideoPlayer } from '@vibes/ui/web/player/VideoPlayer';
import { render } from 'preact';
import { faults, finish, installSoundCloud, sample } from './sdk';
import type { Provider, Track } from './types';
import './fixture.css';

if (!__LIVE_PLAYERS__) installSoundCloud();
const params = new URLSearchParams(location.search);
const providers = (params.get('sequence') || 'soundcloud,soundcloud').split(
  ',',
) as Provider[];
const suppliedTracks: Track[] = JSON.parse(params.get('tracks') || '[]');
const tracks: PlaylistItem[] = providers.map((provider, index) => ({
  id: `item-${index}`,
  sourceType: provider,
  sourceId: suppliedTracks[index]?.id || String(101 + index),
  title: `Track ${index}`,
  duration: 600,
  thumbnailUrl: '',
  publisher: 'Fixture',
  addedAt: new Date().toISOString(),
}));
let index = 0;
let ends = 0;
const state = (isPlaying = true): PlaybackStateV2 => ({
  currentPlaylistItem: tracks[index]!,
  isPlaying,
  positionMs: 0,
  updatedAt: new Date().toISOString(),
  serverTimeMs: Date.now(),
});
const advance = () => {
  index = (index + 1) % tracks.length;
  usePlaybackStore.getState().setPlaybackState(state(), 'host');
};
const onEnded = () => {
  ends++;
  advance();
};
const align = (value: boolean) =>
  usePlaybackStore.getState().setLocalPlaybackAligned(value);
const localPause = () =>
  usePlaybackStore.getState().setLocalPlayingState(false, 'host');
const localPlay = () =>
  usePlaybackStore.getState().setLocalPlayingState(true, 'host');
usePlaybackStore
  .getState()
  .setPlaybackState(state(!params.has('paused')), 'host');

if (!__LIVE_PLAYERS__)
  window.playerTest = {
    sample,
    faults,
    finish: () => finish(tracks[index]!.sourceType),
    ends: () => ends,
    index: () => index,
    changed: () => usePlaybackStore.getState().hasLocalPlaybackChanges,
  };

function Fixture() {
  const item = usePlaybackStore((value) => value.currentPlaylistItem);
  const playing = usePlaybackStore((value) => value.isPlaying);
  if (!item) return null;
  return (
    <>
      <button onClick={advance}>Skip</button>
      <button
        onClick={() =>
          usePlaybackStore.getState().setPlaybackState(state(!playing), 'host')
        }
      >
        {playing ? 'Pause' : 'Resume'}
      </button>
      <button
        onClick={() =>
          usePlaybackStore.getState().resetPlaybackState(state(), 'host')
        }
      >
        Reset
      </button>
      <output>{item.id}</output>
      <div className="relative h-80 w-full">
        <SoundCloudPlayer
          allowUnmutedAutoplay={!__LIVE_PLAYERS__}
          onLocalPause={localPause}
          onLocalPlay={localPlay}
          isVisible={item.sourceType === 'soundcloud'}
          preloadPlaylistItem={
            tracks.find((track) => track.sourceType === 'soundcloud') ?? null
          }
          showInitialPlaybackOverlay
          onEnded={onEnded}
          onLocalAlignmentChange={align}
        />
        <VideoPlayer
          allowUnmutedAutoplay={!__LIVE_PLAYERS__}
          onLocalPause={localPause}
          onLocalPlay={localPlay}
          isVisible={item.sourceType === 'youtube'}
          preloadPlaylistItem={
            tracks.find((track) => track.sourceType === 'youtube') ?? null
          }
          onEnded={onEnded}
          onLocalAlignmentChange={align}
        />
      </div>
    </>
  );
}
render(<Fixture />, document.getElementById('root')!);
