import type {
  PlaybackState,
  Providers,
  RemoteStatus,
  Room,
  Song,
} from '@vibes/models';

export interface ControllerLoaderData {
  error?: string;
  playback?: PlaybackState;
  providers: Providers;
  remote?: RemoteStatus;
  room?: Room;
  songs: Song[];
}

interface ControllerRoomResults {
  playback: PlaybackState | null;
  providers: Providers | null;
  remote: RemoteStatus;
  room: Room | null;
  roomError: Error | null;
  songs: Song[] | null;
}

export function createControllerRoomData({
  playback,
  providers,
  remote,
  room,
  roomError,
  songs,
}: ControllerRoomResults): ControllerLoaderData {
  if (roomError || !room) {
    return {
      error: 'The controlled machine is in a room that is no longer available.',
      providers: providers ?? [],
      remote,
      songs: [],
    };
  }
  return {
    ...(playback ? { playback } : {}),
    providers: providers ?? [],
    remote,
    room,
    songs: songs ?? [],
  };
}
