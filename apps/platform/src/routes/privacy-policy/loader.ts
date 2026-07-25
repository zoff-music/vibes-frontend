import type { Providers } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getPublicContactEmails } from '../../config.server';
import { getServerApi } from '../../http.server';

export interface PrivacyPolicyLoaderData {
  privacyEmail: string;
  providers: Providers;
}

export async function privacyPolicyLoader({
  request,
}: LoaderFunctionArgs): Promise<PrivacyPolicyLoaderData> {
  const emails = getPublicContactEmails();
  if (!emails.privacy) {
    throw new Error('PRIVACY_EMAIL is required');
  }

  const serverApi = getServerApi(request);
  const [err, providers] = await serverApi.get('/providers', null);
  if (err || !providers) {
    return {
      privacyEmail: emails.privacy,
      providers: [],
    };
  }

  return {
    privacyEmail: emails.privacy,
    providers,
  };
}
