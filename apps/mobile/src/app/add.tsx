import { useRoomRequests } from '@vibes/api';
import type { Room } from '@vibes/models';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GenerationSheet } from '@/components/generation-sheet';
import {
  Button,
  Card,
  ContentColumn,
  Copy,
  Empty,
  Heading,
  IconButton,
  Screen,
} from '@/components/native';
import { SearchSheet } from '@/components/search-sheet';
import { createRemoteApi, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function AddSongScreen() {
  const { controllerRemote, refresh, room, songs } = useApp();
  const router = useRouter();
  const remoteClient = useMemo(
    () =>
      createRemoteApi(
        controllerRemote?.id ?? '',
        controllerRemote?.controllerToken ?? '',
      ),
    [controllerRemote?.controllerToken, controllerRemote?.id],
  );
  const client = controllerRemote ? remoteClient : mobileApi;
  const roomRequests = useRoomRequests(client);
  const roomId = controllerRemote?.roomId ?? room?.id ?? '';
  const [action, setAction] = useState<AddAction>(null);
  const [targetRoom, setTargetRoom] = useState<Room | null>(room);
  const [targetSongCount, setTargetSongCount] = useState(songs.length);

  useEffect(() => {
    if (!controllerRemote?.roomId) {
      setTargetRoom(room);
      setTargetSongCount(songs.length);
      return;
    }
    const loadRoom = async () => {
      const [requestError, snapshot] = await roomRequests.fetchSnapshot(
        controllerRemote.roomId,
      );
      if (requestError || !snapshot) return;
      setTargetRoom(snapshot.room);
      setTargetSongCount(snapshot.songs.length);
    };
    void loadRoom();
  }, [controllerRemote?.roomId, room, roomRequests, songs.length]);

  if (!roomId) {
    return (
      <Screen>
        <Empty>Join a room before adding music.</Empty>
      </Screen>
    );
  }

  const canGenerate =
    Boolean(targetRoom?.isAdmin) &&
    !targetRoom?.isGenerating &&
    targetSongCount < (targetRoom?.roomGenerationMaxExistingSongs ?? 0) &&
    (targetRoom?.generationCount ?? 0) <
      (targetRoom?.roomGenerationMaxDailyCount ?? 0);
  const close = () => router.replace(controllerRemote ? '/remote' : '/');
  const refreshSession = async () => {
    if (!controllerRemote) {
      await refresh();
    }
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1 p-4" edges={['top', 'bottom']}>
        <ContentColumn>
          <View className="gap-5">
            <View className="flex-row items-center justify-between gap-4">
              <IconButton
                accessibilityLabel="Close add music"
                icon="close"
                onPress={close}
              />
              <View className="min-w-0 flex-1 gap-1">
                <Heading>Add music</Heading>
                <Copy muted>
                  Choose how to add music to {targetRoom?.name}.
                </Copy>
              </View>
            </View>
            <Card>
              <Button
                icon="add"
                label="Search or paste a link"
                onPress={() => setAction('search')}
              />
              <Button
                disabled={!canGenerate}
                icon="sparkles"
                label="Fill playlist with AI"
                tone="secondary"
                onPress={() => setAction('generate')}
              />
              {!canGenerate && (
                <Text className="font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted">
                  AI fill requires room admin access and an eligible playlist.
                </Text>
              )}
            </Card>
          </View>
        </ContentColumn>
      </SafeAreaView>
      <SearchSheet
        client={client}
        providersOverride={targetRoom?.settings.enabledSources ?? []}
        roomIdOverride={roomId}
        visible={action === 'search'}
        onAdded={refreshSession}
        onClose={() => setAction(null)}
      />
      <GenerationSheet
        client={client}
        roomId={roomId}
        visible={action === 'generate'}
        onClose={() => setAction(null)}
        onGenerated={refreshSession}
      />
    </Screen>
  );
}

type AddAction = 'generate' | 'search' | null;
