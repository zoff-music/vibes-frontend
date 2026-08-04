import type { ResolvedColorScheme, Song } from '@vibes/shared';

export interface RoomInfo {
  name: string;
  participantCount: number;
}

export type QueueItem = Song;

export type LocalCastMessage =
  | {
      action: 'receiverReady';
      timestamp: number;
    }
  | {
      action: 'updatePlayback';
      currentSong?: QueueItem;
      isPlaying?: boolean;
      positionMs?: number;
      updatedAt?: string;
      serverTimeMs?: number;
      queue?: QueueItem[];
      roomInfo?: RoomInfo;
    }
  | {
      action: 'syncPlayback';
      currentSong?: QueueItem;
      isPlaying?: boolean;
      positionMs?: number;
      updatedAt?: string;
      serverTimeMs?: number;
    }
  | {
      action: 'updateQueue';
      queue?: QueueItem[];
    }
  | {
      action: 'updateRoomInfo';
      roomInfo?: RoomInfo;
    }
  | {
      action: 'joinRoom';
      roomId: string;
      castToken?: string;
      casterId?: string;
      sessionId?: string;
      theme?: ResolvedColorScheme;
    }
  | {
      action: 'updateTheme';
      theme: ResolvedColorScheme;
    };
