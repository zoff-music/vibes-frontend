import type { ApiClient } from '@vibes/api';
import { getHttpError, useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { PlaybackState, RemoteStatus, Room, Song } from '@vibes/models';
import { safeWrap, synchronizeServerClock } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLivePosition } from '@/hooks/use-live-position';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export interface ControllerRemote {
  action: (kind: 'play' | 'pause' | 'skip') => Promise<void>;
  changeRoom: () => Promise<void>;
  client: ApiClient;
  disconnect: () => Promise<void>;
  error: string;
  handleScan: (result: BarcodeScanningResult) => void;
  livePosition: number;
  nextRoomId: string;
  openScanner: () => Promise<void>;
  pair: () => Promise<void>;
  pairingCode: string;
  playback: PlaybackState | null;
  queuedSongs: Song[];
  refresh: () => Promise<void>;
  remote: RemoteStatus | null;
  remoteId: string;
  remove: (song: Song) => Promise<void>;
  room: Room | null;
  scannerVisible: boolean;
  seek: (positionMs: number) => Promise<void>;
  setNextRoomId: (roomId: string) => void;
  setPairingCode: (code: string) => void;
  setRemoteId: (remoteId: string) => void;
  setScannerVisible: (visible: boolean) => void;
  setSettingsVisible: (visible: boolean) => void;
  settingsVisible: boolean;
  vote: (song: Song) => Promise<void>;
}

