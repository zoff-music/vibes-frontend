import type * as z from 'zod/mini';
import {
  castDeviceSchema,
  castDeviceTypeSchema,
  castErrorSchema,
  castSessionSchema,
  castSessionStateSchema,
  mediaInfoSchema,
} from '../schemas/casting';
import type { PlaybackStateV2 } from '../schemas/playback';
import type { PlaylistItem } from '../schemas/playlist';

// Inferred Types
export type CastDeviceType = z.infer<typeof castDeviceTypeSchema>;

export type CastSessionState = z.infer<typeof castSessionStateSchema>;

export type CastDevice = z.infer<typeof castDeviceSchema>;

export type CastSession = z.infer<typeof castSessionSchema>;

export type MediaInfo = z.infer<typeof mediaInfoSchema>;

export type CastError = Omit<z.infer<typeof castErrorSchema>, 'details'> & {
  details?: unknown;
};

/** Display metadata sent to the receiver. */
export interface CastRoomInfo {
  name: string;
  participantCount: number;
}

/** Room credentials passed to a Cast receiver. */
export interface CastRoomConnection {
  castToken?: string;
  casterId?: string;
  roomId: string;
}

// Interfaces (Non-schema types)
export interface CastManager {
  // Device Discovery
  discoverDevices(): Promise<CastDevice[]>;
  getAvailableDevices(): CastDevice[];

  // Connection Management
  connectToDevice(deviceId: string): Promise<CastSession>;
  disconnectFromDevice(deviceId: string): Promise<void>;

  // Playback Control
  castMedia(mediaInfo: MediaInfo, playlistItem: PlaylistItem): Promise<void>;
  updateQueue(queue: PlaylistItem[]): Promise<void>;
  updateRoomInfo(roomInfo: CastRoomInfo): Promise<void>;
  syncPlaybackState(state: PlaybackStateV2): Promise<void>;
  joinRoom(roomId: string, castToken: string): Promise<void>;

  // Event Handling
  onDeviceAvailable(callback: (device: CastDevice) => void): void;
  onSessionStateChange(callback: (session: CastSession) => void): void;
  onCastError(callback: (error: CastError) => void): void;
}
