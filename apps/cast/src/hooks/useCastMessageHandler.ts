import type { ResolvedColorScheme, Song } from '@vibes/shared';
import { getEstimatedServerTimeMs, usePlaybackStore } from '@vibes/shared';
import { useCallback } from 'react';
import type { LocalCastMessage, QueueItem, RoomInfo } from '../types';
import { normalizeSong } from '../utils/songUtils';

interface UseCastMessageHandlerProps {
  joinRoom: (connection: {
    castToken?: string;
    casterId?: string;
    roomId: string;
  }) => void;
  setRoomInfo: (info: RoomInfo | null) => void;
  setQueue: (queue: QueueItem[]) => void;
  setStatusText: (text: string) => void;
  updateMediaMetadata: (song: Song) => void;
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
      const currentSongId = currentState.currentSong?.id;
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
            const normalizedSong = normalizeSong(message.currentSong);
            const isSameSong = currentSongId === normalizedSong.id;

            // Prevent reset to 0 if we are already playing this song and have a position
            const shouldPreservePosition =
              isSameSong &&
              (!message.positionMs || message.positionMs === 0) &&
              currentActualPosition > 1000;
            const positionMs = shouldPreservePosition
              ? currentActualPosition
              : message.positionMs || 0;

            setPlaybackState(
              {
                currentSong: normalizedSong,
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
            updateMediaMetadata(normalizedSong);
          }
          if (
            action === 'updatePlayback' &&
            'roomInfo' in message &&
            message.roomInfo
          ) {
            setRoomInfo(message.roomInfo);
          }
          break;
        }

        case 'updateQueue':
          if (message.queue) {
            setQueue(message.queue.map((s) => normalizeSong(s)));
          }
          break;

        case 'updateRoomInfo':
          if (message.roomInfo) {
            setRoomInfo(message.roomInfo);
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
