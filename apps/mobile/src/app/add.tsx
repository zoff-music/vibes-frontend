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

  const hasGenerationPermission =
    Boolean(targetRoom) &&
    (!targetRoom?.hasPassword || Boolean(targetRoom.isAdmin));
  const songCountCutoff = (targetRoom?.roomGenerationMaxExistingSongs ?? 0) + 1;
  const isAboveSongLimit = targetSongCount >= songCountCutoff;
  const isAboveDailyLimit =
    (targetRoom?.generationCount ?? 0) >=
    (targetRoom?.roomGenerationMaxDailyCount ?? 0);
  let generationUnavailableReason = '';
  if (!targetRoom) {
    generationUnavailableReason =
      'Room details are still loading. Try again in a moment.';
  }
  if (targetRoom && !hasGenerationPermission) {
    generationUnavailableReason = 'Log in as room admin to fill this playlist.';
  }
  if (targetRoom && hasGenerationPermission && isAboveSongLimit) {
    generationUnavailableReason = `AI fill is unavailable when the room has ${songCountCutoff} songs or more.`;
  }
  if (
    targetRoom &&
    hasGenerationPermission &&
    !isAboveSongLimit &&
    targetRoom.isGenerating
  ) {
    generationUnavailableReason = 'A playlist is already being generated.';
  }
  if (
    targetRoom &&
    hasGenerationPermission &&
    !isAboveSongLimit &&
    !targetRoom.isGenerating &&
    isAboveDailyLimit
  ) {
    generationUnavailableReason = `This room has used its ${targetRoom.roomGenerationMaxDailyCount} playlist generations for the day.`;
  }
  const canGenerate = Boolean(targetRoom) && !generationUnavailableReason;
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
      generationUnavailableReason={generationUnavailableReason}
      providersOverride={targetRoom?.settings.enabledSources ?? []}
      roomIdOverride={roomId}
      visible={visible}
      onAdded={refreshSession}
      onClose={close}
      onGenerated={refreshSession}
    />
  );
}
