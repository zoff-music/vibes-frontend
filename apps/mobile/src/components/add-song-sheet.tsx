import { useRoomPlaybackRequests, useRoomReadRequests } from '@vibes/api';
import type { Room } from '@vibes/models';
import { useEffect, useMemo, useState } from 'react';

import { SearchSheet } from '@/components/search-sheet';
import { createRemoteApi, mobileApi } from '@/lib/api';
import { fetchRoomSnapshot } from '@/lib/room-snapshot';
import { useApp } from '@/providers/app-provider';

interface AddSongSheetProps {
  onClose: () => void;
  visible: boolean;
}

export function AddSongSheet({ onClose, visible }: AddSongSheetProps) {
  const { controllerRemote, refresh, room, songs } = useApp();
  const remoteClient = useMemo(
    () =>
      createRemoteApi(
        controllerRemote?.id ?? '',
        controllerRemote?.controllerToken ?? '',
      ),
    [controllerRemote?.controllerToken, controllerRemote?.id],
  );
  const client = controllerRemote ? remoteClient : mobileApi;
  const playbackRequests = useRoomPlaybackRequests(client);
  const readRequests = useRoomReadRequests(client);
  const roomId = controllerRemote?.roomId ?? room?.id ?? '';
  const [targetRoom, setTargetRoom] = useState<Room | null>(room);
  const [targetSongCount, setTargetSongCount] = useState(songs.length);

  useEffect(() => {
    if (!controllerRemote?.roomId) {
      setTargetRoom(room);
      setTargetSongCount(songs.length);
      return;
    }
    const loadRoom = async () => {
      const [requestError, snapshot] = await fetchRoomSnapshot(
        controllerRemote.roomId,
        readRequests,
        playbackRequests,
      );
      if (requestError || !snapshot) return;
      setTargetRoom(snapshot.room);
      setTargetSongCount(snapshot.songs.length);
    };
    void loadRoom();
  }, [
    controllerRemote?.roomId,
    playbackRequests,
    readRequests,
    room,
    songs.length,
  ]);

  if (!roomId) return null;

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
  const refreshSession = async () => {
    if (!controllerRemote) await refresh();
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
      onClose={onClose}
      onGenerated={refreshSession}
    />
  );
}
