import type { Providers, Song } from '@vibes/models';
import { Text, View } from 'react-native';
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
import { PlaybackProgress } from '@/components/playback-progress';
import { Queue } from '@/components/queue';
import { RoomSettingsSheet } from '@/components/room-settings-sheet';
import type {
  ControllerRemoteActions,
  ControllerRemoteState,
} from '@/hooks/use-controller-remote';

interface RemoteControlProps {
  controller: ControllerRemoteState;
  controllerActions: ControllerRemoteActions;
  providers: Providers;
}

export function RemoteControl({
  controller,
  controllerActions,
  providers,
}: RemoteControlProps) {
  const { playback, remote, room } = controller;
  if (!remote) return null;
  const displayedIsPlaying =
    room?.mode === 'host'
      ? Boolean(playback?.isPlaying)
      : remote.playbackIsPlaying;

  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        {room && (
          <>
            <Queue
              contained
              songs={controller.queuedSongs}
              onVote={(song) => void controllerActions.vote(song)}
              {...(room.isAdmin
                ? {
                    onDelete: (song: Song) =>
                      void controllerActions.remove(song),
                  }
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
                      onPress={() => controllerActions.setSettingsVisible(true)}
                    />
                    <Button
                      label="Disconnect remote"
                      tone="danger"
                      onPress={() => void controllerActions.disconnect()}
                    />
                  </Card>
                  <Card>
                    <Copy muted>CHANGE ROOM</Copy>
                    <View className="flex-row items-stretch gap-2">
                      <View className="flex-1">
                        <Field
                          autoCapitalize="none"
                          value={controller.nextRoomId}
                          onChangeText={controllerActions.setNextRoomId}
                          onSubmitEditing={() =>
                            void controllerActions.changeRoom()
                          }
                          placeholder="Room name"
                        />
                      </View>
                      <Button
                        disabled={!controller.nextRoomId.trim()}
                        label="Go"
                        onPress={() => void controllerActions.changeRoom()}
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
                          feedback
                          icon={displayedIsPlaying ? 'pause' : 'play'}
                          label={displayedIsPlaying ? 'Pause' : 'Play'}
                          onPress={() =>
                            void controllerActions.action(
                              displayedIsPlaying ? 'pause' : 'play',
                            )
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Button
                          feedback
                          icon="skip"
                          label="Skip"
                          tone="secondary"
                          onPress={() => void controllerActions.action('skip')}
                        />
                      </View>
                    </View>
                    <PlaybackProgress
                      duration={playback?.currentSong?.duration ?? 0}
                      onSeek={(position) =>
                        void controllerActions.seek(position)
                      }
                      position={controller.livePosition}
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
              controllerToken={controller.controllerToken}
              providers={providers}
              remoteId={controller.remoteId}
              room={room}
              visible={controller.settingsVisible}
              onClose={() => controllerActions.setSettingsVisible(false)}
              onUpdated={controllerActions.refresh}
            />
          </>
        )}
        {!room && <Empty>Choose a room for the controlled machine.</Empty>}
      </SafeAreaView>
    </Screen>
  );
}

const safeAreaStyle = { flex: 1 };
