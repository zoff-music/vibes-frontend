import type {
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  RemoteStatusV2,
  RoomV2,
} from '@vibes/models';

export interface ControllerLoaderData {
  error?: string;
  playback?: PlaybackStateV2;
  providers: Providers;
  remote?: RemoteStatusV2;
  room?: RoomV2;
  playlistItems: PlaylistItem[];
}

interface ControllerRoomResults {
  playback: PlaybackStateV2 | null;
  providers: Providers | null;
  remote: RemoteStatusV2;
  room: RoomV2 | null;
  roomError: Error | null;
  playlistItems: PlaylistItem[] | null;
}

export function createControllerRoomData({
  playback,
  providers,
  remote,
  room,
  roomError,
  playlistItems,
}: ControllerRoomResults): ControllerLoaderData {
  if (roomError || !room) {
    return {
      error: 'The controlled machine is in a room that is no longer available.',
      providers: providers ?? [],
      remote,
      playlistItems: [],
    };
  }
  return {
    ...(playback ? { playback } : {}),
    providers: (providers ?? []).filter(
      (provider) =>
        room.settings.enabledSources.includes(provider) &&
        (room.roomType !== 'WATCH' || provider === 'youtube'),
    ),
    remote,
    room,
    playlistItems: playlistItems ?? [],
  };
}
