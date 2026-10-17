import * as v from 'valibot';
import { objectInputSchema } from './object-input';

export const castDeviceTypeSchema = /* @__PURE__ */ v.picklist([
  'chromecast',
  'airplay',
  'dlna',
]);
export const castSessionStateSchema = /* @__PURE__ */ v.picklist([
  'connecting',
  'connected',
  'syncing',
  'error',
  'disconnected',
]);

export const castDeviceSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  name: v.string(),
  type: castDeviceTypeSchema,
  capabilities: v.optional(v.array(v.string()), []),
  isAvailable: v.boolean(),
  lastSeen: v.date(),
});

export const castSessionSchema = /* @__PURE__ */ v.object({
  id: v.string(),
  deviceId: v.string(),
  deviceName: v.string(),
  deviceType: castDeviceTypeSchema,
  state: castSessionStateSchema,
  startedAt: v.date(),
  lastSyncAt: v.optional(v.date()),
  mediaSessionId: v.optional(v.string()),
});

export const mediaInfoSchema = /* @__PURE__ */ v.object({
  contentId: v.string(),
  contentType: v.string(),
  streamType: v.picklist(['BUFFERED', 'LIVE']),
  metadata: v.object({
    title: v.string(),
    artist: v.optional(v.string()),
    albumArtist: v.optional(v.string()),
    albumName: v.optional(v.string()),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          height: v.optional(v.pipe(v.number(), v.finite())),
          width: v.optional(v.pipe(v.number(), v.finite())),
        }),
      ),
    ),
  }),
  duration: v.optional(v.pipe(v.number(), v.finite())),
});

export const castErrorSchema = /* @__PURE__ */ v.object({
  code: v.string(),
  description: v.string(),
  details: v.optional(v.unknown()),
});

export const createCastingTokenRequestSchema = /* @__PURE__ */ v.object({
  roomId: v.string(),
});

export type CreateCastingTokenRequest = v.InferOutput<
  typeof createCastingTokenRequestSchema
>;

export const castingTokenResponseSchema = /* @__PURE__ */ v.object({
  token: v.string(),
  expiresAt: v.string(),
  roomId: v.string(),
});

export type CastingTokenResponse = v.InferOutput<
  typeof castingTokenResponseSchema
>;

export const sseQuerySchema = /* @__PURE__ */ v.pipe(
  objectInputSchema,
  v.object({
    castReceiver: v.optional(v.string()),
    casterId: v.optional(v.string()),
    lastEventId: v.optional(v.string()),
  }),
);

export const optionalSseQuerySchema = /* @__PURE__ */ v.optional(
  sseQuerySchema,
);
