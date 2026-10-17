import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { createProvidersRequest } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { getServerApi } from '../../http.server';
import { getPublicContactEmails } from '../../utils/public-config.server';

export interface PrivacyPolicyLoaderData {
  privacyEmail: string;
  providers: Providers;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<PrivacyPolicyLoaderData> {
  const emails = getPublicContactEmails();

  if (!emails.privacy) {
    throw new Error('PRIVACY_EMAIL is required');
  }

  const serverApi = getServerApi(request);
  const getProviders = createProvidersRequest(serverApi);
  const [err, providers] = await getProviders({ signal: request.signal });

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

export { loader as privacyPolicyLoader };
