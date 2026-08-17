import type { RemoteStatus } from '@vibes/models';

export function createEmptyRemoteStatus(): RemoteStatus {
  return {
    currentRoomId: '',
    currentSongId: '',
    enabled: false,
    id: '',
    online: false,
    paired: false,
    playbackIsPlaying: false,
    playbackObservedAt: '',
    playbackPositionMs: 0,
  };
}
