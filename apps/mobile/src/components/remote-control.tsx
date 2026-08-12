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
import type { ControllerRemote } from '@/hooks/use-controller-remote';

interface RemoteControlProps {
  controller: ControllerRemote;
  providers: Providers;
}

export function RemoteControl({ controller, providers }: RemoteControlProps) {
  const { playback, remote, room } = controller;
  if (!remote) return null;
  const displayedIsPlaying =
    room?.mode === 'host'
      ? Boolean(playback?.isPlaying)
      : remote.playbackIsPlaying;

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        {room && (
          <>
            <Queue
              contained
              songs={controller.queuedSongs}
              onVote={(song) => void controller.vote(song)}
              {...(room.isAdmin
                ? { onDelete: (song: Song) => void controller.remove(song) }
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
                      onPress={() => controller.setSettingsVisible(true)}
                    />
                    <Button
                      label="Disconnect remote"
                      tone="danger"
                      onPress={() => void controller.disconnect()}
                    />
                  </Card>
                  <Card>
                    <Copy muted>CHANGE ROOM</Copy>
                    <View className="flex-row items-stretch gap-2">
                      <View className="flex-1">
                        <Field
                          autoCapitalize="none"
                          value={controller.nextRoomId}
                          onChangeText={controller.setNextRoomId}
                          onSubmitEditing={() => void controller.changeRoom()}
                          placeholder="Room name"
                        />
                      </View>
                      <Button
                        disabled={!controller.nextRoomId.trim()}
                        label="Go"
                        onPress={() => void controller.changeRoom()}
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
                            void controller.action(
                              displayedIsPlaying ? 'pause' : 'play',
                            )
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Button
                          icon="skip"
                          label="Skip"
                          tone="secondary"
                          onPress={() => void controller.action('skip')}
                        />
                      </View>
                    </View>
                    <PlaybackProgress
                      duration={playback?.currentSong?.duration ?? 0}
                      onSeek={(position) => void controller.seek(position)}
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
              client={controller.client}
              providers={providers}
              remoteId={controller.remoteId}
              room={room}
              visible={controller.settingsVisible}
              onClose={() => controller.setSettingsVisible(false)}
              onUpdated={controller.refresh}
            />
          </>
        )}
        {!room && <Empty>Choose a room for the controlled machine.</Empty>}
      </SafeAreaView>
    </Screen>
  );
}
