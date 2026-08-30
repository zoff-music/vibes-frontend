import { z } from 'zod';

export const castDeviceTypeSchema = z.compile(
  z.enum(['chromecast', 'airplay', 'dlna']),
);
export const castSessionStateSchema = z.compile(
  z.enum(['connecting', 'connected', 'syncing', 'error', 'disconnected']),
);

export const castDeviceSchema = z.compile(
  z.object({
    id: z.string(),
    name: z.string(),
    type: castDeviceTypeSchema,
    capabilities: z.array(z.string()).default([]),
    isAvailable: z.boolean(),
    lastSeen: z.date(),
  }),
);

export const castSessionSchema = z.compile(
  z.object({
    id: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: castDeviceTypeSchema,
    state: castSessionStateSchema,
    startedAt: z.date(),
    lastSyncAt: z.date().optional(),
    mediaSessionId: z.string().optional(),
  }),
);

export const mediaInfoSchema = z.compile(
  z.object({
    contentId: z.string(),
    contentType: z.string(),
    streamType: z.enum(['BUFFERED', 'LIVE']),
    metadata: z.object({
      title: z.string(),
      artist: z.string().optional(),
      albumArtist: z.string().optional(),
      albumName: z.string().optional(),
      images: z
        .array(
          z.object({
            url: z.string(),
            height: z.number().optional(),
            width: z.number().optional(),
          }),
        )
        .optional(),
    }),
    duration: z.number().optional(),
  }),
);

export const castErrorSchema = z.compile(
  z.object({
    code: z.string(),
    description: z.string(),
    details: z.unknown().optional(),
  }),
);

export const createCastingTokenRequestSchema = z.compile(
  z.object({ roomId: z.string() }),
);
export type CreateCastingTokenRequest = z.infer<
  typeof createCastingTokenRequestSchema
>;

export const castingTokenResponseSchema = z.compile(
  z.object({ token: z.string(), expiresAt: z.string(), roomId: z.string() }),
);
export type CastingTokenResponse = z.infer<typeof castingTokenResponseSchema>;

export const sseQuerySchema = z.compile(
  z.object({
    castReceiver: z.string().optional(),
    casterId: z.string().optional(),
    lastEventId: z.string().optional(),
  }),
);
