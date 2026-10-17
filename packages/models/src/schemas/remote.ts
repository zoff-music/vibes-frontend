import * as z from 'zod/mini';

export const remotePairingRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    pairingToken: z.optional(z.string()),
    pairingCode: z.optional(z.string()),
  }),
);

export type RemotePairingRequest = z.infer<typeof remotePairingRequestSchema>;

export const remoteStatusV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    enabled: z.boolean(),
    id: z._default(z.string(), ''),
    currentRoomId: z._default(z.string(), ''),
    currentPlaylistItemId: z._default(z.string(), ''),
    playbackPositionMs: z._default(z.number(), 0),
    playbackIsPlaying: z._default(z.boolean(), false),
    playbackObservedAt: z._default(z.string(), ''),
    partyMode: z._default(z.boolean(), false),
    online: z.boolean(),
    paired: z._default(z.boolean(), false),
  }),
);

export type RemoteStatusV2 = z.infer<typeof remoteStatusV2Schema>;

export const remoteSessionV2Schema = /* @__PURE__ */ z.compile(
  z.extend(remoteStatusV2Schema, {
    controllerToken: z.string(),
  }),
);

export type RemoteSessionV2 = z.infer<typeof remoteSessionV2Schema>;

export const remotePairingV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    currentRoomId: z._default(z.string(), ''),
    currentPlaylistItemId: z._default(z.string(), ''),
    playbackPositionMs: z._default(z.number(), 0),
    playbackIsPlaying: z._default(z.boolean(), false),
    playbackObservedAt: z._default(z.string(), ''),
    partyMode: z._default(z.boolean(), false),
    pairingExpiresAt: z.string(),
    lastSeenAt: z.string(),
    pairingToken: z.string(),
    pairingCode: z.string(),
  }),
);

export type RemotePairingV2 = z.infer<typeof remotePairingV2Schema>;

export const remoteUpdateRequestV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    partyMode: z.optional(z.boolean()),
    roomId: z.optional(z.string()),
    currentPlaylistItemId: z.optional(z.string()),
    playbackPositionMs: z.optional(z.number()),
    playbackIsPlaying: z.optional(z.boolean()),
  }),
);

export type RemoteUpdateRequestV2 = z.infer<typeof remoteUpdateRequestV2Schema>;

export const remoteEventV2Schema = /* @__PURE__ */ z.compile(
  z.object({
    type: z.enum([
      'remote_room_update',
      'remote_state_update',
      'remote_presentation_update',
    ]),
    roomId: z._default(z.string(), ''),
    origin: z.enum(['machine', 'controller']),
    online: z._default(z.boolean(), true),
    paired: z._default(z.boolean(), false),
    currentPlaylistItemId: z._default(z.string(), ''),
    playbackPositionMs: z._default(z.number(), 0),
    playbackIsPlaying: z._default(z.boolean(), false),
    playbackObservedAt: z._default(z.string(), ''),
    partyMode: z._default(z.boolean(), false),
  }),
);

export type RemoteEventV2 = z.infer<typeof remoteEventV2Schema>;
