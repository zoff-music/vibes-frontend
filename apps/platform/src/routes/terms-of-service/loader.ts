import type { Providers } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface TermsOfServiceLoaderData {
  providers: Providers;
}

export async function termsOfServiceLoader({
  request,
}: LoaderFunctionArgs): Promise<TermsOfServiceLoaderData> {
  const serverApi = getServerApi(request);
  const [err, providers] = await serverApi.get('/providers', null);
  if (err || !providers) {
    return { providers: [] };
  }

  return { providers };
}
