import { z } from 'zod';

export const remotePairingRequestSchema = z.compile(
  z.object({
    pairingToken: z.string().optional(),
    pairingCode: z.string().optional(),
  }),
);
export type RemotePairingRequest = z.infer<typeof remotePairingRequestSchema>;

export const remoteStatusV2Schema = z.compile(
  z.object({
    enabled: z.boolean(),
    id: z.string().default(''),
    currentRoomId: z.string().default(''),
    currentPlaylistItemId: z.string().default(''),
    playbackPositionMs: z.number().default(0),
    playbackIsPlaying: z.boolean().default(false),
    playbackObservedAt: z.string().default(''),
    online: z.boolean(),
    paired: z.boolean().default(false),
  }),
);
export type RemoteStatusV2 = z.infer<typeof remoteStatusV2Schema>;

export const remoteSessionV2Schema = z.compile(
  remoteStatusV2Schema.extend({ controllerToken: z.string() }),
);
export type RemoteSessionV2 = z.infer<typeof remoteSessionV2Schema>;

export const remotePairingV2Schema = z.compile(
  z.object({
    id: z.string(),
    currentRoomId: z.string().default(''),
    currentPlaylistItemId: z.string().default(''),
    playbackPositionMs: z.number().default(0),
    playbackIsPlaying: z.boolean().default(false),
    playbackObservedAt: z.string().default(''),
    pairingExpiresAt: z.string(),
    lastSeenAt: z.string(),
    pairingToken: z.string(),
    pairingCode: z.string(),
  }),
);
export type RemotePairingV2 = z.infer<typeof remotePairingV2Schema>;

export const remoteUpdateRequestV2Schema = z.compile(
  z.object({
    roomId: z.string().optional(),
    currentPlaylistItemId: z.string().optional(),
    playbackPositionMs: z.number().optional(),
    playbackIsPlaying: z.boolean().optional(),
  }),
);
export type RemoteUpdateRequestV2 = z.infer<typeof remoteUpdateRequestV2Schema>;

export const remoteEventV2Schema = z.compile(
  z.object({
    type: z.enum(['remote_room_update', 'remote_state_update']),
    roomId: z.string().default(''),
    origin: z.enum(['machine', 'controller']),
    online: z.boolean().default(true),
    paired: z.boolean().default(false),
    currentPlaylistItemId: z.string().default(''),
    playbackPositionMs: z.number().default(0),
    playbackIsPlaying: z.boolean().default(false),
    playbackObservedAt: z.string().default(''),
  }),
);
export type RemoteEventV2 = z.infer<typeof remoteEventV2Schema>;
