// Cast message types for communication between sender and receiver

import type { ResolvedColorScheme } from '@vibes/shared';

export type LocalCastMessage =
  | {
      action: 'receiverReady';
      timestamp: number;
    }
  | {
      action: 'updatePlayback';
      currentSong: {
        id: string;
        title: string;
        artist: string;
        sourceType: string;
        sourceId: string;
        thumbnailUrl?: string;
        duration?: number;
      };
      isPlaying: boolean;
      positionMs: number;
      queue: Array<{
        id: string;
        title: string;
        artist: string;
        sourceType: string;
        sourceId: string;
        thumbnailUrl?: string;
        duration?: number;
      }>;
      roomInfo: {
        name: string;
        participantCount: number;
      };
      timestamp: number;
    }
  | {
      action: 'joinRoom';
      roomId: string;
      castToken?: string;
      casterId?: string;
      sessionId?: string;
      theme: ResolvedColorScheme;
      timestamp: number;
    }
  | {
      action: 'updateTheme';
      theme: ResolvedColorScheme;
      timestamp: number;
    }
  | {
      action: 'updateQueue';
      queue: Array<{
        id: string;
        title: string;
        artist: string;
        sourceType: string;
        sourceId: string;
        thumbnailUrl?: string;
        duration?: number;
      }>;
      timestamp: number;
    }
  | {
      action: 'updateRoomInfo';
      roomInfo: {
        name: string;
        participantCount: number;
      };
      timestamp: number;
    }
  | {
      action: 'syncPlayback';
      isPlaying: boolean;
      positionMs: number;
      updatedAt: string;
      serverTimeMs: number;
      currentSong?: {
        id: string;
        title: string;
        artist: string;
        sourceType: string;
        sourceId: string;
        thumbnailUrl?: string;
        duration?: number;
      };
      timestamp: number;
    };
