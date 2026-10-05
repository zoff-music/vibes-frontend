import type { RoomV2 } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { useEffect, useState } from 'react';
import { Modal } from 'react-native';

import { SearchSheet } from '@/components/search-sheet';
import { useRoomActions, useRoomSession } from '@/providers/app-provider';
import type { ControllerRemoteData } from '@/routes/remotes.controller.$id/loader';

interface AddPlaylistItemSheetProps {
  onClose: () => void;
  visible: boolean;
}

export function AddPlaylistItemSheet({
  onClose,
  visible,
}: AddPlaylistItemSheetProps) {
  const { controllerRemote, room, playlistItems } = useRoomSession();
  const { refresh } = useRoomActions();
  const roomId = controllerRemote?.roomId ?? room?.id ?? '';
  const [, roomFetcher] = useFetcher<ControllerRemoteData>({
    params: {
      controllerToken: controllerRemote?.controllerToken ?? '',
      id: controllerRemote?.id ?? '',
    },
    routeId: 'remotes.controller.$id',
  });
  const [targetRoom, setTargetRoom] = useState<RoomV2 | null>(room);
  const [targetPlaylistItemCount, setTargetPlaylistItemCount] = useState(
    playlistItems.length,
  );

  useEffect(() => {
    if (!controllerRemote?.roomId) {
      setTargetRoom(room);
      setTargetPlaylistItemCount(playlistItems.length);
      return;
    }
    const loadRoom = async () => {
      const result = await roomFetcher.load({
        params: {
          controllerToken: controllerRemote.controllerToken,
          id: controllerRemote.id,
        },
      });
      const snapshot = result.data?.snapshot;
      if (!snapshot) return;
      setTargetRoom(snapshot.room);
      setTargetPlaylistItemCount(snapshot.playlistItems.length);
    };
    void loadRoom();
  }, [
    controllerRemote?.controllerToken,
    controllerRemote?.id,
    controllerRemote?.roomId,
    room,
    roomFetcher.load,
    playlistItems.length,
  ]);

  if (!roomId) return null;

  const hasGenerationPermission =
    Boolean(targetRoom) &&
    (!targetRoom?.hasPassword || Boolean(targetRoom.isAdmin));
  const playlistItemCountCutoff =
    (targetRoom?.roomGenerationMaxExistingPlaylistItems ?? 0) + 1;
  const isAbovePlaylistItemLimit =
    targetPlaylistItemCount >= playlistItemCountCutoff;
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
  if (targetRoom && hasGenerationPermission && isAbovePlaylistItemLimit) {
    generationUnavailableReason = `AI fill is unavailable when the room has ${playlistItemCountCutoff} songs or more.`;
  }
  if (
    targetRoom &&
    hasGenerationPermission &&
    !isAbovePlaylistItemLimit &&
    targetRoom.isGenerating
  ) {
    generationUnavailableReason = 'A playlist is already being generated.';
  }
  if (
    targetRoom &&
    hasGenerationPermission &&
    !isAbovePlaylistItemLimit &&
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
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      supportedOrientations={[
        'portrait',
        'portrait-upside-down',
        'landscape',
        'landscape-left',
        'landscape-right',
      ]}
      visible={visible}
      onRequestClose={onClose}
    >
      <SearchSheet
        canGenerate={canGenerate}
        generationUnavailableReason={generationUnavailableReason}
        playlistImportAllowed={targetRoom?.settings.playlistImport ?? false}
        providersOverride={targetRoom?.settings.enabledSources ?? []}
        roomIdOverride={roomId}
        {...(controllerRemote
          ? {
              remoteCredentials: {
                controllerToken: controllerRemote.controllerToken,
                remoteId: controllerRemote.id,
              },
            }
          : {})}
        visible={visible}
        onAdded={refreshSession}
        onClose={onClose}
        onGenerated={refreshSession}
      />
    </Modal>
  );
}
