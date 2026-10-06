import type { RoomType, Song } from '@vibes/models';
import type { PlaylistItem, ResolvedColorScheme } from '@vibes/shared';

export interface RoomInfo {
  roomType?: RoomType;
  name: string;
  participantCount: number;
}

export type QueueItem = PlaylistItem;

export type LocalCastMessage =
  | {
      action: 'receiverReady';
      timestamp: number;
    }
  | {
      action: 'updatePlayback';
      currentSong?: Song;
      isPlaying?: boolean;
      positionMs?: number;
      updatedAt?: string;
      serverTimeMs?: number;
      queue?: Song[];
      roomInfo?: RoomInfo;
    }
  | {
      action: 'syncPlayback';
      currentSong?: Song;
      isPlaying?: boolean;
      positionMs?: number;
      updatedAt?: string;
      serverTimeMs?: number;
    }
  | {
      action: 'updateQueue';
      queue?: Song[];
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
