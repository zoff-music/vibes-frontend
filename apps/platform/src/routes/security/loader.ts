import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getPublicContactEmails } from '../../utils/public-config.server';

export interface SecurityLoaderData {
  securityEmail: string;
}

export async function loader(
  _args: LoaderFunctionArgs,
): Promise<SecurityLoaderData> {
  const emails = getPublicContactEmails();

  if (!emails.security) {
    throw new Error('SECURITY_EMAIL is required');
  }

  return { securityEmail: emails.security };
}

export type SecurityData = Awaited<ReturnType<typeof loader>>;

export { loader as securityLoader };
