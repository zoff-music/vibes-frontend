import { z } from 'zod';

const remoteStatusShape = {
  enabled: z.boolean(),
  id: z.string().default(''),
  currentRoomId: z.string().default(''),
  currentSongId: z.string().default(''),
  playbackPositionMs: z.number().default(0),
  playbackIsPlaying: z.boolean().default(false),
  playbackObservedAt: z.string().default(''),
  online: z.boolean(),
  paired: z.boolean().default(false),
};

export const remoteStatusSchema = z.compile(z.object(remoteStatusShape));
export type RemoteStatus = z.infer<typeof remoteStatusSchema>;

export const remoteSessionSchema = z.compile(
  z.object({ ...remoteStatusShape, controllerToken: z.string() }),
);
export type RemoteSession = z.infer<typeof remoteSessionSchema>;

export const remotePairingSchema = z.compile(
  z.object({
    id: z.string(),
    currentRoomId: z.string().default(''),
    currentSongId: z.string().default(''),
    playbackPositionMs: z.number().default(0),
    playbackIsPlaying: z.boolean().default(false),
    playbackObservedAt: z.string().default(''),
    pairingExpiresAt: z.string(),
    lastSeenAt: z.string(),
    pairingToken: z.string(),
    pairingCode: z.string(),
  }),
);
export type RemotePairing = z.infer<typeof remotePairingSchema>;

export const remotePairingRequestSchema = z.compile(
  z.object({
    pairingToken: z.string().optional(),
    pairingCode: z.string().optional(),
  }),
);
export type RemotePairingRequest = z.infer<typeof remotePairingRequestSchema>;

export const remoteUpdateRequestSchema = z.compile(
  z.object({
    roomId: z.string().optional(),
    currentSongId: z.string().optional(),
    playbackPositionMs: z.number().optional(),
    playbackIsPlaying: z.boolean().optional(),
  }),
);
export type RemoteUpdateRequest = z.infer<typeof remoteUpdateRequestSchema>;

export const remoteEventSchema = z.compile(
  z.object({
    type: z.enum(['remote_room_update', 'remote_state_update']),
    roomId: z.string().default(''),
    origin: z.enum(['machine', 'controller']),
    online: z.boolean().default(true),
    paired: z.boolean().default(false),
    currentSongId: z.string().default(''),
    playbackPositionMs: z.number().default(0),
    playbackIsPlaying: z.boolean().default(false),
    playbackObservedAt: z.string().default(''),
  }),
);
export type RemoteEvent = z.infer<typeof remoteEventSchema>;
