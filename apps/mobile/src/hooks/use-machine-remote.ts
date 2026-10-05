import type {
  PlaybackStateV2,
  RemoteEventV2,
  RemotePairingV2,
  RemoteStatusV2,
} from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { getClientReferenceTimeMs } from '@vibes/shared';
import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { MachineRemoteActionData } from '@/routes/remotes.machine/action';

interface UseMachineRemoteOptions {
  playbackRef: RefObject<PlaybackStateV2 | null>;
  roomId: string;
  setError: (message: string) => void;
}

interface MachineRemoteActions {
  applyMachineRemoteEvent: (event: RemoteEventV2) => void;
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  refreshMachineRemote: () => Promise<void>;
}

interface MachineRemoteState {
  machinePairing: RemotePairingV2 | null;
  machineRemote: RemoteStatusV2 | null;
}

export function useMachineRemote({
  playbackRef,
  roomId,
  setError,
}: UseMachineRemoteOptions): readonly [
  MachineRemoteState,
  MachineRemoteActions,
] {
  const [, remoteLoader] = useFetcher<RemoteStatusV2>({
    routeId: 'remotes.machine',
  });
  const [, remoteAction] = useFetcher<MachineRemoteActionData>({
    routeId: 'remotes.machine',
  });
  const [machinePairing, setMachinePairing] = useState<RemotePairingV2 | null>(
    null,
  );
  const [machineRemote, setMachineRemote] = useState<RemoteStatusV2 | null>(
    null,
  );

  const applyMachineRemoteEvent = useCallback((event: RemoteEventV2) => {
    setMachineRemote((current) => {
      if (!current) return current;
      return {
        ...current,
        currentRoomId: event.roomId,
        currentPlaylistItemId: event.currentPlaylistItemId,
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
        currentPlaylistItemId: playback?.currentPlaylistItem?.id ?? '',
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
      currentPlaylistItemId: pairing.currentPlaylistItemId,
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

export function getObservedPosition(playback: PlaybackStateV2 | null) {
  if (!playback) return 0;
  if (!playback.isPlaying) return playback.positionMs;
  const referenceTimeMs = getClientReferenceTimeMs(playback.serverTimeMs);
  const elapsed = Math.max(Date.now() - referenceTimeMs, 0);
  const duration = (playback.currentPlaylistItem?.duration ?? 0) * 1_000;
  return Math.min(playback.positionMs + elapsed, duration || Number.MAX_VALUE);
}
