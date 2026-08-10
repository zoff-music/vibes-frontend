import { getHttpError, useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { PlaybackState, RemoteStatus, Room, Song } from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  ContentColumn,
  Copy,
  Empty,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { PlaybackProgress } from '@/components/playback-progress';
import { Queue } from '@/components/queue';
import { RoomSettingsSheet } from '@/components/room-settings-sheet';
import { Toast, ToastViewport } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useLivePosition } from '@/hooks/use-live-position';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function RemoteScreen() {
  const {
    activateControllerRemote,
    clearControllerRemote,
    controllerRemote,
    providers,
  } = useApp();
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
    const interval = setInterval(() => void refresh(), 2_000);
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
        {
          pairingToken,
        },
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

  if (!remote) {
    return (
      <Screen>
        <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1 }}>
          <ScrollView
            contentContainerClassName="flex-grow justify-center gap-5 p-4 pb-28"
            keyboardShouldPersistTaps="handled"
          >
            <ContentColumn>
              <View className="gap-5">
                <View className="items-center gap-2 px-6">
                  <View className="mb-2 size-16 items-center justify-center rounded-3xl border border-accent/40 bg-accent/10">
                    <ZoffIcon color="#00b4d4" name="remote" size={30} />
                  </View>
                  <Heading>Pair a remote</Heading>
                  <Text className="text-center font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                    Control another Zoff screen without becoming another
                    listener.
                  </Text>
                </View>
                <Card>
                  <Copy muted>PAIR THIS PHONE</Copy>
                  <Button
                    icon="scan"
                    label="Scan remote QR code"
                    tone="secondary"
                    onPress={() => void openScanner()}
                  />
                  <View className="flex-row items-center gap-3">
                    <View className="h-px flex-1 bg-mobile-border dark:bg-mobile-dark-border" />
                    <Copy muted>OR ENTER A CODE</Copy>
                    <View className="h-px flex-1 bg-mobile-border dark:bg-mobile-dark-border" />
                  </View>
                  <Field
                    accessibilityLabel="Remote ID"
                    autoCapitalize="none"
                    value={remoteId}
                    onChangeText={setRemoteId}
                    placeholder="Remote ID"
                    testID="remote-id"
                  />
                  <Field
                    accessibilityLabel="Pairing code"
                    autoCapitalize="none"
                    value={pairingCode}
                    onChangeText={setPairingCode}
                    onSubmitEditing={() => void pair()}
                    placeholder="Pairing code"
                    testID="remote-pairing-code"
                  />
                  <Button label="Pair remote" onPress={() => void pair()} />
                  <Toast message={error} />
                </Card>
              </View>
            </ContentColumn>
          </ScrollView>
          <Modal
            visible={scannerVisible}
            animationType="slide"
            presentationStyle="fullScreen"
          >
            <View style={styles.scanner}>
              <CameraView
                active={scannerVisible}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                facing="back"
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={handleScan}
              />
              <SafeAreaView style={styles.scannerOverlay}>
                <View className="items-center gap-3 px-6 pt-8">
                  <Heading>Scan remote QR code</Heading>
                  <Copy muted>Point the camera at the pairing code.</Copy>
                </View>
                <View style={styles.scanFrame} />
                <View className="px-4 pb-4">
                  <Button
                    label="Close scanner"
                    tone="secondary"
                    onPress={() => setScannerVisible(false)}
                  />
                </View>
              </SafeAreaView>
              <ToastViewport />
            </View>
          </Modal>
        </SafeAreaView>
      </Screen>
    );
  }
  const displayedIsPlaying =
    room?.mode === 'host'
      ? Boolean(playback?.isPlaying)
      : remote.playbackIsPlaying;
  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1 }}>
        {room && (
          <>
            <Queue
              contained
              songs={queuedSongs}
              onVote={(song) => void vote(song)}
              {...(room.isAdmin
                ? { onDelete: (song: Song) => void remove(song) }
                : {})}
              header={
                <View className="gap-3 p-4">
                  <Card>
                    <Copy muted>CONTROLLING MACHINE</Copy>
                    <Heading>
                      {room.name || remote.currentRoomId || 'No room'}
                    </Heading>
                    <Copy muted>
                      {remote.online ? 'Online' : 'Offline'} ·{' '}
                      {room.userCount ?? 0} listeners
                    </Copy>
                    <Button
                      icon="settings"
                      label="Room settings"
                      tone="secondary"
                      onPress={() => setSettingsVisible(true)}
                    />
                    <Button
                      label="Disconnect remote"
                      tone="danger"
                      onPress={() => void disconnect()}
                    />
                  </Card>
                  <Card>
                    <Copy muted>CHANGE ROOM</Copy>
                    <View className="flex-row items-stretch gap-2">
                      <View className="flex-1">
                        <Field
                          autoCapitalize="none"
                          value={nextRoomId}
                          onChangeText={setNextRoomId}
                          onSubmitEditing={() => void changeRoom()}
                          placeholder="Room name"
                        />
                      </View>
                      <Button
                        disabled={!nextRoomId.trim()}
                        label="Go"
                        onPress={() => void changeRoom()}
                      />
                    </View>
                  </Card>
                  <Card>
                    <Copy muted>NOW PLAYING</Copy>
                    <Text
                      numberOfLines={1}
                      className="font-heading text-base text-mobile-text dark:text-mobile-dark-text"
                    >
                      {playback?.currentSong?.title ?? 'Nothing playing'}
                    </Text>
                    <Copy muted>{playback?.currentSong?.artist ?? ''}</Copy>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Button
                          icon={displayedIsPlaying ? 'pause' : 'play'}
                          label={displayedIsPlaying ? 'Pause' : 'Play'}
                          onPress={() =>
                            void action(displayedIsPlaying ? 'pause' : 'play')
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Button
                          icon="skip"
                          label="Skip"
                          tone="secondary"
                          onPress={() => void action('skip')}
                        />
                      </View>
                    </View>
                    <PlaybackProgress
                      duration={playback?.currentSong?.duration ?? 0}
                      onSeek={(position) => void seek(position)}
                      position={livePosition}
                      seekable={
                        room.mode === 'host' &&
                        (room.hostId === room.userId || room.isAdmin)
                      }
                    />
                  </Card>
                </View>
              }
            />
            <RoomSettingsSheet
              client={client}
              providers={providers}
              remoteId={remoteId}
              room={room}
              visible={settingsVisible}
              onClose={() => setSettingsVisible(false)}
              onUpdated={refresh}
            />
          </>
        )}
        {!room && <Empty>Choose a room for the controlled machine.</Empty>}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scanner: {
    flex: 1,
    backgroundColor: '#08050f',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scanFrame: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: '#00b4d4',
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
});

const invalidRemoteStatuses = [401, 403, 404, 410];
