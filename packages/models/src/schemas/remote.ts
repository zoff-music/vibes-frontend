import * as yup from 'yup';

export const remoteStatusSchema = yup.object({
  enabled: yup.boolean().required(),
  id: yup.string().default(''),
  currentRoomId: yup.string().default(''),
  online: yup.boolean().required(),
});
export type RemoteStatus = yup.InferType<typeof remoteStatusSchema>;

export const remotePairingSchema = yup.object({
  id: yup.string().required(),
  currentRoomId: yup.string().default(''),
  pairingExpiresAt: yup.string().required(),
  lastSeenAt: yup.string().required(),
  pairingToken: yup.string().required(),
  pairingCode: yup.string().required(),
});
export type RemotePairing = yup.InferType<typeof remotePairingSchema>;

export const remotePairingRequestSchema = yup.object({
  pairingToken: yup.string().optional(),
  pairingCode: yup.string().optional(),
});
export type RemotePairingRequest = yup.InferType<
  typeof remotePairingRequestSchema
>;

export const remoteUpdateRequestSchema = yup.object({
  roomId: yup.string().default(''),
});
export type RemoteUpdateRequest = yup.InferType<
  typeof remoteUpdateRequestSchema
>;

export const remoteEventSchema = yup.object({
  type: yup.string().oneOf(['remote_room_update']).required(),
  roomId: yup.string().default(''),
  origin: yup.string().oneOf(['machine', 'controller']).required(),
});
export type RemoteEvent = yup.InferType<typeof remoteEventSchema>;
