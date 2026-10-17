import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { createProvidersRequest } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { getServerApi } from '../../http.server';
import { getPublicContactEmails } from '../../utils/public-config.server';

export interface TermsOfServiceLoaderData {
  contactEmail: string;
  providers: Providers;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<TermsOfServiceLoaderData> {
  const emails = getPublicContactEmails();

  if (!emails.contact) {
    throw new Error('CONTACT_EMAIL is required');
  }

  const serverApi = getServerApi(request);
  const getProviders = createProvidersRequest(serverApi);
  const [err, providers] = await getProviders({ signal: request.signal });

  if (err || !providers) {
    return {
      contactEmail: emails.contact,
      providers: [],
    };
  }

  return {
    contactEmail: emails.contact,
    providers,
  };
}

export { loader as termsOfServiceLoader };
