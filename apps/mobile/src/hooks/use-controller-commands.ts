import type {
  PlaybackStateV2,
  PlaylistItem,
  RemoteStatusV2,
  RoomV2,
} from '@vibes/models';
import { useMutation } from '@vibes/shared/use-request';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { updateController } from '@/requests/update-controller';
import { updateControllerPlayback } from '@/requests/update-controller-playback';
import { updateControllerQueue } from '@/requests/update-controller-queue';

interface ControllerCommandsOptions {
  controllerToken: string;
  livePosition: number;
  playback: PlaybackStateV2 | null;
  remote: RemoteStatusV2 | null;
  remoteId: string;
  room: RoomV2 | null;
  setError: (message: string) => void;
  setRemote: Dispatch<SetStateAction<RemoteStatusV2 | null>>;
}

export interface ControllerCommandActions {
  setPartyMode: (enabled: boolean) => Promise<void>;
  action: (kind: 'play' | 'pause' | 'skip') => Promise<void>;
  changeRoom: () => Promise<void>;
  remove: (playlistItem: PlaylistItem) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  resetPosition: () => Promise<void>;
  setNextRoomId: (roomId: string) => void;
  vote: (playlistItem: PlaylistItem) => Promise<void>;
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
  const [, remoteActionSubmit] = useMutation(updateController, {
    controllerToken,
    id: remoteId,
  });
  const [, playbackActionSubmit] = useMutation(updateControllerPlayback, {
    controllerToken,
    id: remoteId,
  });
  const [, queueActionSubmit] = useMutation(updateControllerQueue, {
    controllerToken,
    id: remoteId,
  });

  const action = async (kind: 'play' | 'pause' | 'skip') => {
    if (!remote?.currentRoomId) return;

    if (kind === 'skip') {
      const result = await playbackActionSubmit({
        intent: 'skip',
        roomId: remote.currentRoomId,
      });

      if (result.error) setError(result.error);

      return;
    }

    const hasHostAuthority =
      room?.mode === 'host' && (room.isAdmin || room.hostId === room.userId);

    if (hasHostAuthority) {
      const result = await playbackActionSubmit({
        action: kind,
        intent: 'update',
        roomId: remote.currentRoomId,
      });

      if (result.error) setError(result.error);

      return;
    }

    const isPlaying = kind === 'play';
    const result = await remoteActionSubmit({
      intent: 'remoteState',
      request: {
        currentPlaylistItemId: playback?.currentPlaylistItem?.id ?? '',
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
            playbackObservedAt: new Date().toISOString(),
            playbackPositionMs: livePosition,
          }
        : current,
    );
    setError('');
  };

  const vote = async (playlistItem: PlaylistItem) => {
    if (!remote?.currentRoomId) return;

    const result = await queueActionSubmit({
      intent: 'vote',
      roomId: remote.currentRoomId,
      playlistItemId: playlistItem.id,
    });

    if (result.error) setError(result.error);
  };

  const remove = async (playlistItem: PlaylistItem) => {
    if (!remote?.currentRoomId) return;

    const result = await queueActionSubmit({
      intent: 'remove',
      roomId: remote.currentRoomId,
      playlistItemId: playlistItem.id,
    });

    if (result.error) setError(result.error);
  };

  const seek = async (positionMs: number) => {
    if (!remote?.currentRoomId) return;

    const result = await playbackActionSubmit({
      action: 'seek',
      intent: 'update',
      positionMs,
      roomId: remote.currentRoomId,
    });

    if (result.error) setError(result.error);
  };

  const resetPosition = async () => {
    if (!remote?.currentRoomId || !playback?.currentPlaylistItem) return;

    if (room?.mode === 'host' && room.hostId === room.userId) return;

    const result = await remoteActionSubmit({
      intent: 'resetPosition',
      roomId: remote.currentRoomId,
    });

    if (result.error) {
      setError(result.error);

      return;
    }

    setError('');
  };

  const changeRoom = async () => {
    const normalizedRoomId = nextRoomId.trim().toLowerCase();

    if (!normalizedRoomId) {
      setError('Enter the room name to control.');

      return;
    }

    const result = await remoteActionSubmit({
      intent: 'changeRoom',
      roomId: normalizedRoomId,
    });

    if (result.error) {
      setError(result.error);

      return;
    }

    setNextRoomId('');
  };

  const setPartyMode = async (enabled: boolean) => {
    if (!room || remote?.currentRoomId !== room.id) return;

    const result = await remoteActionSubmit({
      intent: 'partyMode',
      roomId: room.id,
      enabled,
    });

    if (result.error) {
      setError(result.error);

      return;
    }

    setError('');
  };

  return [
    nextRoomId,
    {
      action,
      changeRoom,
      remove,
      resetPosition,
      seek,
      setNextRoomId,
      setPartyMode,
      vote,
    },
  ];
}