export function useControllerRemote(): ControllerRemote {
  const { activateControllerRemote, clearControllerRemote, controllerRemote } =
    useApp();
  const [remoteId, setRemoteId] = useState(controllerRemote?.id ?? '');
  const [controllerToken, setControllerToken] = useState(
    controllerRemote?.controllerToken ?? '',
  );
  const [pairingCode, setPairingCode] = useState('');
  const [remote, setRemote] = useState<RemoteStatus | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [error, setError] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [nextRoomId, setNextRoomId] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const client = useMemo(
    () => createRemoteApi(remoteId, controllerToken),
    [controllerToken, remoteId],
  );
  const remoteRequests = useRemoteRequests(client);
  const roomRequests = useRoomRequests(client);
  const mobileRemoteRequests = useRemoteRequests(mobileApi);
  const livePosition = useLivePosition(
    remote?.playbackPositionMs ?? 0,
    remote?.playbackIsPlaying ?? false,
    playback?.currentSong?.duration ?? 0,
  );
  const queuedSongs = playback?.currentSong
    ? songs.filter((song) => song.id !== playback.currentSong?.id)
    : songs;

  const refresh = useCallback(async () => {
    if (!remoteId || !controllerToken) return;
    const [remoteError, nextRemote] =
      await remoteRequests.fetchRemote(remoteId);
    if (remoteError || !nextRemote) {
      const status = remoteError
        ? getHttpError(remoteError)?.response.status
        : null;
      if (status && invalidRemoteStatuses.includes(status)) {
        setRemoteId('');
        setControllerToken('');
        setRemote(null);
        setRoom(null);
        setSongs([]);
        setPlayback(null);
        await clearControllerRemote();
      }
      setError(
        await getRequestErrorMessage(remoteError, 'Remote is unavailable.'),
      );
      return;
    }
    setRemote(nextRemote);
    if (controllerRemote?.roomId !== nextRemote.currentRoomId) {
      await activateControllerRemote(
        remoteId,
        controllerToken,
        nextRemote.currentRoomId,
      );
    }
    if (!nextRemote.currentRoomId) {
      setRoom(null);
      setSongs([]);
      setPlayback(null);
      setError('');
      return;
    }
    const [roomError, snapshot] = await roomRequests.fetchSnapshot(
      nextRemote.currentRoomId,
    );
    if (roomError || !snapshot) {
      setError(
        await getRequestErrorMessage(
          roomError,
          'Controlled room is unavailable.',
        ),
      );
      return;
    }
    setRoom(snapshot.room);
    setSongs(snapshot.songs);
    synchronizeServerClock(snapshot.playback.serverTimeMs);
    setPlayback(snapshot.playback);
    setError('');
  }, [
    activateControllerRemote,
    clearControllerRemote,
    controllerRemote?.roomId,
    controllerToken,
    remoteId,
    remoteRequests,
    roomRequests,
  ]);

  useEffect(() => {
    if (!controllerRemote) return;
    setRemoteId(controllerRemote.id);
    setControllerToken(controllerRemote.controllerToken);
  }, [controllerRemote]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refresh]);

  const pair = async () => {
    const normalizedRemoteId = remoteId.trim();
    const normalizedPairingCode = pairingCode.trim();
    if (!normalizedRemoteId) {
      setError('Enter the remote ID.');
      return;
    }
    if (!normalizedPairingCode) {
      setError('Enter the pairing code.');
      return;
    }
    const [requestError, status] = await mobileRemoteRequests.pairRemote(
      normalizedRemoteId,
      { pairingCode: normalizedPairingCode },
    );
    if (requestError || !status) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not pair this remote. Check the remote ID and pairing code, then try again.',
        ),
      );
      return;
    }
    setRemote(status);
    setControllerToken(status.controllerToken);
    await activateControllerRemote(
      normalizedRemoteId,
      status.controllerToken,
      status.currentRoomId,
    );
    setError('');
  };

  const action = async (kind: 'play' | 'pause' | 'skip') => {
    if (!remote?.currentRoomId) return;
    if (kind === 'skip') {
      const [requestError] = await roomRequests.skip(remote.currentRoomId);
      if (requestError) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not skip playback.',
          ),
        );
        return;
      }
      await refresh();
      return;
    }
    const hasHostAuthority =
      room?.mode === 'host' && (room.isAdmin || room.hostId === room.userId);
    if (hasHostAuthority) {
      const [requestError] = await roomRequests.updatePlayback(
        remote.currentRoomId,
        kind,
      );
      if (requestError) {
        setError(
          await getRequestErrorMessage(
            requestError,
            `Could not ${kind} playback.`,
          ),
        );
        return;
      }
      await refresh();
      return;
    }
    const isPlaying = kind === 'play';
    const [requestError] = await remoteRequests.updateRemote(remoteId, {
      currentSongId: playback?.currentSong?.id ?? '',
      playbackIsPlaying: isPlaying,
      playbackPositionMs: livePosition,
    });
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          `Could not ${kind} playback.`,
        ),
      );
      return;
    }
    setRemote((current) => {
      if (!current) return current;
      return {
        ...current,
        playbackIsPlaying: isPlaying,
        playbackPositionMs: livePosition,
      };
    });
    setError('');
  };

  const vote = async (song: Song) => {
    if (!remote?.currentRoomId) return;
    const [requestError] = await roomRequests.vote(
      remote.currentRoomId,
      song.id,
    );
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not register vote.'),
      );
    }
    await refresh();
  };

  const remove = async (song: Song) => {
    if (!remote?.currentRoomId) return;
    const [requestError] = await roomRequests.removeSong(
      remote.currentRoomId,
      song.id,
    );
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not remove song.'),
      );
    }
    await refresh();
  };

  const seek = async (positionMs: number) => {
    if (!remote?.currentRoomId) return;
    const [requestError] = await roomRequests.updatePlayback(
      remote.currentRoomId,
      'seek',
      positionMs,
    );
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not seek playback.'),
      );
      return;
    }
    await refresh();
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const nextPermission = await requestPermission();
      if (!nextPermission.granted) {
        setError('Camera access is required to scan a remote QR code.');
        return;
      }
    }
    setScannerVisible(true);
  };

  const handleScan = ({ data }: BarcodeScanningResult) => {
    const [urlError, url] = safeWrap(() => new URL(data));
    if (urlError || !url) {
      setError('That QR code is not a valid Zoff remote pairing code.');
      return;
    }
    const scannedRemoteId = url.searchParams.get('remoteId') ?? '';
    const pairingToken = url.searchParams.get('pair') ?? '';
    if (!scannedRemoteId || !pairingToken) {
      setError('That QR code is missing its remote pairing details.');
      return;
    }
    setRemoteId(scannedRemoteId);
    setScannerVisible(false);
    const submitPairing = async () => {
      const [requestError, status] = await mobileRemoteRequests.pairRemote(
        scannedRemoteId,
        { pairingToken },
      );
      if (requestError || !status) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not pair this remote. Generate a new QR code and try again.',
          ),
        );
        return;
      }
      setRemote(status);
      setControllerToken(status.controllerToken);
      await activateControllerRemote(
        scannedRemoteId,
        status.controllerToken,
        status.currentRoomId,
      );
    };
    void submitPairing();
  };

  const changeRoom = async () => {
    const normalizedRoomId = nextRoomId.trim().toLowerCase();
    if (!normalizedRoomId) {
      setError('Enter the room name to control.');
      return;
    }
    const [requestError] = await remoteRequests.updateRemote(remoteId, {
      roomId: normalizedRoomId,
    });
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not change the controlled room.',
        ),
      );
      return;
    }
    setNextRoomId('');
    await refresh();
  };

  const disconnect = async () => {
    setRemote(null);
    setRemoteId('');
    setControllerToken('');
    setRoom(null);
    setSongs([]);
    setPlayback(null);
    await clearControllerRemote();
  };

  return {
    action,
    changeRoom,
    client,
    disconnect,
    error,
    handleScan,
    livePosition,
    nextRoomId,
    openScanner,
    pair,
    pairingCode,
    playback,
    queuedSongs,
    refresh,
    remote,
    remoteId,
    remove,
    room,
    scannerVisible,
    seek,
    setNextRoomId,
    setPairingCode,
    setRemoteId,
    setScannerVisible,
    setSettingsVisible,
    settingsVisible,
    vote,
  };
}

const invalidRemoteStatuses = [401, 403, 404, 410];
const refreshIntervalMs = 2_000;
