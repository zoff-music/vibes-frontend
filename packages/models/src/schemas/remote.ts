import * as v from 'valibot';
import { objectInputSchema } from './object-input';

export const remotePairingRequestSchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    pairingToken: v.optional(v.string()),
    pairingCode: v.optional(v.string()),
  }),
);

export type RemotePairingRequest = v.InferOutput<
  typeof remotePairingRequestSchema
>;

export const remoteStatusV2Schema = /* @__PURE__ */ v.object({
  enabled: v.boolean(),
  id: v.optional(v.string(), ''),
  currentRoomId: v.optional(v.string(), ''),
  currentPlaylistItemId: v.optional(v.string(), ''),
  playbackPositionMs: v.optional(v.pipe(v.number(), v.finite()), 0),
  playbackIsPlaying: v.optional(v.boolean(), false),
  playbackObservedAt: v.optional(v.string(), ''),
  partyMode: v.optional(v.boolean(), false),
  online: v.boolean(),
  paired: v.optional(v.boolean(), false),
});

export type RemoteStatusV2 = v.InferOutput<typeof remoteStatusV2Schema>;

export const remoteSessionV2Schema = /* @__PURE__ */ v.object({
  ...remoteStatusV2Schema.entries,
  ...{
    controllerToken: v.string(),
  },
});

export type RemoteSessionV2 = v.InferOutput<typeof remoteSessionV2Schema>;

export const remotePairingV2Schema = /* @__PURE__ */ v.object({
  id: v.string(),
  currentRoomId: v.optional(v.string(), ''),
  currentPlaylistItemId: v.optional(v.string(), ''),
  playbackPositionMs: v.optional(v.pipe(v.number(), v.finite()), 0),
  playbackIsPlaying: v.optional(v.boolean(), false),
  playbackObservedAt: v.optional(v.string(), ''),
  partyMode: v.optional(v.boolean(), false),
  pairingExpiresAt: v.string(),
  lastSeenAt: v.string(),
  pairingToken: v.string(),
  pairingCode: v.string(),
});

export type RemotePairingV2 = v.InferOutput<typeof remotePairingV2Schema>;

export const remoteUpdateRequestV2Schema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    partyMode: v.optional(v.boolean()),
    roomId: v.optional(v.string()),
    currentPlaylistItemId: v.optional(v.string()),
    playbackPositionMs: v.optional(v.pipe(v.number(), v.finite())),
    playbackIsPlaying: v.optional(v.boolean()),
  }),
);

export type RemoteUpdateRequestV2 = v.InferOutput<
  typeof remoteUpdateRequestV2Schema
>;

export const remoteEventV2Schema = /* @__PURE__ */ v.object({
  type: v.picklist([
    'remote_room_update',
    'remote_state_update',
    'remote_presentation_update',
  ]),
  roomId: v.optional(v.string(), ''),
  origin: v.picklist(['machine', 'controller']),
  online: v.optional(v.boolean(), true),
  paired: v.optional(v.boolean(), false),
  currentPlaylistItemId: v.optional(v.string(), ''),
  playbackPositionMs: v.optional(v.pipe(v.number(), v.finite()), 0),
  playbackIsPlaying: v.optional(v.boolean(), false),
  playbackObservedAt: v.optional(v.string(), ''),
  partyMode: v.optional(v.boolean(), false),
});

export type RemoteEventV2 = v.InferOutput<typeof remoteEventV2Schema>;
