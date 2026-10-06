import type { PlaylistItem, ResolvedColorScheme } from '@vibes/shared';
import { getEstimatedServerTimeMs, usePlaybackStore } from '@vibes/shared';
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import type { LocalCastMessage, QueueItem, RoomInfo } from '../types';
import { toPlaylistItem } from '../utils/item';

interface UseCastMessageHandlerProps {
  joinRoom: (connection: {
    castToken?: string;
    casterId?: string;
    roomId: string;
  }) => void;
  setRoomInfo: Dispatch<SetStateAction<RoomInfo | null>>;
  setQueue: (queue: QueueItem[]) => void;
  setStatusText: (text: string) => void;
  updateMediaMetadata: (playlistItem: PlaylistItem) => void;
  roomMode: string | null;
  setColorScheme: (colorScheme: ResolvedColorScheme) => void;
}

export const useCastMessageHandler = ({
  joinRoom,
  setRoomInfo,
  setQueue,
  setStatusText,
  updateMediaMetadata,
  roomMode,
  setColorScheme,
}: UseCastMessageHandlerProps) => {
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);

  const handleCastMessage = useCallback(
    (message: LocalCastMessage) => {
      if (!message?.action) return;

      const action = message.action;
      const currentState = usePlaybackStore.getState();
      const currentPlaylistItemId = currentState.currentPlaylistItem?.id;
      const currentActualPosition = currentState.actualPositionMs;

      switch (action) {
        case 'joinRoom': {
          const casterId = message.casterId || message.sessionId || undefined;
          joinRoom({
            roomId: message.roomId,
            ...(message.castToken ? { castToken: message.castToken } : {}),
            ...(casterId ? { casterId } : {}),
          });
          if (message.theme) {
            setColorScheme(message.theme);
          }
          break;
        }

        case 'updateTheme':
          setColorScheme(message.theme);
          break;

        case 'updatePlayback':
        case 'syncPlayback': {
          if (message.currentSong) {
            const normalizedPlaylistItem = toPlaylistItem(message.currentSong);
            const isSamePlaylistItem =
              currentPlaylistItemId === normalizedPlaylistItem.id;

            // Prevent reset to 0 if we are already playing this song and have a position
            const shouldPreservePosition =
              isSamePlaylistItem &&
              (!message.positionMs || message.positionMs === 0) &&
              currentActualPosition > 1000;
            const positionMs = shouldPreservePosition
              ? currentActualPosition
              : message.positionMs || 0;

            setPlaybackState(
              {
                currentPlaylistItem: normalizedPlaylistItem,
                isPlaying: message.isPlaying || false,
                positionMs: positionMs,
                updatedAt: message.updatedAt || new Date().toISOString(),
                serverTimeMs:
                  message.serverTimeMs || getEstimatedServerTimeMs(),
              },
              roomMode || undefined,
            );
            setIsPlaying(message.isPlaying || false);

            if (action === 'updatePlayback') {
              setStatusText(`Now Playing: ${message.currentSong.title}`);
            }
            updateMediaMetadata(normalizedPlaylistItem);
          }
          if (
            action === 'updatePlayback' &&
            'roomInfo' in message &&
            message.roomInfo
          ) {
            const roomInfo = message.roomInfo;
            setRoomInfo((current) => ({
              ...roomInfo,
              roomType: current?.roomType ?? roomInfo.roomType ?? 'MUSIC',
            }));
          }
          break;
        }

        case 'updateQueue':
          if (message.queue) {
            setQueue(message.queue.map((item) => toPlaylistItem(item)));
          }
          break;

        case 'updateRoomInfo':
          if (message.roomInfo) {
            const roomInfo = message.roomInfo;
            setRoomInfo((current) => ({
              ...roomInfo,
              roomType: current?.roomType ?? roomInfo.roomType ?? 'MUSIC',
            }));
          }
          break;

        default:
          break;
      }
    },
    [
      roomMode,
      setIsPlaying,
      setPlaybackState,
      updateMediaMetadata,
      joinRoom,
      setRoomInfo,
      setQueue,
      setStatusText,
      setColorScheme,
    ],
  );

  return handleCastMessage;
};
