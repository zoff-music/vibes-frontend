import * as z from 'zod/mini';

export const castDeviceTypeSchema = /* @__PURE__ */ z.compile(
  z.enum(['chromecast', 'airplay', 'dlna']),
);
export const castSessionStateSchema = /* @__PURE__ */ z.compile(
  z.enum(['connecting', 'connected', 'syncing', 'error', 'disconnected']),
);

export const castDeviceSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    type: castDeviceTypeSchema,
    capabilities: z._default(z.array(z.string()), []),
    isAvailable: z.boolean(),
    lastSeen: z.date(),
  }),
);

export const castSessionSchema = /* @__PURE__ */ z.compile(
  z.object({
    id: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: castDeviceTypeSchema,
    state: castSessionStateSchema,
    startedAt: z.date(),
    lastSyncAt: z.optional(z.date()),
    mediaSessionId: z.optional(z.string()),
  }),
);

export const mediaInfoSchema = /* @__PURE__ */ z.compile(
  z.object({
    contentId: z.string(),
    contentType: z.string(),
    streamType: z.enum(['BUFFERED', 'LIVE']),
    metadata: z.object({
      title: z.string(),
      artist: z.optional(z.string()),
      albumArtist: z.optional(z.string()),
      albumName: z.optional(z.string()),
      images: z.optional(
        z.array(
          z.object({
            url: z.string(),
            height: z.optional(z.number()),
            width: z.optional(z.number()),
          }),
        ),
      ),
    }),
    duration: z.optional(z.number()),
  }),
);

export const castErrorSchema = /* @__PURE__ */ z.compile(
  z.object({
    code: z.string(),
    description: z.string(),
    details: z.optional(z.unknown()),
  }),
);

export const createCastingTokenRequestSchema = /* @__PURE__ */ z.compile(
  z.object({
    roomId: z.string(),
  }),
);

export type CreateCastingTokenRequest = z.infer<
  typeof createCastingTokenRequestSchema
>;

export const castingTokenResponseSchema = /* @__PURE__ */ z.compile(
  z.object({
    token: z.string(),
    expiresAt: z.string(),
    roomId: z.string(),
  }),
);

export type CastingTokenResponse = z.infer<typeof castingTokenResponseSchema>;

export const sseQuerySchema = /* @__PURE__ */ z.compile(
  z.object({
    castReceiver: z.optional(z.string()),
    casterId: z.optional(z.string()),
    lastEventId: z.optional(z.string()),
  }),
);

export const optionalSseQuerySchema = /* @__PURE__ */ z.compile(
  z.optional(sseQuerySchema),
);
