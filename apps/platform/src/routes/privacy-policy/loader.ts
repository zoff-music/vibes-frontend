import type { Providers } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface PrivacyPolicyLoaderData {
  providers: Providers;
}

export async function privacyPolicyLoader({
  request,
}: LoaderFunctionArgs): Promise<PrivacyPolicyLoaderData> {
  const serverApi = getServerApi(request);
  const [err, providers] = await serverApi.get('/providers', null);
  if (err || !providers) {
    return { providers: [] };
  }

  return { providers };
}
