import type { RemoteRequests } from '@vibes/api';
import type {
  PlaybackState,
  RemoteEvent,
  RemotePairing,
  RemoteStatus,
} from '@vibes/models';
import { getClientReferenceTimeMs } from '@vibes/shared';
import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { getRequestErrorMessage } from '@/lib/api';

interface UseMachineRemoteOptions {
  playbackRef: RefObject<PlaybackState | null>;
  remoteRequests: RemoteRequests;
  roomId: string;
  setError: (message: string) => void;
}

interface MachineRemoteState {
  applyMachineRemoteEvent: (event: RemoteEvent) => void;
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  machinePairing: RemotePairing | null;
  machineRemote: RemoteStatus | null;
  refreshMachineRemote: () => Promise<void>;
}

export function useMachineRemote({
  playbackRef,
  remoteRequests,
  roomId,
  setError,
}: UseMachineRemoteOptions): MachineRemoteState {
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
    const [requestError, nextRemote] = await remoteRequests.fetchOwnedRemote();
    if (requestError || !nextRemote) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not load remote control status.',
        ),
      );
      return;
    }
    setMachineRemote(nextRemote);
    if (nextRemote.paired) setMachinePairing(null);
  }, [remoteRequests, setError]);

  const enableMachineRemote = useCallback(async () => {
    const playback = playbackRef.current;
    const [requestError, pairing] = await remoteRequests.createRemote({
      currentSongId: playback?.currentSong?.id ?? '',
      playbackIsPlaying: playback?.isPlaying ?? false,
      playbackPositionMs: getObservedPosition(playback),
      roomId,
    });
    if (requestError || !pairing) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not enable remote control.',
        ),
      );
      return;
    }
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
  }, [playbackRef, remoteRequests, roomId, setError]);

  const disableMachineRemote = useCallback(async () => {
    if (!machineRemote?.id) return;
    const [requestError] = await remoteRequests.deleteRemote(machineRemote.id);
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not disable remote control.',
        ),
      );
      return;
    }
    setMachinePairing(null);
    setMachineRemote(null);
    setError('');
  }, [machineRemote?.id, remoteRequests, setError]);

  useEffect(() => {
    void refreshMachineRemote();
  }, [refreshMachineRemote]);

  return {
    applyMachineRemoteEvent,
    disableMachineRemote,
    enableMachineRemote,
    machinePairing,
    machineRemote,
    refreshMachineRemote,
  };
}

export function getObservedPosition(playback: PlaybackState | null) {
  if (!playback) return 0;
  if (!playback.isPlaying) return playback.positionMs;
  const referenceTimeMs = getClientReferenceTimeMs(playback.serverTimeMs);
  const elapsed = Math.max(Date.now() - referenceTimeMs, 0);
  const duration = (playback.currentSong?.duration ?? 0) * 1_000;
  return Math.min(playback.positionMs + elapsed, duration || Number.MAX_VALUE);
}
