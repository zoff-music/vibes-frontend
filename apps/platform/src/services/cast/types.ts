// Cast message types for communication between sender and receiver

import type { PlaylistItem } from '@vibes/models';
import type { ResolvedColorScheme } from '@vibes/shared';

export type LocalCastMessage =
  | {
      action: 'receiverReady';
      timestamp: number;
    }
  | {
      action: 'updatePlayback';
      currentSong: PlaylistItem;
      isPlaying: boolean;
      positionMs: number;
      queue: PlaylistItem[];
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
      queue: PlaylistItem[];
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
      currentSong?: PlaylistItem | null;
      timestamp: number;
    };
