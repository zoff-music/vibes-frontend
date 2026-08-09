import { useRemoteRequests, useRoomRequests } from '@vibes/api';
import type {
  PlaybackState,
  RemotePairing,
  RemoteStatus,
  Room,
  Song,
} from '@vibes/models';
import { safeWrap } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import zoffLogo from '@/assets/images/icon.png';
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
import { SearchSheet } from '@/components/search-sheet';
import { ZoffIcon } from '@/components/zoff-icon';
import { useLivePosition } from '@/hooks/use-live-position';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

const remoteStorageKey = 'zoff.mobile.remote';
const remoteTokenStorageKey = 'zoff.mobile.remote-token';

export default function RemoteScreen() {
  const {
    disableMachineRemote,
    enableMachineRemote,
    error: appError,
    machinePairing,
    machineRemote,
    providers,
  } = useApp();
  const [remoteRole, setRemoteRole] = useState<RemoteRole>('controller');
  const [remoteId, setRemoteId] = useState('');
  const [controllerToken, setControllerToken] = useState('');
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
  }, [controllerToken, remoteId, remoteRequests, roomRequests]);

  useEffect(() => {
    const restore = async () => {
      const stored = await SecureStore.getItemAsync(remoteStorageKey);
      const storedToken = await SecureStore.getItemAsync(remoteTokenStorageKey);
      if (stored) setRemoteId(stored);
      if (storedToken) setControllerToken(storedToken);
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
    setControllerToken(status.controllerToken);
    await SecureStore.setItemAsync(remoteStorageKey, remoteId.trim());
    await SecureStore.setItemAsync(
      remoteTokenStorageKey,
      status.controllerToken,
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
      setControllerToken(status.controllerToken);
      await SecureStore.setItemAsync(remoteStorageKey, scannedRemoteId);
      await SecureStore.setItemAsync(
        remoteTokenStorageKey,
        status.controllerToken,
      );
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

  if (remoteRole === 'machine') {
    return (
      <MachineRemoteView
        pairing={machinePairing}
        remote={machineRemote}
        error={appError}
        onDisable={() => void disableMachineRemote()}
        onEnable={() => void enableMachineRemote()}
        onRoleChange={setRemoteRole}
      />
    );
  }

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
                <RemoteRoleControl
                  value={remoteRole}
                  onChange={setRemoteRole}
                />
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
                    <Text className="font-heading text-error text-xs">
                      {error}
                    </Text>
                  )}
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
              onDelete={room.isAdmin ? (song) => void remove(song) : undefined}
              onVote={(song) => void vote(song)}
              header={
                <View className="gap-3 p-4">
                  <RemoteRoleControl
                    value={remoteRole}
                    onChange={setRemoteRole}
                  />
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

interface MachineRemoteViewProps {
  error: string;
  onDisable: () => void;
  onEnable: () => void;
  onRoleChange: (role: RemoteRole) => void;
  pairing: RemotePairing | null;
  remote: RemoteStatus | null;
}

function MachineRemoteView({
  onDisable,
  onEnable,
  onRoleChange,
  pairing,
  remote,
  error,
}: MachineRemoteViewProps) {
  const pairingUrl = pairing
    ? `https://zoff.me/remotes?remoteId=${encodeURIComponent(pairing.id)}&pair=${encodeURIComponent(pairing.pairingToken)}`
    : '';
  let statusTitle = 'Allow Remote Control';
  let statusCopy =
    'Create a single-use pairing so another device can control this app.';
  if (remote?.enabled && remote.paired) {
    statusTitle = 'Remote Paired';
    statusCopy =
      'A controller is connected. Disable remote control to revoke it immediately.';
  }
  if (remote?.enabled && !remote.paired) {
    statusTitle = 'Remote Control Enabled';
    statusCopy =
      'Create a new single-use pairing when you are ready to connect.';
  }

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="flex-grow gap-5 p-4 pb-28"
          keyboardShouldPersistTaps="handled"
        >
          <ContentColumn>
            <View className="gap-5">
              <RemoteRoleControl value="machine" onChange={onRoleChange} />
              <View className="items-center gap-2 px-6">
                <View className="mb-2 size-16 items-center justify-center rounded-3xl border border-accent/40 bg-accent/10">
                  <ZoffIcon color="#00b4d4" name="remote" size={30} />
                </View>
                <Heading>{statusTitle}</Heading>
                <Text className="text-center font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                  {statusCopy}
                </Text>
              </View>
              {Boolean(pairing) && (
                <Card>
                  <Copy muted>SCAN TO CONNECT</Copy>
                  <View className="items-center">
                    <View className="rounded-3xl bg-white p-3">
                      <QRCode
                        backgroundColor="#ffffff"
                        color="#2a1840"
                        logo={zoffLogo}
                        logoBackgroundColor="#ffffff"
                        logoBorderRadius={10}
                        logoMargin={4}
                        logoSize={42}
                        quietZone={10}
                        size={230}
                        value={pairingUrl}
                      />
                    </View>
                  </View>
                  <View className="gap-2 rounded-xl border border-mobile-border bg-mobile-surface p-4 dark:border-mobile-dark-border dark:bg-mobile-dark-surface">
                    <Copy muted>REMOTE ID</Copy>
                    <Copy>{pairing?.id ?? ''}</Copy>
                    <Copy muted>PAIRING CODE</Copy>
                    <Text className="text-center font-heading text-2xl text-accent tracking-widest">
                      {pairing?.pairingCode ?? ''}
                    </Text>
                  </View>
                  <Copy muted>
                    This pairing expires shortly and can only be used once.
                  </Copy>
                </Card>
              )}
              {remote?.enabled && !pairing && (
                <Card>
                  <Copy muted>REMOTE STATUS</Copy>
                  <Text className="font-heading text-mobile-text text-xl dark:text-mobile-dark-text">
                    {remote.paired ? 'Connected' : 'Waiting for a new pairing'}
                  </Text>
                  <Copy muted>
                    {remote.online ? 'This device is online.' : 'Reconnecting…'}
                  </Copy>
                </Card>
              )}
              <View className="gap-3">
                <Button
                  icon="remote"
                  label={remote?.enabled ? 'New pairing' : 'Enable remote'}
                  onPress={onEnable}
                />
                {remote?.enabled && (
                  <Button
                    label="Disable remote"
                    tone="danger"
                    onPress={onDisable}
                  />
                )}
              </View>
              {Boolean(error) && (
                <Text className="font-heading text-error text-xs">{error}</Text>
              )}
            </View>
          </ContentColumn>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

interface RemoteRoleControlProps {
  onChange: (role: RemoteRole) => void;
  value: RemoteRole;
}

function RemoteRoleControl({ onChange, value }: RemoteRoleControlProps) {
  return (
    <View className="flex-row rounded-2xl border border-mobile-border bg-mobile-card p-1 dark:border-mobile-dark-border dark:bg-mobile-dark-card">
      <RemoteRoleButton
        active={value === 'controller'}
        label="Control another"
        onPress={() => onChange('controller')}
      />
      <RemoteRoleButton
        active={value === 'machine'}
        label="Control this device"
        onPress={() => onChange('machine')}
      />
    </View>
  );
}

interface RemoteRoleButtonProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

function RemoteRoleButton({ active, label, onPress }: RemoteRoleButtonProps) {
  return (
    <View className="flex-1">
      <Button
        label={label}
        tone={active ? 'primary' : 'secondary'}
        onPress={onPress}
      />
    </View>
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

type RemoteRole = 'controller' | 'machine';
