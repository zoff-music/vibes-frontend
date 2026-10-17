import * as v from 'valibot';

export const authorizationsListSchema = /* @__PURE__ */ v.array(v.string());

export type AuthorizationsList = v.InferOutput<typeof authorizationsListSchema>;

export const providerTokenSchema = /* @__PURE__ */ v.object({
  accessToken: v.string(),
  expiresAt: v.string(),
});

export type ProviderToken = v.InferOutput<typeof providerTokenSchema>;
