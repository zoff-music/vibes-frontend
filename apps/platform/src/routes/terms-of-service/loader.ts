import type { Providers } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getPublicContactEmails } from '../../config.server';
import { getServerApi } from '../../http.server';

export interface TermsOfServiceLoaderData {
  contactEmail: string;
  providers: Providers;
}

export async function termsOfServiceLoader({
  request,
}: LoaderFunctionArgs): Promise<TermsOfServiceLoaderData> {
  const emails = getPublicContactEmails();
  if (!emails.contact) {
    throw new Error('CONTACT_EMAIL is required');
  }

  const serverApi = getServerApi(request);
  const [err, providers] = await serverApi.get('/providers', null);
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
