import { useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { PlaybackState, RemoteStatus, Room, Song } from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Copy,
  Empty,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { PixelIcon } from '@/components/pixel-icon';
import { PlaybackProgress } from '@/components/playback-progress';
import { Queue } from '@/components/queue';
import { RoomSettingsSheet } from '@/components/room-settings-sheet';
import { SearchSheet } from '@/components/search-sheet';
import { useLivePosition } from '@/hooks/use-live-position';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

const remoteStorageKey = 'zoff.mobile.remote';

export default function RemoteScreen() {
  const { providers } = useApp();
  const [remoteId, setRemoteId] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [remote, setRemote] = useState<RemoteStatus | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [error, setError] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [nextRoomId, setNextRoomId] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const client = useMemo(() => createRemoteApi(remoteId), [remoteId]);
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
    if (!remoteId) return;
    const [remoteError, nextRemote] =
      await remoteRequests.fetchRemote(remoteId);
    if (remoteError || !nextRemote) {
      setError(
        await getRequestErrorMessage(remoteError, 'Remote is unavailable.'),
      );
      return;
    }
    setRemote(nextRemote);
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
  }, [remoteId, remoteRequests, roomRequests]);

  useEffect(() => {
    const restore = async () => {
      const stored = await SecureStore.getItemAsync(remoteStorageKey);
      if (stored) setRemoteId(stored);
    };
    void restore();
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 2_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const pair = async () => {
    const [requestError, status] = await mobileRemoteRequests.pairRemote(
      remoteId.trim(),
      { pairingCode: pairingCode.trim() },
    );
    if (requestError || !status) {
      setError(await getRequestErrorMessage(requestError, 'Pairing failed.'));
      return;
    }
    setRemote(status);
    await SecureStore.setItemAsync(remoteStorageKey, remoteId.trim());
    setError('');
  };

  const action = async (kind: 'play' | 'pause' | 'skip') => {
    if (!remote?.currentRoomId) return;
    const [requestError] =
      kind === 'skip'
        ? await roomRequests.skip(remote.currentRoomId)
        : await roomRequests.updatePlayback(remote.currentRoomId, kind);
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          `Could not ${kind} playback.`,
        ),
      );
    }
    await refresh();
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
    if (urlError || !url) return;
    const scannedRemoteId = url.searchParams.get('remoteId') ?? '';
    const pairingToken = url.searchParams.get('pair') ?? '';
    if (!scannedRemoteId || !pairingToken) return;
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
        setError(await getRequestErrorMessage(requestError, 'Pairing failed.'));
        return;
      }
      setRemote(status);
      await SecureStore.setItemAsync(remoteStorageKey, scannedRemoteId);
    };
    void submitPairing();
  };

  const changeRoom = async () => {
    const [requestError] = await remoteRequests.updateRemote(remoteId, {
      roomId: nextRoomId.trim().toLowerCase(),
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

  if (!remote) {
    return (
      <Screen>
        <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1 }}>
          <ScrollView
            contentContainerClassName="flex-grow justify-center gap-5 p-4 pb-28"
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center gap-2 px-6">
              <View className="mb-2 size-16 items-center justify-center rounded-3xl border border-accent/40 bg-accent/10">
                <PixelIcon color="#00b4d4" name="remote" size={30} />
              </View>
              <Heading>Pair a remote</Heading>
              <Text className="text-center font-mono text-mobile-muted text-sm dark:text-mobile-dark-muted">
                Control another Zoff screen without becoming another listener.
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
                autoCapitalize="none"
                value={remoteId}
                onChangeText={setRemoteId}
                placeholder="Remote ID"
              />
              <Field
                autoCapitalize="none"
                value={pairingCode}
                onChangeText={setPairingCode}
                onSubmitEditing={() => void pair()}
                placeholder="Pairing code"
              />
              <Button label="Pair remote" onPress={() => void pair()} />
              {Boolean(error) && (
                <Text className="font-mono text-error text-xs">{error}</Text>
              )}
            </Card>
          </ScrollView>
          <Modal visible={scannerVisible} animationType="slide">
            <CameraView
              className="flex-1"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleScan}
            />
            <View className="absolute right-4 bottom-6 left-4">
              <Button
                label="Close scanner"
                onPress={() => setScannerVisible(false)}
              />
            </View>
          </Modal>
        </SafeAreaView>
      </Screen>
    );
  }
  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1 }}>
        {room && (
          <>
            <Queue
              songs={queuedSongs}
              onDelete={room.isAdmin ? (song) => void remove(song) : undefined}
              onVote={(song) => void vote(song)}
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
                          icon={playback?.isPlaying ? 'pause' : 'play'}
                          label={playback?.isPlaying ? 'Pause' : 'Play'}
                          onPress={() =>
                            void action(playback?.isPlaying ? 'pause' : 'play')
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
                      <View className="flex-1">
                        <Button
                          icon="add"
                          label="Add"
                          onPress={() => setSearchVisible(true)}
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
            <SearchSheet
              client={client}
              roomIdOverride={remote.currentRoomId}
              visible={searchVisible}
              onAdded={refresh}
              onClose={() => setSearchVisible(false)}
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
