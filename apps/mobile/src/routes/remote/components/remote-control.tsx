import type { PlaylistItem, Providers } from '@vibes/models';
import { roomNameMaxLength } from '@vibes/models';
import { getRoomLabels } from '@vibes/ui/shared';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Copy,
  Empty,
  Field,
  Heading,
  IconButton,
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
  const currentPlaylistItem = playback?.currentPlaylistItem;
  if (!remote) return null;
  const displayedIsPlaying =
    room?.mode === 'host'
      ? Boolean(playback?.isPlaying)
      : remote.playbackIsPlaying;

  return (
    <Screen>
      <SafeAreaView edges={['top']} style={safeAreaStyle}>
        <View className="gap-3 p-4">
          <Card>
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 gap-2">
                <Copy muted>CONTROLLING MACHINE</Copy>
                <Heading>
                  {room?.name || remote.currentRoomId || 'No room'}
                </Heading>
                <Copy muted>{remote.online ? 'Online' : 'Offline'}</Copy>
                {room && (
                  <Copy muted>
                    {room.userCount ?? 0}{' '}
                    {getRoomLabels(room.roomType).participants}
                  </Copy>
                )}
              </View>
              <View className="flex-row gap-2">
                {room && remote.currentRoomId === room.id && (
                  <IconButton
                    accessibilityLabel={`${remote.partyMode ? 'Hide' : 'Show'} ${getRoomLabels(room.roomType).presentation}`}
                    disabled={!remote.online}
                    icon="cast"
                    onPress={() =>
                      void controllerActions.setPartyMode(!remote.partyMode)
                    }
                  />
                )}
                {room && (
                  <IconButton
                    accessibilityLabel="Room settings"
                    icon="settings"
                    onPress={() => controllerActions.setSettingsVisible(true)}
                  />
                )}
                <IconButton
                  accessibilityLabel="Disconnect remote"
                  icon="close"
                  onPress={() => void controllerActions.disconnect()}
                />
              </View>
            </View>
          </Card>
          {!room && (
            <Card>
              <Copy muted>CHOOSE ROOM</Copy>
              <View className="flex-row items-stretch gap-2">
                <View className="flex-1">
                  <Field
                    autoCapitalize="none"
                    value={controller.nextRoomId}
                    onChangeText={controllerActions.setNextRoomId}
                    onSubmitEditing={() => void controllerActions.changeRoom()}
                    placeholder="Room name"
                    maxLength={roomNameMaxLength}
                  />
                </View>
                <Button
                  disabled={!controller.nextRoomId.trim()}
                  label="Go"
                  onPress={() => void controllerActions.changeRoom()}
                />
              </View>
            </Card>
          )}
        </View>
        {room && (
          <>
            <Queue
              contained
              playlistItems={controller.queuedPlaylistItems}
              onVote={(playlistItem) =>
                void controllerActions.vote(playlistItem)
              }
              {...(room.isAdmin
                ? {
                    onDelete: (playlistItem: PlaylistItem) =>
                      void controllerActions.remove(playlistItem),
                  }
                : {})}
              header={
                <View className="gap-3 p-4">
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
                          maxLength={roomNameMaxLength}
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
                    <View className="flex-row items-center gap-3">
                      {currentPlaylistItem?.thumbnailUrl && (
                        <View className="size-20 overflow-hidden rounded-xl bg-black">
                          <Image
                            accessibilityLabel={`Thumbnail for ${currentPlaylistItem.title}`}
                            cachePolicy="memory-disk"
                            contentFit="cover"
                            recyclingKey={currentPlaylistItem.id}
                            source={currentPlaylistItem.thumbnailUrl}
                            style={thumbnailImageStyle}
                          />
                        </View>
                      )}
                      <View className="min-w-0 flex-1 gap-2">
                        <Text
                          numberOfLines={2}
                          className="font-heading text-base text-mobile-text dark:text-mobile-dark-text"
                        >
                          {playback?.currentPlaylistItem?.title ??
                            'Nothing playing'}
                        </Text>
                        <Copy muted>
                          {playback?.currentPlaylistItem?.publisher ?? ''}
                        </Copy>
                      </View>
                    </View>
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
                      {controller.canResetPosition && (
                        <IconButton
                          accessibilityLabel="Reset playback"
                          feedback
                          icon="reset"
                          onPress={() => void controllerActions.resetPosition()}
                        />
                      )}
                    </View>
                    <PlaybackProgress
                      duration={playback?.currentPlaylistItem?.duration ?? 0}
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
const thumbnailImageStyle = {
  height: '100%' as const,
  width: '100%' as const,
};
