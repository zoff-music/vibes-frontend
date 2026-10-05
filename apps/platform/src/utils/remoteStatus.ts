import type { RemoteStatusV2 } from '@vibes/models';

export function createEmptyRemoteStatus(): RemoteStatusV2 {
  return {
    currentRoomId: '',
    currentPlaylistItemId: '',
    enabled: false,
    id: '',
    online: false,
    paired: false,
    playbackIsPlaying: false,
    playbackObservedAt: '',
    playbackPositionMs: 0,
  };
}
