import * as yup from 'yup';

export const authorizationsListSchema = yup
  .array(yup.string().required())
  .required();
export type AuthorizationsList = yup.InferType<typeof authorizationsListSchema>;

export const providerTokenSchema = yup.object({
  accessToken: yup.string().required(),
  expiresAt: yup.string().required(),
});
export type ProviderToken = yup.InferType<typeof providerTokenSchema>;
