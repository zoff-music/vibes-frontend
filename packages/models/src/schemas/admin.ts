import * as yup from 'yup';

export const adminRoomSummarySchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  userCount: yup.number().required(),
  songCount: yup.number().required(),
  activeSources: yup.array(yup.string().required()).required(),
  hasAdminPassword: yup.boolean().required(),
});
export type AdminRoomSummary = yup.InferType<typeof adminRoomSummarySchema>;

export const adminRoomsSchema = yup.array(adminRoomSummarySchema).required();
export type AdminRooms = yup.InferType<typeof adminRoomsSchema>;

export const adminRoomResultSchema = yup.object({
  rooms: adminRoomsSchema,
  from: yup.number().required(),
  to: yup.number().required(),
  total: yup.number().required(),
  count: yup.number().required(),
});
export type AdminRoomResult = yup.InferType<typeof adminRoomResultSchema>;

export const adminRoomSearchSchema = yup.object({
  q: yup.string().optional(),
  sortBy: yup.string().oneOf(['listeners', 'songs']).optional(),
  order: yup.string().oneOf(['asc', 'desc']).optional(),
  from: yup.number().integer().min(0).optional(),
  to: yup.number().integer().min(0).optional(),
});

export const adminLoginRequestSchema = yup.object({
  password: yup.string().required(),
});
export type AdminLoginRequest = yup.InferType<typeof adminLoginRequestSchema>;

export const adminUpdateRoomRequestSchema = yup.object({
  name: yup.string().optional(),
  clearAdminPassword: yup.boolean().optional(),
});
export type AdminUpdateRoomRequest = yup.InferType<
  typeof adminUpdateRoomRequestSchema
>;

export const adminSessionResponseSchema = yup.object({
  authorized: yup.boolean().required(),
});
export type AdminSessionResponse = yup.InferType<
  typeof adminSessionResponseSchema
>;

export const adminSearchUsageSummarySchema = yup.object({
  window: yup.string().oneOf(['hour', 'day', 'week', 'month']).required(),
  provider: yup.string().required(),
  total: yup.number().required(),
  unique: yup.number().required(),
  cached: yup.number().required(),
  live: yup.number().required(),
});
export type AdminSearchUsageSummary = yup.InferType<
  typeof adminSearchUsageSummarySchema
>;

export const adminSearchUsageSchema = yup
  .object({
    summaries: yup.array(adminSearchUsageSummarySchema).required(),
    generatedAt: yup.string().required(),
  })
  .required();
export type AdminSearchUsage = yup.InferType<typeof adminSearchUsageSchema>;

export const listenerUsagePointSchema = yup.object({
  window: yup.string().oneOf(['hour', 'day', 'week', 'month']).required(),
  timestamp: yup.string().required(),
  listeners: yup.number().required(),
});
export type ListenerUsagePoint = yup.InferType<typeof listenerUsagePointSchema>;

export const adminListenerUsageSchema = yup
  .object({
    points: yup.array(listenerUsagePointSchema).required(),
    generatedAt: yup.string().required(),
  })
  .required();
export type AdminListenerUsage = yup.InferType<typeof adminListenerUsageSchema>;
