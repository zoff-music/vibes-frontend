import type {
  PlaybackState,
  RemoteEvent,
  RemotePairing,
  RemoteStatus,
} from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { getClientReferenceTimeMs } from '@vibes/shared';
import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { MachineRemoteActionData } from '@/routes/remotes.machine/action';

interface UseMachineRemoteOptions {
  playbackRef: RefObject<PlaybackState | null>;
  roomId: string;
  setError: (message: string) => void;
}

interface MachineRemoteActions {
  applyMachineRemoteEvent: (event: RemoteEvent) => void;
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  refreshMachineRemote: () => Promise<void>;
}

interface MachineRemoteState {
  machinePairing: RemotePairing | null;
  machineRemote: RemoteStatus | null;
}

export function useMachineRemote({
  playbackRef,
  roomId,
  setError,
}: UseMachineRemoteOptions): readonly [
  MachineRemoteState,
  MachineRemoteActions,
] {
  const remoteLoader = useFetcher<RemoteStatus>({
    routeId: 'remotes.machine',
  });
  const remoteAction = useFetcher<MachineRemoteActionData>({
    routeId: 'remotes.machine',
  });
  const [machinePairing, setMachinePairing] = useState<RemotePairing | null>(
    null,
  );
  const [machineRemote, setMachineRemote] = useState<RemoteStatus | null>(null);

  const applyMachineRemoteEvent = useCallback((event: RemoteEvent) => {
    setMachineRemote((current) => {
      if (!current) return current;
      return {
        ...current,
        currentRoomId: event.roomId,
        currentSongId: event.currentSongId,
        online: event.online,
        paired: event.paired,
        playbackIsPlaying: event.playbackIsPlaying,
        playbackObservedAt: event.playbackObservedAt,
        playbackPositionMs: event.playbackPositionMs,
      };
    });
    if (event.paired) setMachinePairing(null);
  }, []);

  const refreshMachineRemote = useCallback(async () => {
    const result = await remoteLoader.load();
    if (!result.data) {
      setError(result.error || 'Could not load remote control status.');
      return;
    }
    const nextRemote = result.data;
    setMachineRemote(nextRemote);
    if (nextRemote.paired) setMachinePairing(null);
  }, [remoteLoader.load, setError]);

  const enableMachineRemote = useCallback(async () => {
    const playback = playbackRef.current;
    const result = await remoteAction.submit({
      intent: 'enable',
      request: {
        currentSongId: playback?.currentSong?.id ?? '',
        playbackIsPlaying: playback?.isPlaying ?? false,
        playbackPositionMs: getObservedPosition(playback),
        roomId,
      },
    });
    if (result.data?.intent !== 'enabled') {
      setError(result.error || 'Could not enable remote control.');
      return;
    }
    const { pairing } = result.data;
    setMachinePairing(pairing);
    setMachineRemote({
      currentRoomId: pairing.currentRoomId,
      currentSongId: pairing.currentSongId,
      enabled: true,
      id: pairing.id,
      online: true,
      paired: false,
      playbackIsPlaying: pairing.playbackIsPlaying,
      playbackObservedAt: pairing.playbackObservedAt,
      playbackPositionMs: pairing.playbackPositionMs,
    });
    setError('');
  }, [playbackRef, remoteAction.submit, roomId, setError]);

  const disableMachineRemote = useCallback(async () => {
    if (!machineRemote?.id) return;
    const result = await remoteAction.submit({
      intent: 'disable',
      remoteId: machineRemote.id,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setMachinePairing(null);
    setMachineRemote(null);
    setError('');
  }, [machineRemote?.id, remoteAction.submit, setError]);

  useEffect(() => {
    void refreshMachineRemote();
  }, [refreshMachineRemote]);

  return [
    { machinePairing, machineRemote },
    {
      applyMachineRemoteEvent,
      disableMachineRemote,
      enableMachineRemote,
      refreshMachineRemote,
    },
  ];
}

export function getObservedPosition(playback: PlaybackState | null) {
  if (!playback) return 0;
  if (!playback.isPlaying) return playback.positionMs;
  const referenceTimeMs = getClientReferenceTimeMs(playback.serverTimeMs);
  const elapsed = Math.max(Date.now() - referenceTimeMs, 0);
  const duration = (playback.currentSong?.duration ?? 0) * 1_000;
  return Math.min(playback.positionMs + elapsed, duration || Number.MAX_VALUE);
}
