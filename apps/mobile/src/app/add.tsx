import { useRoomRequests } from '@vibes/api';
import type { Room } from '@vibes/models';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Empty, Screen } from '@/components/native';
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
  const [visible, setVisible] = useState(false);
  const [targetRoom, setTargetRoom] = useState<Room | null>(room);
  const [targetSongCount, setTargetSongCount] = useState(songs.length);

  useFocusEffect(
    useCallback(() => {
      setVisible(true);
      return () => setVisible(false);
    }, []),
  );

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
  const close = () => {
    setVisible(false);
    router.replace(controllerRemote ? '/remote' : '/');
  };
  const refreshSession = async () => {
    if (!controllerRemote) {
      await refresh();
    }
  };

  return (
    <SearchSheet
      canGenerate={canGenerate}
      client={client}
      providersOverride={targetRoom?.settings.enabledSources ?? []}
      roomIdOverride={roomId}
      visible={visible}
      onAdded={refreshSession}
      onClose={close}
      onGenerated={refreshSession}
    />
  );
}
