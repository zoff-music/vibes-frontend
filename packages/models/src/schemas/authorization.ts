import { z } from 'zod';

export const authorizationsListSchema = z.compile(z.array(z.string()));
export type AuthorizationsList = z.infer<typeof authorizationsListSchema>;

export const providerTokenSchema = z.compile(
  z.object({ accessToken: z.string(), expiresAt: z.string() }),
);
export type ProviderToken = z.infer<typeof providerTokenSchema>;
