import * as z from 'zod/mini';

export const authorizationsListSchema = /* @__PURE__ */ z.compile(
  z.array(z.string()),
);

export type AuthorizationsList = z.infer<typeof authorizationsListSchema>;

export const providerTokenSchema = /* @__PURE__ */ z.compile(
  z.object({
    accessToken: z.string(),
    expiresAt: z.string(),
  }),
);

export type ProviderToken = z.infer<typeof providerTokenSchema>;
