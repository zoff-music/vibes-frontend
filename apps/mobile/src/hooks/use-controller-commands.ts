import type { PlaybackState, RemoteStatus, Room, Song } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import type { ControllerRemoteActionData } from '@/routes/remotes.controller.$id/action';
import type { ControllerPlaybackActionData } from '@/routes/remotes.controller.$id.playback/action';
import type { ControllerQueueActionData } from '@/routes/remotes.controller.$id.queue/action';

interface ControllerCommandsOptions {
  controllerToken: string;
  livePosition: number;
  playback: PlaybackState | null;
  remote: RemoteStatus | null;
  remoteId: string;
  room: Room | null;
  setError: (message: string) => void;
  setRemote: Dispatch<SetStateAction<RemoteStatus | null>>;
}

export interface ControllerCommandActions {
  action: (kind: 'play' | 'pause' | 'skip') => Promise<void>;
  changeRoom: () => Promise<void>;
  remove: (song: Song) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setNextRoomId: (roomId: string) => void;
  vote: (song: Song) => Promise<void>;
}

export function useControllerCommands({
  controllerToken,
  livePosition,
  playback,
  remote,
  remoteId,
  room,
  setError,
  setRemote,
}: ControllerCommandsOptions): readonly [string, ControllerCommandActions] {
  const [nextRoomId, setNextRoomId] = useState('');
  const remoteAction = useFetcher<ControllerRemoteActionData>({
    params: { controllerToken, id: remoteId },
    routeId: 'remotes.controller.$id',
  });
  const playbackAction = useFetcher<ControllerPlaybackActionData>({
    params: { controllerToken, id: remoteId },
    routeId: 'remotes.controller.$id.playback',
  });
  const queueAction = useFetcher<ControllerQueueActionData>({
    params: { controllerToken, id: remoteId },
    routeId: 'remotes.controller.$id.queue',
  });

  const action = async (kind: 'play' | 'pause' | 'skip') => {
    if (!remote?.currentRoomId) return;
    if (kind === 'skip') {
      const result = await playbackAction.submit({
        intent: 'skip',
        roomId: remote.currentRoomId,
      });
      if (result.error) setError(result.error);
      return;
    }
    const hasHostAuthority =
      room?.mode === 'host' && (room.isAdmin || room.hostId === room.userId);
    if (hasHostAuthority) {
      const result = await playbackAction.submit({
        action: kind,
        intent: 'update',
        roomId: remote.currentRoomId,
      });
      if (result.error) setError(result.error);
      return;
    }
    const isPlaying = kind === 'play';
    const result = await remoteAction.submit({
      intent: 'remoteState',
      request: {
        currentSongId: playback?.currentSong?.id ?? '',
        playbackIsPlaying: isPlaying,
        playbackPositionMs: livePosition,
      },
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setRemote((current) =>
      current
        ? {
            ...current,
            playbackIsPlaying: isPlaying,
            playbackPositionMs: livePosition,
          }
        : current,
    );
    setError('');
  };

  const vote = async (song: Song) => {
    if (!remote?.currentRoomId) return;
    const result = await queueAction.submit({
      intent: 'vote',
      roomId: remote.currentRoomId,
      songId: song.id,
    });
    if (result.error) setError(result.error);
  };

  const remove = async (song: Song) => {
    if (!remote?.currentRoomId) return;
    const result = await queueAction.submit({
      intent: 'remove',
      roomId: remote.currentRoomId,
      songId: song.id,
    });
    if (result.error) setError(result.error);
  };

  const seek = async (positionMs: number) => {
    if (!remote?.currentRoomId) return;
    const result = await playbackAction.submit({
      action: 'seek',
      intent: 'update',
      positionMs,
      roomId: remote.currentRoomId,
    });
    if (result.error) setError(result.error);
  };

  const changeRoom = async () => {
    const normalizedRoomId = nextRoomId.trim().toLowerCase();
    if (!normalizedRoomId) {
      setError('Enter the room name to control.');
      return;
    }
    const result = await remoteAction.submit({
      intent: 'changeRoom',
      roomId: normalizedRoomId,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setNextRoomId('');
  };

  return [
    nextRoomId,
    { action, changeRoom, remove, seek, setNextRoomId, vote },
  ];
}
